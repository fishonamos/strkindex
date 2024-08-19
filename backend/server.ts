import { ApolloServer} from 'apollo-server';
import * as dotenv from 'dotenv';
import { connectedtodb } from './db/dbconfig';
import { typeDefs } from './models/schema';
import {resolvers} from './resolvers/resolvers'

dotenv.config();

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
      context: async () => ({ collection }),
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
