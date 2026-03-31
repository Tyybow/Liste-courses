import type { VercelRequest, VercelResponse } from '@vercel/node';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCommand(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
  }
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'Sync non configuré. Ajoutez UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN dans les variables d\'environnement Vercel.' });
  }

  try {
    if (req.method === 'GET') {
      const room = req.query.room as string;
      if (!room) return res.status(400).json({ error: 'Code famille manquant' });

      const result = await redisCommand(['GET', `room:${room}`]);
      if (!result.result) {
        return res.status(404).json({ error: 'Code famille introuvable' });
      }
      return res.status(200).json({ data: JSON.parse(result.result) });
    }

    if (req.method === 'POST') {
      const { room, data } = req.body;
      if (!room || !data) return res.status(400).json({ error: 'room et data requis' });

      // Store with 90 days expiry
      await redisCommand(['SET', `room:${room}`, JSON.stringify(data), 'EX', '7776000']);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: 'Erreur de synchronisation' });
  }
}
