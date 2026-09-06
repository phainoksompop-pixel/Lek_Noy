// Vercel Serverless Function — /api/summarize
// เก็บ ANTHROPIC_API_KEY ไว้ฝั่ง server (ไม่หลุดไป frontend)
// รับ { prompt, max_tokens } จากหน้าเว็บ แล้วเรียก Anthropic Messages API ให้

export default async function handler(req, res) {
  // อนุญาตเฉพาะ POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'ใช้ได้เฉพาะ POST' });
    return;
  }

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) {
    res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน Vercel → Settings → Environment Variables' });
    return;
  }

  // model ปรับได้ผ่าน env var (ค่า default = claude-sonnet-5)
  const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

  try {
    // body ถูก parse เป็น object ให้แล้วเมื่อ content-type=application/json
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const prompt = body.prompt;
    const maxTok = Math.min(Math.max(parseInt(body.max_tokens) || 8000, 256), 16000);

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'ไม่มี prompt' });
      return;
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTok,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      res.status(r.status).json({ error: (data && data.error && data.error.message) || ('Anthropic API error ' + r.status) });
      return;
    }
    // ส่ง response ดิบกลับ — frontend หยิบ content[].text เอง
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
