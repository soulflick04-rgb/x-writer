import { getGeminiQuotaTelemetry } from './providers/GeminiProvider';

export default async function handler(_req: Request) {
  try {
    const quota = getGeminiQuotaTelemetry();
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          gemini_quota: quota,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
