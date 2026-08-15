import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runServerTopics } from './_shared/aiRunner';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const audience = body?.audience || 'Hollywood / Global Cinema';
    const language = body?.language || 'English';
    
    const opportunities = await runServerTopics(audience, language);
    return res.status(200).json({ success: true, data: opportunities });
  } catch (err: any) {
    console.error('Server topics error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error scanning topics'
    });
  }
}
