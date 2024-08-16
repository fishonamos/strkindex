import { ApolloServer, gql } from 'apollo-server';
import * as dotenv from 'dotenv';
import { connectedtodb } from './db/dbconfig';

dotenv.config();

//GraphQL schema using SDL
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

// Define resolvers for the schema fields
const resolvers = {
  Query: {
    // Retrieves a paginated list of accounts
    getAccounts: async (_: any, { page = 1, limit = 10 }: any, { collection }: any) => {
      // Ensure database collection is available
      if (!collection) {
        throw new Error('Database connection not established');
      }
      try {
        // Retrieve and return accounts
        return await collection.find({})
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
      } catch (error) {
        console.error('Error fetching accounts:', error);
        throw new Error('Failed to fetch accounts');
      }
    },
    //Retrieves a single account by guardian
    getAccountByGuardian: async (_: any, { guardian }: any, { collection }: any) => {
      
      if (!collection) {
        throw new Error('Database connection not established');
      }
      try {
        // Find and return the account matching the guardian
        return await collection.findOne({ guardian });
      } catch (error) {
        console.error('Error fetching account by guardian:', error);
        throw new Error('Failed to fetch account by guardian');
      }
    },
    // Resolver for getAccountByOwner query - retrieves a single account by owner
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

// Start the Apollo Server
async function startServer() {
  try {
    const { collection } = await connectedtodb();
    if (!collection) {
      throw new Error('Failed to connect to the database');
    }

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => ({ collection }), // Pass the MongoDB collection to the context
    });

    server.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  } catch (error) {
    console.error('Failed to start GraphQL server', error);
  }
}

// Invoke the function to start the server
startServer();
