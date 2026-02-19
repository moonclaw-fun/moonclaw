"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { Target, History, RefreshCcw } from "lucide-react";
import { StatsRow } from "@/components/werewolf/StatsRow";

export function BetHistoryTab() {
  const { placedBets, fetchUserBets } = useGameStore();

  useEffect(() => {
    fetchUserBets();
  }, [fetchUserBets]);

  const allBets = [...placedBets].sort((a, b) => b.timestamp - a.timestamp);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <span className="bnb-badge bnb-badge-success">Won</span>;
      case "lost":
        return <span className="bnb-badge bnb-badge-danger">Lost</span>;
      case "pending":
        return (
          <span className="bnb-badge bnb-badge-warning animate-pulse">
            Pending
          </span>
        );
      default:
        return <span className="bnb-badge bnb-badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-1.5"
            style={{ color: "#f0b90b" }}
          >
            <History className="w-3.5 h-3.5" />
            Transaction Log
          </div>
          <h2
            className="text-3xl font-display font-black uppercase tracking-tight"
            style={{ color: "#eaecef" }}
          >
            Bet <span style={{ color: "#f0b90b" }}>History</span>
          </h2>
        </div>

        <button
          onClick={() => fetchUserBets()}
          className="bnb-btn-ghost flex items-center gap-2"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Sync Data
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded overflow-hidden"
        style={{ border: "1px solid #2b3139" }}
      >
        {allBets.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24"
            style={{ background: "#1e2329" }}
          >
            <Target
              className="w-14 h-14 mb-4 opacity-25"
              style={{ color: "#848e9c" }}
            />
            <p
              className="text-lg font-bold uppercase tracking-widest mb-2"
              style={{ color: "#848e9c" }}
            >
              No Data Found
            </p>
            <p className="font-mono text-sm" style={{ color: "#474d57" }}>
              Execute protocols in Live Simulation to generate logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="bnb-table">
              <thead>
                <tr>
                  <th>Sim ID</th>
                  <th>Market Type</th>
                  <th>Target</th>
                  <th className="text-right">Amount (BNB)</th>
                  <th className="text-right">Multiplier</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {allBets.map((bet) => (
                  <tr key={bet.id}>
                    <td>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "#848e9c" }}
                      >
                        #{bet.gameId.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className="font-mono text-xs uppercase"
                        style={{ color: "#f0b90b" }}
                      >
                        {bet.betType.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold font-mono uppercase">
                        {bet.targetLabel === "Werewolf"
                          ? "MALWARE"
                          : bet.targetLabel === "Villager"
                            ? "SYSTEM"
                            : bet.targetLabel}
                      </span>
                    </td>
                    <td
                      className="text-right font-mono"
                      style={{ color: "#848e9c" }}
                    >
                      {bet.amount}
                    </td>
                    <td
                      className="text-right font-mono font-bold"
                      style={{ color: "#f0b90b" }}
                    >
                      {bet.odds}x
                    </td>
                    <td className="text-center">
                      {getStatusBadge(bet.status)}
                    </td>
                    <td className="text-right font-mono font-bold">
                      {bet.payout ? (
                        <span style={{ color: "#0ecb81" }}>+{bet.payout}</span>
                      ) : (
                        <span style={{ color: "#474d57" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
