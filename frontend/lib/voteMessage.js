// The exact message a voter signs with their wallet. Shared by the client
// (before signing) and the server (before verifying) so they always match.
export function voteMessage({ cycleId, optionId, wallet }) {
  return `Boomerang Community Vote\nCycle: ${cycleId}\nOption: ${optionId}\nWallet: ${wallet}`;
}
