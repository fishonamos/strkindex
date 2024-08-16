import { ApolloServer, gql } from 'apollo-server';
import * as dotenv from 'dotenv';
import { connectedtodb } from './db/dbconfig';

dotenv.config();

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
      if (!collection) {
        throw new Error('Database connection not established');
      }
      try {
        return await collection.find({})
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
      } catch (error) {
        console.error('Error fetching accounts:', error);
        throw new Error('Failed to fetch accounts');
      }
    },
    getAccountByGuardian: async (_: any, { guardian }: any, { collection }: any) => {
      if (!collection) {
        throw new Error('Database connection not established');
      }
      try {
        return await collection.findOne({ guardian });
      } catch (error) {
        console.error('Error fetching account by guardian:', error);
        throw new Error('Failed to fetch account by guardian');
      }
    },
    getAccountByOwner: async (_: any, { owner }: any, { collection }: any) => {
      if (!collection) {
        throw new Error('Database connection not established');
      }
      try {
        return await collection.findOne({ owner });
      } catch (error) {
        console.error('Error fetching account by owner:', error);
        throw new Error('Failed to fetch account by owner');
      }
    },
  },
};

async function startServer() {
  try {
    const { collection } = await connectedtodb();
    if (!collection) {
      throw new Error('Failed to connect to the database');
    }

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => ({ collection }),
    });

    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
      //console.log(`Connected to MongoDB at ${process.env.MONGODB_URI}`);
    });
  } catch (error) {
    console.error('Failed to start GraphQL server', error);
  }
}

startServer();
