const API = 'http://localhost:4000';

import type { Reel } from '../features/reels/types';

export async function fetchReels(): Promise<Reel[]>{
  try {
    const res = await fetch(`${API}/reels`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    // fallback demo reels
    return [
      { id: 'r-demo-1', vendor: 'Ama Beauty Lab', caption: 'Demo reel', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', likes: 12, verified: true },
      { id: 'r-demo-2', vendor: 'Kobby Bakes', caption: 'Cake reel', videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', likes: 6, verified: false },
    ];
  }
}

export async function trackEvent(event:string, payload:Record<string, unknown>){
  try {
    await fetch(`${API}/reels/track`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ event, payload, ts: Date.now() }) });
  } catch (err) {
    // ignore
  }
}
