import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

const DATABASE_NAME = "starknet";
const COLLECTION_NAME = "events";

let mongoClient: MongoClient | null = null;

export async function connectedtodb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
 }
  const db = mongoClient.db(DATABASE_NAME);
  const collection = db.collection(COLLECTION_NAME);
  return { mongoClient, collection };
}
