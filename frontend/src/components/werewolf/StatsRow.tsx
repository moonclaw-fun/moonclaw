"use client";

import { Cpu, ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react";
import { useGetStats } from "@/services/queries";

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
  delta?: string;
}

export function StatsRow() {
  const { data: apiStats } = useGetStats();

  const wolfWins = apiStats?.werewolfWins ?? 0;
  const vilWins = apiStats?.villagerWins ?? 0;
  const total = apiStats?.totalGames ?? 0;
  const winRate =
    (apiStats?.winRate as { werewolf?: number | string })?.werewolf ?? 0;

  const stats: StatItem[] = [
    {
      label: "Total Simulations",
      value: total.toLocaleString(),
      icon: <Cpu className="w-4 h-4" />,
      accentColor: "#f0b90b",
    },
    {
      label: "Malware Wins",
      value: wolfWins.toLocaleString(),
      icon: <ShieldAlert className="w-4 h-4" />,
      accentColor: "#f6465d",
    },
    {
      label: "System Wins",
      value: vilWins.toLocaleString(),
      icon: <ShieldCheck className="w-4 h-4" />,
      accentColor: "#0ecb81",
    },
    {
      label: "Threat Level",
      value: `${winRate}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      accentColor: "#f0b90b",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded px-4 py-3 group hover:brightness-110 transition-all"
          style={{ background: "#1e2329", border: "1px solid #2b3139" }}
        >
          {/* Colored left accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
            style={{ backgroundColor: stat.accentColor }}
          />

          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-[10px] font-mono uppercase tracking-widest mb-2"
                style={{ color: "#848e9c" }}
              >
                {stat.label}
              </p>
              <p
                className="text-2xl font-bold font-mono leading-none"
                style={{ color: "#eaecef" }}
              >
                {stat.value}
              </p>
            </div>
            <div
              className="p-2 rounded mt-0.5"
              style={{
                background: `${stat.accentColor}15`,
                color: stat.accentColor,
                border: `1px solid ${stat.accentColor}25`,
              }}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
