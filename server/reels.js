const express = require('express');
const router = express.Router();

// Simple in-memory demo data — replace with DB in production
const demoReels = [
  { id: 'r1', vendor: 'Ama Beauty Lab', caption: 'Install reveal', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', likes: 120, verified: true },
  { id: 'r2', vendor: 'Kobby Bakes', caption: 'Cake packing', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', likes: 20, verified: false },
];

router.get('/reels', (req, res) => {
  // TODO: replace with recommendation logic (nearby, engagement, interests)
  res.json(demoReels);
});

router.post('/reels/track', (req, res) => {
  console.log('track', req.body);
  res.json({ ok: true });
});

module.exports = router;
