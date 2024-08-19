import { StreamClient } from "@apibara/protocol";
import { RpcProvider, constants } from "starknet";

 
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