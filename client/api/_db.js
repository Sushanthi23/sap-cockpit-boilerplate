import { MongoClient } from 'mongodb';

let client;
let clientPromise;

export async function getDb() {
  if (!clientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  const conn = await clientPromise;
  return conn.db('sapCockpit');
}