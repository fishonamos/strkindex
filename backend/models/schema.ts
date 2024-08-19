import { gql } from 'apollo-server'

//GraphQL schema using SDL
export const typeDefs = gql`
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