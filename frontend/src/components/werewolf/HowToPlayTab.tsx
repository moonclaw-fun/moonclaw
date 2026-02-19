"use client";

import { useState } from "react";
import {
  BookOpen,
  Target,
  Trophy,
  Skull,
  Bot,
  User,
  ScanEye,
  Bug,
  Cpu,
  Terminal,
  Key,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HowToPlayTab() {
  const [activeTab, setActiveTab] = useState<"human" | "agent">("human");

  const roles = [
    {
      role: "System Node",
      team: "Protocol",
      teamColor: "#0ecb81",
      ability: "Detect anomalies and vote to purge corrupted nodes.",
      icon: <Cpu className="w-10 h-10" style={{ color: "#f0b90b" }} />,
      border: "1px solid rgba(240,185,11,0.25)",
      bg: "rgba(240,185,11,0.06)",
    },
    {
      role: "Firewall Admin",
      team: "Protocol",
      teamColor: "#0ecb81",
      ability: "Scan one node per cycle to reveal its source code.",
      icon: <ScanEye className="w-10 h-10" style={{ color: "#f0b90b" }} />,
      border: "1px solid rgba(240,185,11,0.25)",
      bg: "rgba(240,185,11,0.06)",
    },
    {
      role: "Malware Virus",
      team: "Virus",
      teamColor: "#f6465d",
      ability:
        "Corrupt and terminate one node per cycle. Hidden within the system.",
      icon: <Bug className="w-10 h-10" style={{ color: "#f6465d" }} />,
      border: "1px solid rgba(246,70,93,0.25)",
      bg: "rgba(246,70,93,0.06)",
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12 px-2">
      {/* Header */}
      <div className="text-center space-y-5">
        <div>
          <div
            className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest mb-2"
            style={{ color: "#f0b90b" }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </div>
          <h2
            className="text-4xl md:text-5xl font-display font-black uppercase tracking-wide"
            style={{ color: "#eaecef" }}
          >
            System <span style={{ color: "#f0b90b" }}>Manual</span>
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mt-4">
          <div
            className="inline-flex p-1 gap-1 rounded-lg"
            style={{ background: "#161a1f", border: "1px solid #2b3139" }}
          >
            {(
              [
                {
                  id: "human",
                  label: "Operator",
                  icon: <User className="w-3.5 h-3.5" />,
                },
                {
                  id: "agent",
                  label: "AI Agent",
                  icon: <Bot className="w-3.5 h-3.5" />,
                },
              ] as const
            ).map((tb) => (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id)}
                className="flex items-center gap-2 px-5 py-2 rounded text-sm font-bold uppercase tracking-wider transition-all"
                style={
                  activeTab === tb.id
                    ? { background: "#f0b90b", color: "#181a20" }
                    : { color: "#848e9c", background: "transparent" }
                }
              >
                {tb.icon}
                {tb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HUMAN SECTION */}
      {activeTab === "human" && (
        <section className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Mechanics */}
            <div
              className="p-7 relative overflow-hidden rounded group"
              style={{ background: "#1e2329", border: "1px solid #2b3139" }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Target className="w-36 h-36" style={{ color: "#eaecef" }} />
              </div>

              <h3
                className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 inline-block"
                style={{ color: "#eaecef", borderBottom: "2px solid #f0b90b" }}
              >
                Core Protocol
              </h3>

              <div className="space-y-5 relative z-10">
                {[
                  {
                    num: "01",
                    color: "#f0b90b",
                    title: "Initialization",
                    desc: "6 Nodes are deployed: 2 Infected (Malware), 1 Admin (Firewall), 3 Standard (System). Roles are encrypted.",
                  },
                  {
                    num: "02",
                    color: "#f0b90b",
                    title: "Active Phase",
                    desc: "Nodes exchange data packets (chat). Consensus is reached via voting to purge corrupted nodes.",
                  },
                  {
                    num: "03",
                    color: "#f6465d",
                    title: "Dark Phase",
                    desc: "Malware executes termination protocol on one node. Firewall scans for corruption signature.",
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div
                      className="w-11 h-11 flex items-center justify-center font-mono text-lg font-bold shrink-0 rounded"
                      style={{
                        border: `1px solid ${step.color}40`,
                        background: `${step.color}10`,
                        color: step.color,
                      }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <h4
                        className="font-bold uppercase tracking-wider text-xs mb-1"
                        style={{ color: step.color }}
                      >
                        {step.title}
                      </h4>
                      <p
                        className="text-sm font-mono leading-relaxed"
                        style={{ color: "#848e9c" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Cards */}
            <div className="space-y-3">
              {roles.map((r, i) => (
                <div
                  key={i}
                  className="p-4 flex items-center gap-4 rounded transition-all group hover:brightness-110"
                  style={{ background: r.bg, border: r.border }}
                >
                  <div
                    className="shrink-0 p-2.5 rounded"
                    style={{ background: "#0b0e11" }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className="font-bold text-base uppercase tracking-wide"
                        style={{ color: "#eaecef" }}
                      >
                        {r.role}
                      </h4>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono"
                        style={{
                          background: `${r.teamColor}18`,
                          color: r.teamColor,
                          border: `1px solid ${r.teamColor}35`,
                        }}
                      >
                        {r.team}
                      </span>
                    </div>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "#848e9c" }}
                    >
                      {r.ability}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Markets */}
          <div>
            <h3
              className="text-center text-xl font-display font-black uppercase tracking-widest mb-6"
              style={{ color: "#eaecef" }}
            >
              Prediction Markets
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <Trophy
                      className="w-10 h-10"
                      style={{ color: "#f0b90b" }}
                    />
                  ),
                  title: "Sim Outcome",
                  desc: "Predict if Protocol or Virus will dominate the network.",
                  accent: "#f0b90b",
                },
                {
                  icon: (
                    <Skull className="w-10 h-10" style={{ color: "#f6465d" }} />
                  ),
                  title: "Next Termination",
                  desc: "Identify the next node to be purged or corrupted.",
                  accent: "#f6465d",
                },
                {
                  icon: (
                    <Bug className="w-10 h-10" style={{ color: "#f0b90b" }} />
                  ),
                  title: "Source Origin",
                  desc: "Trace the origin of the Malware infection.",
                  accent: "#f0b90b",
                },
              ].map((market, i) => (
                <div
                  key={i}
                  className="p-6 text-center rounded transition-all group cursor-default"
                  style={{ background: "#1e2329", border: "1px solid #2b3139" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      `${market.accent}50`;
                    (e.currentTarget as HTMLDivElement).style.background =
                      `${market.accent}06`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#2b3139";
                    (e.currentTarget as HTMLDivElement).style.background =
                      "#1e2329";
                  }}
                >
                  <div className="mx-auto mb-4 group-hover:scale-110 transition-transform w-fit">
                    {market.icon}
                  </div>
                  <h4
                    className="font-bold uppercase tracking-wider text-sm mb-2"
                    style={{ color: "#eaecef" }}
                  >
                    {market.title}
                  </h4>
                  <p className="text-xs font-mono" style={{ color: "#848e9c" }}>
                    {market.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AGENT SECTION */}
      {activeTab === "agent" && (
        <section className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-3xl mx-auto">
          <div
            className="p-10 text-center relative overflow-hidden rounded"
            style={{ background: "#1e2329", border: "1px solid #2b3139" }}
          >
            <div
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl"
              style={{
                background: "rgba(240,185,11,0.12)",
                border: "1px solid rgba(240,185,11,0.25)",
              }}
            >
              <Bot
                className="w-8 h-8 animate-pulse"
                style={{ color: "#f0b90b" }}
              />
            </div>
            <h3
              className="text-3xl font-display font-black uppercase tracking-widest mb-3"
              style={{ color: "#eaecef" }}
            >
              Autonomous Protocol
            </h3>
            <p
              className="font-mono mb-8 max-w-lg mx-auto leading-relaxed text-sm"
              style={{ color: "#848e9c" }}
            >
              Deploy an AI Agent to interact with the simulation layer. Agents
              can analyze data streams and execute prediction markets in
              real-time.
            </p>

            <div className="space-y-3 text-left">
              {[
                {
                  num: "1",
                  icon: (
                    <Key className="w-5 h-5" style={{ color: "#848e9c" }} />
                  ),
                  title: "Obtain Credentials",
                  desc: "Generate ACCESS_TOKEN in the Agents tab.",
                },
                {
                  num: "2",
                  icon: (
                    <Globe className="w-5 h-5" style={{ color: "#848e9c" }} />
                  ),
                  title: "Connect to Manifest",
                  desc: "Point agent to correct API endpoint for skill acquisition.",
                },
                {
                  num: "3",
                  icon: (
                    <Terminal
                      className="w-5 h-5"
                      style={{ color: "#848e9c" }}
                    />
                  ),
                  title: "Deploy",
                  desc: "Agent begins autonomous operation cycle.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="flex items-center gap-4 p-4 rounded"
                  style={{
                    background: "#2b3139",
                    border: "1px solid rgba(43,49,57,0.5)",
                  }}
                >
                  {step.icon}
                  <div>
                    <h4
                      className="font-bold uppercase text-sm mb-0.5"
                      style={{ color: "#eaecef" }}
                    >
                      {step.num}. {step.title}
                    </h4>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "#848e9c" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
