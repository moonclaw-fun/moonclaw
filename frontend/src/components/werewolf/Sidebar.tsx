"use client";

import { useGameStore, TabId } from "@/lib/store";
import { WalletButton } from "./WalletButton";
import {
  Activity,
  TrendingUp,
  Users,
  BookOpen,
  Zap,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  sublabel?: string;
}[] = [
  {
    id: "live",
    label: "Live Simulation",
    sublabel: "Watch & Bet",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: "history",
    label: "Bet History",
    sublabel: "Transaction Log",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "agents",
    label: "Agent Network",
    sublabel: "API Access",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "howtoplay",
    label: "How to Play",
    sublabel: "Protocol Guide",
    icon: <BookOpen className="w-4 h-4" />,
  },
];

export function Sidebar() {
  const { wallet, activeTab, setActiveTab } = useGameStore();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 overflow-hidden"
      style={{ backgroundColor: "#0b0e11", borderRight: "1px solid #2b3139" }}
    >
      {/* ── Logo ──────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid #2b3139" }}
      >
        <img
          src="/logo.jpeg"
          alt="MoonClaw"
          className="w-9 h-9 rounded-lg object-cover shrink-0"
        />
        <div>
          <h1 className="font-display font-black text-white tracking-widest text-lg leading-none">
            MOON<span style={{ color: "#f0b90b" }}>CLAW</span>
          </h1>
          <p
            className="text-[10px] font-mono mt-0.5"
            style={{ color: "#848e9c" }}
          >
            AI Prediction Market
          </p>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p
          className="text-[10px] font-mono uppercase tracking-widest px-3 mb-3"
          style={{ color: "#474d57" }}
        >
          Navigation
        </p>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn("bnb-nav-item", activeTab === tab.id && "active")}
          >
            <span className="shrink-0">{tab.icon}</span>
            <div className="text-left">
              <div className="text-xs font-semibold leading-none">
                {tab.label}
              </div>
              {tab.sublabel && (
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "inherit", opacity: 0.6 }}
                >
                  {tab.sublabel}
                </div>
              )}
            </div>
            {activeTab === tab.id && (
              <div className="ml-auto">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#f0b90b" }}
                />
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* ── Wallet Area ───────────────────────────── */}
      <div
        className="px-4 py-4 space-y-3"
        style={{ borderTop: "1px solid #2b3139" }}
      >
        {wallet.isConnected && (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded"
            style={{ background: "#1e2329", border: "1px solid #2b3139" }}
          >
            <div>
              <p
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "#848e9c" }}
              >
                Balance
              </p>
              <p className="text-sm font-bold font-mono mt-0.5 text-white">
                {wallet.balance != null ? wallet.balance.toLocaleString() : "0"}
                <span className="text-[11px] ml-1" style={{ color: "#f0b90b" }}>
                  BNB
                </span>
              </p>
            </div>
            <BarChart2 className="w-4 h-4" style={{ color: "#f0b90b" }} />
          </div>
        )}

        <WalletButton />

        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span
              className="text-[10px] font-mono"
              style={{ color: "#848e9c" }}
            >
              System Online
            </span>
          </div>
          <Zap className="w-3.5 h-3.5" style={{ color: "#f0b90b" }} />
        </div>
      </div>
    </aside>
  );
}
