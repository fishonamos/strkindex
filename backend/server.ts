import { ApolloServer } from 'apollo-server-express';
import * as dotenv from 'dotenv';
import { connectedtodb } from './db/dbconfig';
import { typeDefs } from './models/schema';
import { resolvers } from './resolvers/resolvers';
import express from 'express';
import path from 'path';

dotenv.config();
const port = process.env.PORT || 4000;

const app = express();

// Serve the custom landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

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

    await server.start(); // Start the Apollo Server
    server.applyMiddleware({ app }); 

    app.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error('Failed to start GraphQL server', error);
  }
}

// Invoke the function to start the server
startServer();
