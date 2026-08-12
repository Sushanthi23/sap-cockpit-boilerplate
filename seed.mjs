import { MongoClient } from 'mongodb';
import 'dotenv/config';

const seedData = [
  {
    "orderId": "SO-1001",
    "customerId": "C-001",
    "customerName": "Sundaram Traders",
    "orderDate": "2026-08-05",
    "totalAmount": 250000,
    "status": "Blocked",
    "blockReason": "CREDIT_LIMIT_EXCEEDED",
    "blockedAt": "2026-08-06T09:15:00Z",
    "releasedAt": null,
    "reviewedBy": null,
    "overrideFlag": false,
    "customer": {
      "creditLimit": 250000,
      "creditExposure": 250000,
      "averagePaymentDays": 18,
      "paymentTerms": "Net 30"
    }
  },
  {
    "orderId": "SO-1002",
    "customerId": "C-002",
    "customerName": "Vellai Textiles",
    "orderDate": "2026-08-06",
    "totalAmount": 480000,
    "status": "Blocked",
    "blockReason": "CREDIT_LIMIT_EXCEEDED",
    "blockedAt": "2026-08-07T11:40:00Z",
    "releasedAt": null,
    "reviewedBy": null,
    "overrideFlag": false,
    "customer": {
      "creditLimit": 200000,
      "creditExposure": 480000,
      "averagePaymentDays": 45,
      "paymentTerms": "Net 30"
    }
  },
  {
    "orderId": "SO-1003",
    "customerId": "C-003",
    "customerName": "Anand Auto Parts",
    "orderDate": "2026-08-04",
    "totalAmount": 310000,
    "status": "Blocked",
    "blockReason": "CREDIT_LIMIT_EXCEEDED",
    "blockedAt": "2026-08-05T14:00:00Z",
    "releasedAt": null,
    "reviewedBy": null,
    "overrideFlag": false,
    "customer": {
      "creditLimit": 300000,
      "creditExposure": 310000,
      "averagePaymentDays": 12,
      "paymentTerms": "Net 30"
    }
  },
  {
    "orderId": "SO-1004",
    "customerId": "C-004",
    "customerName": "Meenakshi Enterprises",
    "orderDate": "2026-08-03",
    "totalAmount": 150000,
    "status": "Released",
    "blockReason": "CREDIT_LIMIT_EXCEEDED",
    "blockedAt": "2026-08-03T10:00:00Z",
    "releasedAt": "2026-08-04T16:30:00Z",
    "reviewedBy": "Credit Analyst",
    "overrideFlag": true,
    "customer": {
      "creditLimit": 140000,
      "creditExposure": 150000,
      "averagePaymentDays": 20,
      "paymentTerms": "Net 30"
    }
  }
];


async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('sapCockpit');
  await db.collection('orders').deleteMany({});
  await db.collection('orders').insertMany(seedData);
  console.log('Seeded!');
  await client.close();
}
seed();