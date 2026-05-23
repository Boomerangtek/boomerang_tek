import { neon } from '@neondatabase/serverless';

// Read-only Neon access for the public site's API routes. The PC backend
// writes to the same database (bot, scheduler, executions); Vercel only reads.
// Lazy-initialised so a missing env var doesn't crash the build.
let _sql;

export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    _sql = neon(url);
  }
  return _sql;
}
