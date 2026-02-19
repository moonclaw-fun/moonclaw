"use client";

import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const leaderboardData = [
  {
    rank: 1,
    displayName: "AlphaWolf",
    avatar: "🐺",
    winRate: 75,
    totalWinnings: 15000,
    gamesPlayed: 45,
    address: "0x12..34",
  },
  {
    rank: 2,
    displayName: "MoonWalker",
    avatar: "🌙",
    winRate: 68,
    totalWinnings: 12500,
    gamesPlayed: 32,
    address: "0x56..78",
  },
  {
    rank: 3,
    displayName: "NightOwl",
    avatar: "🦉",
    winRate: 62,
    totalWinnings: 9800,
    gamesPlayed: 50,
    address: "0x90..12",
  },
  {
    rank: 4,
    displayName: "Howler",
    avatar: "🐕",
    winRate: 55,
    totalWinnings: 7200,
    gamesPlayed: 28,
    address: "0xAB..CD",
  },
  {
    rank: 5,
    displayName: "ShadowHunter",
    avatar: "🗡️",
    winRate: 48,
    totalWinnings: 5600,
    gamesPlayed: 60,
    address: "0xEF..GH",
  },
];

export function LeaderboardTab() {
  const top3 = leaderboardData.slice(0, 3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-1.5"
          style={{ color: "#f0b90b" }}
        >
          <Trophy className="w-3.5 h-3.5" />
          Rankings
        </div>
        <h2
          className="text-3xl font-display font-black uppercase tracking-tight"
          style={{ color: "#eaecef" }}
        >
          Leader<span style={{ color: "#f0b90b" }}>board</span>
        </h2>
        <p className="text-sm font-mono mt-1" style={{ color: "#848e9c" }}>
          Top bettors on Moonclaw
        </p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        <div className="order-2 md:order-1">
          <div
            className="p-6 text-center rounded overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300"
            style={{
              background: "#1e2329",
              border: "1px solid #2b3139",
              borderTop: "3px solid #848e9c",
            }}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
              {top3[1]?.avatar}
            </div>
            <div
              className="font-bold text-base uppercase tracking-wide font-mono mb-1"
              style={{ color: "#eaecef" }}
            >
              {top3[1]?.displayName}
            </div>
            <div
              className="text-xs font-mono mb-4"
              style={{ color: "#848e9c" }}
            >
              {top3[1]?.winRate}% win rate
            </div>
            <div
              className="text-lg font-bold font-mono inline-block px-4 py-1.5 rounded"
              style={{ background: "#2b3139", color: "#eaecef" }}
            >
              {top3[1]?.totalWinnings.toLocaleString()} $mCLAW
            </div>
            <div className="mt-5 flex justify-center">
              <div
                className="w-10 h-10 rounded flex items-center justify-center font-bold text-xl font-mono"
                style={{
                  background: "rgba(132,142,156,0.1)",
                  color: "#848e9c",
                  border: "1px solid #848e9c",
                }}
              >
                2
              </div>
            </div>
          </div>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2 md:-mt-8">
          <div
            className="p-7 text-center rounded overflow-hidden relative group hover:-translate-y-2 transition-transform duration-300"
            style={{
              background: "#1e2329",
              border: "1px solid rgba(240,185,11,0.4)",
              borderTop: "3px solid #f0b90b",
              boxShadow: "0 0 30px rgba(240,185,11,0.12)",
            }}
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              {top3[0]?.avatar}
            </div>
            <div
              className="font-black text-xl uppercase tracking-wider font-display mb-1"
              style={{ color: "#f0b90b" }}
            >
              {top3[0]?.displayName}
            </div>
            <div
              className="text-sm font-mono mb-5"
              style={{ color: "#848e9c" }}
            >
              {top3[0]?.winRate}% win rate
            </div>
            <div
              className="text-xl font-black font-mono inline-block px-5 py-2 rounded"
              style={{ background: "#f0b90b", color: "#181a20" }}
            >
              {top3[0]?.totalWinnings.toLocaleString()} $mCLAW
            </div>
            <div className="mt-6 flex justify-center">
              <div
                className="relative w-12 h-12 rounded flex items-center justify-center font-black text-2xl font-mono"
                style={{
                  background: "rgba(240,185,11,0.15)",
                  color: "#f0b90b",
                  border: "1px solid #f0b90b",
                }}
              >
                <Trophy
                  className="w-4 h-4 absolute -top-2 -right-2 fill-current"
                  style={{ color: "#f0b90b" }}
                />
                1
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3 md:order-3">
          <div
            className="p-6 text-center rounded overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300"
            style={{
              background: "#1e2329",
              border: "1px solid #2b3139",
              borderTop: "3px solid #b45309",
            }}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
              {top3[2]?.avatar}
            </div>
            <div
              className="font-bold text-base uppercase tracking-wide font-mono mb-1"
              style={{ color: "#eaecef" }}
            >
              {top3[2]?.displayName}
            </div>
            <div
              className="text-xs font-mono mb-4"
              style={{ color: "#848e9c" }}
            >
              {top3[2]?.winRate}% win rate
            </div>
            <div
              className="text-lg font-bold font-mono inline-block px-4 py-1.5 rounded"
              style={{ background: "#2b3139", color: "#eaecef" }}
            >
              {top3[2]?.totalWinnings.toLocaleString()} $mCLAW
            </div>
            <div className="mt-5 flex justify-center">
              <div
                className="w-10 h-10 rounded flex items-center justify-center font-bold text-xl font-mono"
                style={{
                  background: "rgba(180,83,9,0.1)",
                  color: "#b45309",
                  border: "1px solid #b45309",
                }}
              >
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Table */}
      <div
        className="rounded overflow-hidden"
        style={{ border: "1px solid #2b3139" }}
      >
        <table className="bnb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th className="text-center">Games</th>
              <th className="text-center">Win Rate</th>
              <th className="text-right">Total Winnings</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry) => (
              <tr
                key={entry.rank}
                style={{
                  background:
                    entry.rank === 1 ? "rgba(240,185,11,0.04)" : undefined,
                }}
              >
                <td>
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: "#848e9c" }}
                  >
                    #{entry.rank}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <div
                        className="font-bold text-sm uppercase tracking-wide"
                        style={{ color: "#eaecef" }}
                      >
                        {entry.displayName}
                      </div>
                      <div
                        className="text-[10px] font-mono"
                        style={{ color: "#474d57" }}
                      >
                        {entry.address}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="text-center font-mono font-bold"
                  style={{ color: "#848e9c" }}
                >
                  {entry.gamesPlayed}
                </td>
                <td className="text-center">
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: "#f0b90b" }}
                  >
                    {entry.winRate}%
                  </span>
                </td>
                <td
                  className="text-right font-mono font-bold"
                  style={{ color: "#f0b90b" }}
                >
                  {entry.totalWinnings.toLocaleString()} $mCLAW
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
