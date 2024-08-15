import { ApolloServer, gql } from 'apollo-server';
import * as dotenv from 'dotenv';
import { connectedtodb } from './dbconfig';

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

  const { collection } = await connectedtodb();

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
