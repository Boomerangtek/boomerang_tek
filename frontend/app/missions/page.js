'use client';

import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import WalletContextProvider from '../../components/vote/WalletContextProvider';
import MissionsDashboard from '../../components/missions/MissionsDashboard';

export default function MissionsPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6">
          <div className="eyebrow mb-2">Missions</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Earn from holding 🪃🎯
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mut">
            Hold $Boomerang, complete missions, and claim rewards straight to your wallet. The boomerang
            always comes back.
          </p>
        </div>
        <WalletContextProvider>
          <MissionsDashboard />
        </WalletContextProvider>
      </main>
      <Footer />
    </>
  );
}
