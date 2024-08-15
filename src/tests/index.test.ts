import { MongoClient } from 'mongodb';
import { v1alpha2, FieldElement } from '@apibara/starknet';
import { handleEvent } from '../index';

describe('handleEvent', () => {
  let mongoClient: MongoClient;
  let collection: any;

  beforeAll(async () => {
    mongoClient = new MongoClient(global.__MONGO_URI__);
    await mongoClient.connect();
    const db = mongoClient.db(global.__MONGO_DB_NAME__);
    collection = db.collection('events');
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  it('should save event data to MongoDB', async () => {
    const header: v1alpha2.IBlockHeader = {
      blockNumber: 123,
      timestamp: { seconds: 1626864123 },
    };

    const event: v1alpha2.IEvent = {
      data: [
        FieldElement.fromBigInt(BigInt('0x123')),
        FieldElement.fromBigInt(BigInt('0x456')),
      ],
    };

    await handleEvent(header, event, collection);

    const savedEvent = await collection.findOne({ owner: '0x123' });

    expect(savedEvent).toBeTruthy();
    expect(savedEvent?.owner).toBe('0x123');
    expect(savedEvent?.guardian).toBe('0x456');
    expect(savedEvent?.blockNumber).toBe(123);
    expect(savedEvent?.blockTimestamp).toBe('1626864123');
  });
});
