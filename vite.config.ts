import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { runServerResearch, runServerTopics } from './api/_shared/aiRunner';

// Local development server API middleware
function apiServerPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/research' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const params = JSON.parse(body || '{}');
              const data = await runServerResearch(params);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.url === '/api/topics' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const data = await runServerTopics(parsed.audience || 'Hollywood / Global Cinema', parsed.language || 'English');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data }));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Populate process.env for the server middleware
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY || '';
  process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
  };
});
