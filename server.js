const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// API routes go here
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React build
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));