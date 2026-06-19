const express = require('express');
const router = express.Router();
const db = require('./db');

// Set vendor metadata (days, hours, etc.)
router.post('/vendors/:vendorName', (req, res) => {
  const { vendorName } = req.params;
  const meta = req.body || {};
  if (!vendorName) return res.status(400).json({ error: 'Missing vendorName' });
  const updated = db.setVendorMeta(vendorName, meta);
  return res.json({ ok: true, vendor: updated });
});

router.get('/vendors/:vendorName', (req, res) => {
  const { vendorName } = req.params;
  if (!vendorName) return res.status(400).json({ error: 'Missing vendorName' });
  const meta = db.getVendorMeta(vendorName);
  if (!meta) return res.status(404).json({ error: 'Not found' });
  return res.json(meta);
});

module.exports = router;
