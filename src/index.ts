import { StreamClient } from "@apibara/protocol";
import {
  Filter,
  StarkNetCursor,
  v1alpha2,
  FieldElement,
} from "@apibara/starknet";
import { MongoClient } from "mongodb";
import { Provider, constants } from "starknet";
import * as dotenv from "dotenv";
import { connectedtodb } from "./dbconfig";

async function main() {
  const collection = await connectedtodb();
  const client = new StreamClient({
    url: "https://sepolia.starknet.a5a.ch",
    token: process.env.APIBARA_TOKEN,
    async onReconnect(err, retryCount) {
      console.log("reconnect", err, retryCount);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { reconnect: true };
    },
  });

  const provider = new Provider({
    nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/",
    chainId: constants.StarknetChainId.SN_SEPOLIA,
  });

  const { block_number } = await provider.getBlockLatestAccepted();
  const eventKey = FieldElement.fromBigInt(
    BigInt("0xf1234567890abcdef1234567890abcdef1234567890abcdef")
  );
  const contractAddress = FieldElement.fromBigInt(
    BigInt("0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f")
  );

  const filter = Filter.create()
    .withHeader({ weak: false })
    .addEvent((ev) => ev.withFromAddress(contractAddress).withKeys([eventKey]))
    .encode();

  client.configure({
    filter,
    batchSize: 1,
    cursor: StarkNetCursor.createWithBlockNumber(block_number),
  });

  for await (const message of client) {
    switch (message.message) {
      case "data": {
        if (!message.data?.data) {
          continue;
        }
        for (const data of message.data.data) {
          const block = v1alpha2.Block.decode(data);
          const { header, events } = block;
          if (!header) continue;

          for (const event of events) {
            if (event.event) {
              await handleEvent(header, event.event, collection);
            }
          }
        }
        break;
      }
      case "invalidate":
      case "heartbeat":
        break;
    }
  }
}

export async function handleEvent(
  header: v1alpha2.IBlockHeader,
  event: v1alpha2.IEvent,
  collection: any
) {
  if (!event.data) return;

  const ownerAddress = FieldElement.toHex(event.data[0]);
  const guardianAddress = FieldElement.toHex(event.data[1]);

  const eventData = {
    owner: ownerAddress,
    guardian: guardianAddress,
    blockNumber: header.blockNumber,
    blockTimestamp: header.timestamp?.seconds?.toString(),
    //transactionHash: FieldElement.toHex(event.receipt?.transactionHash ?? FieldElement.fromBigInt(BigInt(0))),
  };

  await collection.insertOne(eventData);
  console.log("Event data saved to MongoDB:", eventData);
}

main()
  .then(() => console.log("Indexer running"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
