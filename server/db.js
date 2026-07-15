const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

function load() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { chats: [], vendors: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    console.error('db.load error', err);
    return { chats: [] };
  }
}

function save(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('db.save error', err);
  }
}

function makeConversationId(a, b) {
  // deterministic id for 2 participants
  return [a, b].sort().join('__');
}

function addMessage({ from, to, text, meta }) {
  const db = load();
  const conversationId = makeConversationId(from, to);
  const msg = { id: `m_${Date.now()}_${Math.floor(Math.random()*1000)}`, conversationId, from, to, text, meta: meta || {}, ts: Date.now(), read: false };
  db.chats.push(msg);
  save(db);
  return msg;
}

function getMessages(conversationId, opts={}){
  const db = load();
  const msgs = db.chats.filter(m => m.conversationId === conversationId).sort((a,b)=>a.ts-b.ts);
  if (opts.limit) return msgs.slice(-opts.limit);
  return msgs;
}

function getConversationsFor(userId){
  const db = load();
  const map = {};
  db.chats.forEach(m => {
    if (m.from === userId || m.to === userId) {
      const other = m.from === userId ? m.to : m.from;
      if (!map[other]) map[other] = { id: makeConversationId(userId, other), other, lastTs: 0, lastText: '', unread: 0 };
      if (m.ts > map[other].lastTs) { map[other].lastTs = m.ts; map[other].lastText = m.text; }
      if (!m.read && m.to === userId) map[other].unread += 1;
    }
  });
  return Object.values(map).sort((a,b)=>b.lastTs-a.lastTs);
}

function markRead(conversationId, userId){
  const db = load();
  let changed = false;
  db.chats.forEach(m => {
    if (m.conversationId === conversationId && m.to === userId && !m.read) { m.read = true; changed = true; }
  });
  if (changed) save(db);
  return changed;
}

function setVendorMeta(vendorName, meta){
  const db = load();
  db.vendors = db.vendors || {};
  db.vendors[vendorName] = { ...(db.vendors[vendorName] || {}), ...meta };
  save(db);
  return db.vendors[vendorName];
}

function getVendorMeta(vendorName){
  const db = load();
  return (db.vendors && db.vendors[vendorName]) || null;
}

module.exports = { addMessage, getMessages, getConversationsFor, makeConversationId, markRead, setVendorMeta, getVendorMeta };
