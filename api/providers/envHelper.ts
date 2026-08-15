declare const process: any;

export function getEnvVar(key: string): string {
  if (typeof process !== 'undefined' && process && process.env && process.env[key]) {
    return String(process.env[key]).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}
