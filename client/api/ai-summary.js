export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order } = req.body;
    const overBy = order.customer.creditExposure - order.customer.creditLimit;

    const prompt = `You are a credit-risk assistant. Given ONLY this order data, write exactly ONE short sentence (max 25 words) summarizing the risk for a credit analyst deciding whether to release this order. Do not invent facts not in the data.

Order: ${order.orderId}
Customer: ${order.customerName}
Order Amount: ₹${order.totalAmount}
Credit Limit: ₹${order.customer.creditLimit}
Current Exposure: ₹${order.customer.creditExposure}
Amount Over Limit: ₹${overBy}
Average Payment Days: ${order.customer.averagePaymentDays}
Payment Terms: ${order.customer.paymentTerms}

Respond with ONLY the one sentence, no preamble.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return res.status(200).json({ summary: 'Unable to generate summary — review manually.', debugError: JSON.stringify(data) });
    }

    return res.status(200).json({ summary: text });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ summary: 'AI summary unavailable — review manually.', debugError: err.message });
  }
}