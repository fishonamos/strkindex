import { StreamClient } from "@apibara/protocol";
import { Filter, StarkNetCursor, v1alpha2, FieldElement } from "@apibara/starknet";
import { connectedtodb } from './db/dbconfig';
import { RpcProvider, constants } from "starknet";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Starting the indexer...");

  //Connect to DB
  const { collection } = await connectedtodb();

  //APIBARA Stream Config
  const client = new StreamClient({
    url: "mainnet.starknet.a5a.ch",
    token: process.env.APIBARA_TOKEN,
    async onReconnect(err, retryCount) {
      console.log("Reconnecting...", err, retryCount);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { reconnect: true };
    },
  });
  
  //RPC Provider

  const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/",
    chainId: constants.StarknetChainId.SN_MAIN
  });

  const { block_number } = await provider.getBlockLatestAccepted();
  console.log(`Latest block number: ${block_number}`);

  const eventKey = FieldElement.fromBigInt(
    BigInt("0x00ee59834e6bbedb5dc7d363bc13b42ac655d67bd871dea6c2f75f281c42d0ff")
  );

  const contractAddress  = FieldElement.fromBigInt(
    BigInt("  0x03d6b91fe45bfae46af10e08631448be318b5436a93e4ed2ef3a9de52c442f79"));
  const filter = Filter.create()
    .withHeader({ weak: false })
    .addEvent((ev) => ev.withFromAddress(contractAddress).withKeys([eventKey]))
    .encode();

  client.configure({
    filter,
    batchSize: 1,
    cursor: StarkNetCursor.createWithBlockNumber(block_number - 10),
  });

  for await (const message of client) {
    switch (message.message) {
      case "data": {
        if (!message.data?.data) continue;
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

async function handleEvent(
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
  };

  await collection.insertOne(eventData);
  console.log("Event data saved to MongoDB:", eventData);
}

main()
  .then(() => console.log("Indexer running"))
  .catch((error) => {
    console.error("Indexer failed to start:", error);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  const { mongoClient } = await connectedtodb();
  if (mongoClient) {
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});