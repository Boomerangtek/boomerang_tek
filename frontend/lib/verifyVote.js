import nacl from 'tweetnacl';
import bs58 from 'bs58';

export { voteMessage } from './voteMessage';

/** Verify an ed25519 wallet signature over the vote message. */
export function verifyVoteSignature({ message, signature, wallet }) {
  try {
    const msg = new TextEncoder().encode(message);
    const sig = bs58.decode(signature);
    const pub = bs58.decode(wallet);
    return nacl.sign.detached.verify(msg, sig, pub);
  } catch {
    return false;
  }
}
