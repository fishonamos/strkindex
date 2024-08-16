```markdown``
# Starknet Blockchain Indexer

## Overview

This is a blockchain indexer that listens for AccountCreated event emmited by Argents Account Contrcat. It captures relevant owner and guardian owner, stores them in a MongoDB database, and exposes the indexed data through a GraphQL API. 

## Features

- **Blockchain Event Listener**
- **Data Storage**
- **GraphQL API**

## Project Structure

```plaintext
.
├── backend
│   ├── dbconfig.ts       # MongoDB configuration and connection logic
│   ├── indexer.ts        # Blockchain event listener and indexer logic
│   ├── server.ts         # GraphQL server setup and resolvers
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation
```

## Installation and Setup

### Prerequisites

- Node.js v16.x or later
- Yarn and npm
- MongoDB instance (local or cloud-based)
- Starknet node or access to an RPC provider

### Environment Variables

Create a `.env` file in the root directory of your project and populate it with the following variables:

```plaintext
MONGODB_URI=<Your MongoDB connection string>
APIBARA_TOKEN=<Your Apibara API token>
```

### Install Dependencies

```bash
npm install
```

### Running the Indexer and GraphQL Server

You can run the indexer and GraphQL server concurrently using the following command:

```bash
yarn start:both
```

This will start both the indexer and the GraphQL server.

Alternatively, you can run them separately:

- Start the indexer:

  ```bash
  yarn start:indexer
  ```

- Start the GraphQL server:

  ```bash
  yarn start:server
  ```

## GraphQL API

The GraphQL server exposes the following queries:

### `getAccounts(page: Int, limit: Int): [AccountEvent]`

Fetches a paginated list of indexed events.

- **Arguments**:
  - `page` (optional): The page number (default is 1).
  - `limit` (optional): The number of items per page (default is 10).

- **Returns**: A list of `AccountEvent` objects.

### `getAccountByGuardian(guardian: String!): AccountEvent`

Retrieves a specific event by its guardian address.

- **Arguments**:
  - `guardian`: The guardian address.

- **Returns**: An `AccountEvent` object.

### `getAccountByOwner(owner: String!): AccountEvent`

Retrieves a specific event by its owner address.

- **Arguments**:
  - `owner`: The owner address.

- **Returns**: An `AccountEvent` object.

```
```
