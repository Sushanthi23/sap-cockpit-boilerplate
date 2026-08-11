import { getDb } from './_db.js';

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const collection = db.collection('orders');

    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        // GET /api/orders?id=SO-1001 — single order detail
        const order = await collection.findOne({ orderId: id });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        return res.status(200).json(order);
      }

      // GET /api/orders — list all blocked orders (queue screen)
      const orders = await collection.find({ status: 'Blocked' }).toArray();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      // POST /api/orders?id=SO-1001  body: { action: 'release' | 'reject', reviewedBy, overrideFlag }
      const { id } = req.query;
      const { action, reviewedBy, overrideFlag } = req.body;

      if (!id || !action) {
        return res.status(400).json({ error: 'Missing id or action' });
      }

      const newStatus = action === 'release' ? 'Released' : 'Rejected';

      const result = await collection.updateOne(
        { orderId: id },
        {
          $set: {
            status: newStatus,
            releasedAt: new Date().toISOString(),
            reviewedBy: reviewedBy || 'Unknown',
            overrideFlag: !!overrideFlag,
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json({ success: true, orderId: id, newStatus });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}