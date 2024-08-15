import { MongoClient } from "mongodb";
import { Provider, constants } from "starknet";
import * as dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fishon:ScqLhbEZXakuxCeC@cluster0.pcf7bqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = "starknet";
const COLLECTION_NAME = "events";

export async function connectedtodb() {
    const mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    return { mongoClient, collection };
  }