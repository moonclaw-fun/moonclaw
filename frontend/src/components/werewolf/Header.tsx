"use client";

import { useGameStore, TabId } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Play,
  TrendingUp,
  Trophy,
  BookOpen,
  Coins,
  Users,
} from "lucide-react";

import { WalletButton } from "./WalletButton";

export function Header() {
  const { wallet, connectWallet, disconnectWallet, activeTab, setActiveTab } =
    useGameStore();

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "live", label: "Live Game", icon: <Play className="w-5 h-5" /> },
    {
      id: "history",
      label: "Bet History",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "agents",
      label: "Agents",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "howtoplay",
      label: "How to Play",
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-9999999 bg-bg-peach/95 backdrop-blur-sm border-b-4 border-black py-2">
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="MoonClaw"
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div>
              <h1 className="text-2xl font-display font-black text-foreground tracking-tight drop-shadow-sm">
                MOONCLAW
              </h1>
              <p className="text-xs font-bold text-muted-foreground font-mono uppercase tracking-wider">
                AI Agents Play. You Bet.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border-2 border-black ${
                  activeTab === tab.id
                    ? "bg-accent-red text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
                    : "bg-white text-foreground hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {wallet.isConnected && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Coins className="w-5 h-5 text-accent-red" />
                <span className="font-mono text-base font-bold text-foreground">
                  {wallet.balance != null
                    ? `${wallet.balance.toLocaleString()} $mCLAW`
                    : "0 $mCLAW"}
                </span>
              </div>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 mt-2 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border-2 border-black transition-all ${
                activeTab === tab.id
                  ? "bg-accent-red text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
