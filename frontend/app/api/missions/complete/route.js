import {
  getMission, hasCompleted, recordCompletion,
  hasVoted, isCustomer, getVoteCount, hasTrollMode, hasVoteMode,
} from '../../../../lib/missionQueries';
import { getBoomerangBalance } from '../../../../lib/solBalance';
import { MIN_HOLD } from '../../../../lib/missionConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { missionId, wallet } = await request.json();
    if (!missionId || !wallet) return Response.json({ error: 'Missing fields' }, { status: 400 });

    const mission = await getMission(missionId);
    if (!mission) return Response.json({ error: 'Mission not found' }, { status: 404 });
    if (await hasCompleted(missionId, wallet)) {
      return Response.json({ error: 'Already completed' }, { status: 409 });
    }

    // Eligibility gate: must hold the minimum $Boomerang.
    const balance = await getBoomerangBalance(wallet);
    if (balance < MIN_HOLD) {
      return Response.json(
        { error: `You need at least ${MIN_HOLD.toLocaleString()} $Boomerang to earn rewards (you hold ${Math.floor(balance).toLocaleString()}).` },
        { status: 403 }
      );
    }

    // Per-mission verification (all on-chain / DB facts — no external API).
    let ok = false;
    let reason = '';
    if (mission.type === 'hold') {
      const min = Number(mission.params?.minAmount || 0);
      ok = balance >= min;
      reason = `Hold ${min.toLocaleString()} $Boomerang (you have ${Math.floor(balance).toLocaleString()}).`;
    } else if (mission.type === 'vote') {
      ok = await hasVoted(wallet);
      reason = 'Cast a vote in any Community Vote cycle first.';
    } else if (mission.type === 'customer') {
      ok = await isCustomer(wallet);
      reason = 'Link one of your tokens to the bot from this wallet first.';
    } else if (mission.type === 'vote_count') {
      const need = Number(mission.params?.count || 1);
      ok = (await getVoteCount(wallet)) >= need;
      reason = `Vote in ${need} different Community Vote cycles.`;
    } else if (mission.type === 'troll_mode') {
      ok = await hasTrollMode(wallet);
      reason = 'Enable Troll Mode on one of your tokens first.';
    } else if (mission.type === 'vote_mode') {
      ok = await hasVoteMode(wallet);
      reason = 'Enable Community Vote on one of your tokens first.';
    } else {
      return Response.json({ error: 'Unsupported mission type' }, { status: 400 });
    }

    if (!ok) return Response.json({ error: `Not completed yet — ${reason}` }, { status: 422 });

    await recordCompletion(mission, wallet);
    return Response.json({ ok: true, missionId, rewardAmount: mission.reward_amount, rewardToken: mission.reward_token });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
