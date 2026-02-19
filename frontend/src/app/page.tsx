"use client";

import { useGameStore } from "@/lib/store";
import { Sidebar } from "@/components/werewolf/Sidebar";
import { LiveGameTab } from "@/components/werewolf/LiveGameTab";
import { BetHistoryTab } from "@/components/werewolf/BetHistoryTab";
import { LeaderboardTab } from "@/components/werewolf/LeaderboardTab";
import { AgentsTab } from "@/components/werewolf/AgentsTab";
import { HowToPlayTab } from "@/components/werewolf/HowToPlayTab";
import { AnimatePresence, motion } from "framer-motion";

import { useEffect } from "react";

export default function Home() {
  const { activeTab, connectSocket, disconnectSocket, fetchGameProgress } =
    useGameStore();

  useEffect(() => {
    connectSocket();
    fetchGameProgress();
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <div
      className="flex min-h-screen text-foreground font-sans overflow-x-hidden"
      style={{ backgroundColor: "#181a20" }}
    >
      <Sidebar />

      {/* Main Layout — offset by sidebar width (16rem = 256px) */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: "16rem" }}
      >
        {/* ── Top Bar ──────────────────────────────── */}
        <header
          className="h-14 flex items-center justify-between px-6 sticky top-0 z-40 w-full"
          style={{
            backgroundColor: "#1e2329",
            borderBottom: "1px solid #2b3139",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs font-mono" style={{ color: "#848e9c" }}>
                Simulation Network
              </span>
            </div>
            <span style={{ color: "#2b3139" }}>|</span>
            <span
              className="text-xs font-bold font-mono"
              style={{ color: "#0ecb81" }}
            >
              OPERATIONAL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-semibold"
              style={{
                background: "rgba(240,185,11,0.08)",
                border: "1px solid rgba(240,185,11,0.2)",
                color: "#f0b90b",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              NET_STABLE
            </div>
            <span
              className="text-[11px] font-mono"
              style={{ color: "#474d57" }}
            >
              v2.0.4
            </span>
          </div>
        </header>

        {/* ── Content ──────────────────────────────── */}
        <div className="flex-1 p-6 pb-20 w-full max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full"
            >
              {activeTab === "live" && <LiveGameTab />}
              {activeTab === "history" && <BetHistoryTab />}
              {activeTab === "leaderboard" && <LeaderboardTab />}
              {activeTab === "agents" && <AgentsTab />}
              {activeTab === "howtoplay" && <HowToPlayTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer ───────────────────────────────── */}
        <footer
          className="fixed bottom-0 right-0 py-2.5 z-30"
          style={{
            left: "16rem",
            backgroundColor: "#1e2329",
            borderTop: "1px solid #2b3139",
          }}
        >
          <div className="px-6 flex items-center justify-between">
            <span
              className="text-[11px] font-mono"
              style={{ color: "#474d57" }}
            >
              Autonomous Agent Simulation Network
            </span>
            <span className="font-display font-black text-white tracking-widest italic text-sm">
              MOON<span style={{ color: "#f0b90b" }}>CLAW</span>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
