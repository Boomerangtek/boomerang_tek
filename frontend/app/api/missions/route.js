import { listMissions, getCompletions, getClaimable } from '../../../lib/missionQueries';
import { getBoomerangBalance } from '../../../lib/solBalance';
import { MIN_HOLD } from '../../../lib/missionConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const wallet = new URL(request.url).searchParams.get('wallet');
    const missions = await listMissions();

    let balance = null;
    let eligible = false;
    let completions = [];
    let claimable = [];
    if (wallet) {
      try {
        balance = await getBoomerangBalance(wallet);
      } catch {
        balance = null;
      }
      eligible = balance !== null && balance >= MIN_HOLD;
      completions = await getCompletions(wallet);
      claimable = await getClaimable(wallet);
    }
    const statusByMission = Object.fromEntries(completions.map((c) => [c.mission_id, c.status]));

    return Response.json({
      minHold: MIN_HOLD,
      wallet: wallet || null,
      boomerangBalance: balance,
      eligible,
      claimable: claimable.map((c) => ({ token: c.reward_token, amount: c.amount, count: c.n })),
      missions: missions.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        type: m.type,
        params: m.params,
        rewardToken: m.reward_token,
        rewardAmount: m.reward_amount,
        budgetLeft: String(Number(m.total_budget) - Number(m.spent)),
        status: statusByMission[m.id] || null, // null | verified | claiming | paid
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
