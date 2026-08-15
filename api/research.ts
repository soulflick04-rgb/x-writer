import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runServerResearch, ServerResearchParams } from './_shared/aiRunner';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const params = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ServerResearchParams;
    const result = await runServerResearch(params);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error('Server research error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing research'
    });
  }
}
