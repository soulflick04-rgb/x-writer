import fs from 'fs';
import path from 'path';

let localEnvLoaded = false;
const localEnvMap: Record<string, string> = {};

function tryLoadLocalEnv() {
  if (localEnvLoaded) return;
  localEnvLoaded = true;

  try {
    const envPaths = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', '.env.local')
    ];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const eqIdx = trimmed.indexOf('=');
            const k = trimmed.substring(0, eqIdx).trim();
            const v = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!localEnvMap[k]) {
              localEnvMap[k] = v;
            }
          }
        }
      }
    }
  } catch {
    // In Edge runtime fs may not exist or error, which is expected
  }
}

export function getEnvVar(key: string): string {
  // 1. Check process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!.trim().replace(/^["']|["']$/g, '');
  }

  // 2. Try loading local env file if in Node
  tryLoadLocalEnv();
  return (localEnvMap[key] || '').trim().replace(/^["']|["']$/g, '');
}
