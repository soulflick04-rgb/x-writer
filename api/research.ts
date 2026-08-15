import { runServerResearch } from './_shared/aiRunner';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  if (req.method !== 'POST') {
    if (res && typeof res.status === 'function') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    } else if (!body && typeof req.json === 'function') {
      body = await req.json();
    }

    const result = await runServerResearch(body || {});

    if (res && typeof res.status === 'function') {
      return res.status(200).json({ success: true, data: result });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('[API /api/research Error]:', err);
    const errorMessage = err?.message || 'Internal server error processing research';
    
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ success: false, error: errorMessage });
    }

    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
