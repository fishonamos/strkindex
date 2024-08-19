import { StreamClient } from "@apibara/protocol";
import { RpcProvider, constants } from "starknet";
import { FieldElement } from "@apibara/starknet";

 
 // APIBARA Stream Client Configuration
  export const client = new StreamClient({
    url: "mainnet.starknet.a5a.ch", 
    token: process.env.APIBARA_TOKEN,
    async onReconnect(err, retryCount) {
      // Handling reconnections
      console.log("Reconnecting...", err, retryCount);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { reconnect: true };
    },
  });
  
  // StarkNet RPC provider
  export const provider = new RpcProvider({
    nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/",
    chainId: constants.StarknetChainId.SN_MAIN
  });

    // Define the event key for filtering events based on event signature
    export const eventKey = FieldElement.fromBigInt(
        BigInt("0x00ee59834e6bbedb5dc7d363bc13b42ac655d67bd871dea6c2f75f281c42d0ff")
      );
    
      // Define the contract address from which to listen to events
      export const contractAddress = FieldElement.fromBigInt(
        BigInt("0x03d6b91fe45bfae46af10e08631448be318b5436a93e4ed2ef3a9de52c442f79")
      );