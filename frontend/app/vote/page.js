'use client';

import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import WalletContextProvider from '../../components/vote/WalletContextProvider';
import VoteDashboard from '../../components/vote/VoteDashboard';
import LiveVotes from '../../components/vote/LiveVotes';

export default function VotePage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6">
          <div className="eyebrow mb-2">Community Vote</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Holders pick the reward 🪃🗳️
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mut">
            Connect your wallet to vote on the next airdrop reward for every Boomerang token you hold.
            Votes are weighted by your holdings at the cycle snapshot — and gasless (just sign a message).
          </p>
        </div>
        <LiveVotes />
        <WalletContextProvider>
          <VoteDashboard />
        </WalletContextProvider>
      </main>
      <Footer />
    </>
  );
}
