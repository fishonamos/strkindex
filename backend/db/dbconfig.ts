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
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      console.log("Connected to MongoDB");
    }
    const db = mongoClient.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.createIndex({ owner: 1 });
    await collection.createIndex({ guardian: 1 });

    return { mongoClient, collection };
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}
