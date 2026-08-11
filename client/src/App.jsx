import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getRiskLevel = (order) => {
    const { creditLimit, creditExposure } = order.customer;
    const overBy = creditExposure - creditLimit;
    const overPct = (overBy / creditLimit) * 100;
    if (overPct <= 0) return 'ok';
    if (overPct <= 20) return 'amber';
    return 'red';
  };

  if (loading) return <div className="status-message">Loading orders...</div>;
  if (error) return <div className="status-message error">Error: {error}</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>Credit-Blocked Order Queue</h1>
        <p className="subtitle">{orders.length} orders pending review</p>
      </header>

      <div className="queue-list">
        {orders.map((order) => {
          const risk = getRiskLevel(order);
          const overBy = order.customer.creditExposure - order.customer.creditLimit;
          return (
            <div key={order.orderId} className={`order-card risk-${risk}`}>
              <div className="order-card-main">
                <div className="order-id">{order.orderId}</div>
                <div className="customer-name">{order.customerName}</div>
              </div>
              <div className="order-card-details">
                <span>₹{order.totalAmount.toLocaleString()}</span>
                <span className={`badge badge-${risk}`}>
                  {overBy > 0 ? `Over by ₹${overBy.toLocaleString()}` : 'At limit'}
                </span>
              </div>
              <button className="review-btn">Review →</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;