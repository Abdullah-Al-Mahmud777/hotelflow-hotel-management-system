// AI Travel Assistant — server-side only. API keys never leave the server.
// Provider: OPENAI-compatible chat-completions endpoint.
//   AI_PROVIDER=openai (default) | AI_API_URL + AI_API_KEY + AI_MODEL
// Without credentials: deterministic fallback grounded in REAL hotel data.
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const SYSTEM_PROMPT = `You are HotelFlow's travel assistant. Answer concisely about rooms, bookings, prices, policies (cancellation 24h+ for approved stays, modification 48h+, reviews require approved stays). Never invent room names, prices, or booking details — say when unsure and suggest contacting support.`;

async function callProvider(messages) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) return null;
  const url = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-10)],
      max_tokens: 400,
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`AI provider error: ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('AI provider returned an empty response');
  return text;
}

// Deterministic fallback grounded in live DB rows (rooms + user context).
async function fallbackAnswer(text, user) {
  const q = String(text || '').toLowerCase();
  const rooms = await Room.find({ availability: true }).sort({ price: 1 }).limit(20).lean();
  const fmt = (r) => `${r.name} (${r.type}, ৳${r.price}/night, sleeps ${r.capacity})`;
  const pick = (pred) => rooms.filter(pred).slice(0, 3).map(fmt).join('; ') || 'none available right now';

  if (/(cancel|refund)/.test(q)) {
    return 'Cancellation policy: pending bookings cancel anytime; approved stays cancel free 24h+ before check-in. Open Bookings → select your trip → Cancel. Refunds take 3–5 business days.';
  }
  if (/(modify|change|reschedul|extend)/.test(q)) {
    return 'You can modify pending bookings anytime, and approved stays 48h+ before check-in (dates, guests, special requests). Open Bookings → View details → Modify.';
  }
  if (/(cheap|budget|afford|under|price|cost)/.test(q)) {
    return `Our most affordable available rooms: ${pick(() => true)}. Tell me your dates and party size for an exact quote.`;
  }
  if (/(suite|luxury|deluxe|best|recommend|suggest|family|couple|honeymoon)/.test(q)) {
    let mine = [];
    if (user) {
      mine = await Booking.find({ $or: [{ user: user._id }, { guestEmail: user.email }] })
        .populate('room', 'type').lean();
    }
    const favType = mine.length
      ? Object.entries(mine.reduce((a, b) => { const t = b.room?.type || 'Standard'; a[t] = (a[t] || 0) + 1; return a; }, {}))
        .sort((a, b) => b[1] - a[1])[0][0]
      : 'Deluxe';
    return `Based on ${mine.length ? 'your past stays' : 'popular picks'} (${favType} preference), I suggest: ${pick((r) => r.type === favType)}. Want family capacity or a Suite upgrade?`;
  }
  if (/(book|availab|reserve)/.test(q)) {
    return `Currently ${rooms.length} room(s) bookable, from ৳${rooms[0]?.price ?? '—'}/night. Top picks: ${pick(() => true)}. Share dates + guests and I'll narrow it down.`;
  }
  if (/(review|rating)/.test(q)) {
    return 'You can review approved stays from My Reviews. Ratings are 1–5 stars; edited reviews return to pending for re-approval.';
  }
  if (/(loyalty|points|reward|coupon|promo|discount)/.test(q)) {
    return 'Loyalty: 1 point per ৳500 of approved spend. 100+ points redeem for promo coupons in Rewards. Apply codes at booking for instant discounts.';
  }
  if (/(hi|hello|hey|help)/.test(q)) {
    return `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I can help with rooms, prices, bookings, cancellations, loyalty and reviews. What are your dates?`;
  }
  return `I can help with availability, prices, policies and your bookings. We have ${rooms.length} bookable room(s) right now — ask about budget, suites, cancellation or loyalty.`;
}

// POST /api/v1/ai/chat — { message, history?: [{role, text}] }
exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || String(message).trim().length < 1 || String(message).length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is required (1–2000 chars)' });
    }
    const cleanHistory = Array.isArray(history)
      ? history.filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-10)
        .map((m) => ({ role: m.role, content: m.text.slice(0, 1000) }))
      : [];
    let reply, provider = 'fallback';
    try {
      reply = await callProvider([...cleanHistory, { role: 'user', content: String(message).slice(0, 2000) }]);
      if (reply) provider = process.env.AI_PROVIDER || 'openai';
    } catch (err) {
      console.error('[aiController] provider failed, using fallback:', err.message);
    }
    if (!reply) reply = await fallbackAnswer(message, req.user);
    res.json({ success: true, data: { reply, provider } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Assistant failed', error: error.message });
  }
};
