import { getCycleByToken } from '../../../../../lib/voteQueries';
import { fetchTokenMeta } from '../../../../../lib/tokenMeta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const data = await getCycleByToken(token);
    if (!data) return Response.json({ error: 'No open vote cycle for this token' }, { status: 404 });

    const { cycle, options } = data;
    const meta = await fetchTokenMeta([token, ...options.map((o) => o.token_address)]);
    const totalWeight = options.reduce((s, o) => s + Number(o.weight), 0);

    return Response.json({
      token,
      tokenSymbol: meta[token]?.symbol || null,
      tokenImage: meta[token]?.image || null,
      cycleId: cycle.id,
      endsAt: cycle.ends_at,
      startsAt: cycle.starts_at,
      safetyMode: cycle.vote_safety_mode,
      totalWeight: String(totalWeight),
      options: options.map((o) => ({
        id: o.id,
        token: o.token_address,
        symbol: meta[o.token_address]?.symbol || null,
        name: meta[o.token_address]?.name || null,
        image: meta[o.token_address]?.image || null,
        weight: o.weight,
        voters: o.voters,
        share: totalWeight > 0 ? Number(o.weight) / totalWeight : 0,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
