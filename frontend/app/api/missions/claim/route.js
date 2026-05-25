import { markClaiming } from '../../../../lib/missionQueries';
import { verifyVoteSignature } from '../../../../lib/verifyVote';
import { claimMessage } from '../../../../lib/missionConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { wallet, signature } = await request.json();
    if (!wallet || !signature) return Response.json({ error: 'Missing fields' }, { status: 400 });

    // The signed message proves the claimer owns the wallet (payout goes to it).
    const message = claimMessage(wallet);
    if (!verifyVoteSignature({ message, signature, wallet })) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const n = await markClaiming(wallet);
    if (n === 0) return Response.json({ error: 'Nothing to claim' }, { status: 409 });

    // The backend treasury cron picks up 'claiming' rows and sends the payout.
    return Response.json({ ok: true, claimed: n });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
