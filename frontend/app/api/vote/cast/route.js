import { getCycleByToken, getSnapshotWeight, getOption, castVote } from '../../../../lib/voteQueries';
import { voteMessage, verifyVoteSignature } from '../../../../lib/verifyVote';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { token, optionId, wallet, signature } = await request.json();
    if (!token || !optionId || !wallet || !signature) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Must be an open cycle for this token.
    const data = await getCycleByToken(token);
    if (!data) return Response.json({ error: 'No open vote cycle' }, { status: 404 });
    const { cycle } = data;
    if (new Date(cycle.ends_at).getTime() <= Date.now()) {
      return Response.json({ error: 'Voting has ended for this cycle' }, { status: 409 });
    }

    // Verify the wallet actually signed this exact vote (no address spoofing).
    const message = voteMessage({ cycleId: cycle.id, optionId, wallet });
    if (!verifyVoteSignature({ message, signature, wallet })) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Option must belong to this cycle and have passed filters.
    const option = await getOption(cycle.id, optionId);
    if (!option) return Response.json({ error: 'Invalid option' }, { status: 400 });

    // Weight = holdings at snapshot. Non-holders (weight 0) can't vote.
    const weight = await getSnapshotWeight(cycle.id, wallet);
    if (!weight || Number(weight) <= 0) {
      return Response.json({ error: 'Not eligible — you held none of this token at snapshot' }, { status: 403 });
    }

    await castVote(cycle.id, wallet, optionId, weight);
    return Response.json({ ok: true, cycleId: cycle.id, optionId, weight });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
