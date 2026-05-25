// $Boomerang token + the minimum holding required to take part in missions.
export const BOOMERANG_MINT = 'BwEyBmL9drBdo4XJno8iGRvjiZcGL9FvUnq6xVNhpump';
export const MIN_HOLD = 100_000; // UI amount of $Boomerang

export function claimMessage(wallet) {
  return `Boomerang Missions — claim rewards\nWallet: ${wallet}`;
}
