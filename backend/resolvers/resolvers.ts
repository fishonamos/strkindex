// Define resolvers for the schema fields
export const resolvers = {
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