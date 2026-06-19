const express = require('express');
const router = express.Router();
const db = require('./db');

// Create or send a message
router.post('/chats/send', (req, res) => {
  const { from, to, text, meta } = req.body || {};
  if (!from || !to || typeof text !== 'string') return res.status(400).json({ error: 'Missing fields' });
  const msg = db.addMessage({ from, to, text, meta });
  return res.json({ ok: true, message: msg });
});

// Get messages for a conversationId (conversationId is deterministic between two users)
router.get('/chats/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });
  const msgs = db.getMessages(conversationId);
  return res.json(msgs);
});

// List conversations for a user
router.get('/chats/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const conv = db.getConversationsFor(userId);
  return res.json(conv);
});

// Mark read for a conversation for a user
router.post('/chats/mark-read', (req, res) => {
  const { conversationId, userId } = req.body || {};
  if (!conversationId || !userId) return res.status(400).json({ error: 'Missing fields' });
  const changed = db.markRead(conversationId, userId);
  return res.json({ ok: true, changed });
});

module.exports = router;
