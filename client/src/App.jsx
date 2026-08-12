import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const getRiskLevel = (order) => {
    const { creditLimit, creditExposure } = order.customer;
    const overPct = ((creditExposure - creditLimit) / creditLimit) * 100;
    if (overPct <= 0) return 'ok';
    if (overPct <= 20) return 'amber';
    return 'red';
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setAiSummary('');
    fetchAISummary(order);
  };

  const fetchAISummary = (order) => {
  setAiLoading(true);
  fetch('/api/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })
    .then((res) => res.json())
    .then((data) => {
      setAiSummary(data.summary);
      setAiLoading(false);
    })
    .catch(() => {
      setAiSummary('AI summary unavailable — review manually.');
      setAiLoading(false);
    });
};
  const handleAction = async (action) => {
    setActionLoading(true);
    const res = await fetch(`/api/orders?id=${selectedOrder.orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        reviewedBy: 'Credit Analyst',
        overrideFlag: action === 'release' && getRiskLevel(selectedOrder) !== 'ok',
      }),
    });
    if (res.ok) {
      setSelectedOrder(null);
      fetchOrders();
    }
    setActionLoading(false);
  };

  if (loading) return <div className="status-message">Loading orders...</div>;
  if (error) return <div className="status-message error">Error: {error}</div>;

  // ---- DECISION SCREEN ----
  if (selectedOrder) {
    const risk = getRiskLevel(selectedOrder);
    const overBy = selectedOrder.customer.creditExposure - selectedOrder.customer.creditLimit;

    return (
      <div className="app">
        <button className="back-btn" onClick={() => setSelectedOrder(null)}>
          ← Back to queue
        </button>

        <div className="detail-card">
          <div className="detail-header">
            <h2>{selectedOrder.orderId}</h2>
            <span className={`badge badge-${risk}`}>
              {overBy > 0 ? `Over by ₹${overBy.toLocaleString()}` : 'At limit'}
            </span>
          </div>
          <p className="customer-name">{selectedOrder.customerName}</p>

          <div className="detail-grid">
            <div>
              <span className="label">Order Amount</span>
              <span className="value">₹{selectedOrder.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="label">Credit Limit</span>
              <span className="value">₹{selectedOrder.customer.creditLimit.toLocaleString()}</span>
            </div>
            <div>
              <span className="label">Current Exposure</span>
              <span className="value">₹{selectedOrder.customer.creditExposure.toLocaleString()}</span>
            </div>
            <div>
              <span className="label">Avg Payment Days</span>
              <span className="value">{selectedOrder.customer.averagePaymentDays} days</span>
            </div>
          </div>

          <div className="ai-card">
            <div className="ai-label">AI Summary</div>
            {aiLoading ? (
              <p className="ai-text">Analyzing...</p>
            ) : (
              <p className="ai-text">{aiSummary}</p>
            )}
          </div>

          {risk !== 'ok' && (
            <div className="validation-note">
              ⚠ This order exceeds the credit limit. Releasing requires an authorized override.
            </div>
          )}

          <div className="action-row">
            <button
              className="btn btn-reject"
              disabled={actionLoading}
              onClick={() => handleAction('reject')}
            >
              Reject
            </button>
            <button
              className="btn btn-release"
              disabled={actionLoading}
              onClick={() => handleAction('release')}
            >
              {risk !== 'ok' ? 'Release (Override)' : 'Release'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- QUEUE SCREEN ----
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
              <button className="review-btn" onClick={() => openOrder(order)}>
                Review →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;