import { ApolloServer, gql } from 'apollo-server';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fishon:ScqLhbEZXakuxCeC@cluster0.pcf7bqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = "starknet";
const COLLECTION_NAME = "events";

const typeDefs = gql`
  type AccountEvent {
    owner: String!
    guardian: String!
    blockNumber: Int!
    blockTimestamp: String!
    transactionHash: String!
  }

  type Query {
    getAccounts(page: Int, limit: Int): [AccountEvent]
    getAccountByGuardian(guardian: String!): AccountEvent
    getAccountByOwner(owner: String!): AccountEvent
  }
`;

const resolvers = {
  Query: {
    getAccounts: async (_: any, { page = 1, limit = 10 }: any, { collection }: any) => {
      return await collection.find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
    },
    getAccountByGuardian: async (_: any, { guardian }: any, { collection }: any) => {
      return await collection.findOne({ guardian });
    },
    getAccountByOwner: async (_: any, { owner }: any, { collection }: any) => {
      return await collection.findOne({ owner });
    },
  },
};

async function startServer() {
  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db(DATABASE_NAME);
  const collection = db.collection(COLLECTION_NAME);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ collection }),
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start GraphQL server", error);
});
