import { apiJson, apiOptions } from '../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return apiOptions();
}

export function GET() {
  return apiJson({
    name: 'Boomerang Public API',
    version: 'v1',
    description: 'Read-only data about tokens running the Boomerang fee-redistribution bot.',
    endpoints: {
      stats: { method: 'GET', path: '/api/v1/stats', description: 'Global Boomerang stats.' },
      activity: { method: 'GET', path: '/api/v1/activity?limit=20', description: 'Recent linked tokens and payouts.' },
      token: { method: 'GET', path: '/api/v1/token/{address}', description: 'Check if a token is linked + its config and stats.' },
    },
    website: 'https://boomerang.tips',
    docs: 'https://github.com/tow3web3/boomerang',
  });
}
