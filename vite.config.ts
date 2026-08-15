import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import researchHandler from './api/research';
import topicsHandler from './api/topics';

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
              const fakeRequest = new Request('http://localhost:5173/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body || '{}',
              });
              const response = await researchHandler(fakeRequest);
              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = response.status;
              res.end(JSON.stringify(data));
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
              const fakeRequest = new Request('http://localhost:5173/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body || '{}',
              });
              const response = await topicsHandler(fakeRequest);
              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = response.status;
              res.end(JSON.stringify(data));
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

  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  process.env.GEMINI_API_KEY_2 = env.GEMINI_API_KEY_2 || env.VITE_GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_2 || process.env.VITE_GEMINI_API_KEY_2 || '';
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY || '';
  process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
  };
});
