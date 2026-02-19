"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/store";
import { StatsRow } from "./StatsRow";
import { BettingPanel } from "./BettingPanel";
import { ChatMessage } from "./ChatMessage";
import { GameScene3D } from "@/components/game3d";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
  Moon,
  Sun,
  Timer,
  RotateCcw,
  ChevronDown,
  Terminal,
  Cpu,
  Activity,
} from "lucide-react";

export function LiveGameTab() {
  const {
    status,
    phase,
    round,
    agents: gameAgents,
    messages,
    playbackTime,
    isPlaying,
    isNightMode,
    startGame,
    pauseGame,
    resetGame,
    tick,
    winner,
    fetchGameProgress,
    gameId,
  } = useGameStore();

  useEffect(() => {
    fetchGameProgress();
  }, [fetchGameProgress]);

  const chatRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const lastShownGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (winner) {
        if (gameId !== lastShownGameIdRef.current) {
          setShowWinnerModal(true);
          lastShownGameIdRef.current = gameId;
        }
      } else {
        setShowWinnerModal(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [winner, gameId]);

  useEffect(() => {
    const viewport = chatRef.current;
    if (!viewport) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distance = scrollHeight - scrollTop - clientHeight;
      const isAtBottom = distance < 100;
      isAtBottomRef.current = isAtBottom;
      setShowScrollButton(!isAtBottom);
    };
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    if (chatRef.current && isAtBottomRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      tick(50);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, tick]);

  const getRoleName = (role: string) => {
    switch (role) {
      case "wolf":
        return "MALWARE";
      case "seer":
        return "FIREWALL";
      default:
        return "NODE";
    }
  };

  const statusColor =
    status === "in_progress"
      ? "#0ecb81"
      : status === "ended"
        ? "#f6465d"
        : "#848e9c";
  const statusLabel =
    status === "in_progress"
      ? "LIVE"
      : status === "ended"
        ? "ENDED"
        : "STANDBY";

  return (
    <div className="space-y-5">
      {/* ── Control Bar ───────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold"
          style={{
            background: `${statusColor}14`,
            border: `1px solid ${statusColor}40`,
            color: statusColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {statusLabel}
        </div>

        {/* Phase */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold"
          style={{
            background: isNightMode
              ? "rgba(246,70,93,0.08)"
              : "rgba(240,185,11,0.08)",
            border: isNightMode
              ? "1px solid rgba(246,70,93,0.3)"
              : "1px solid rgba(240,185,11,0.3)",
            color: isNightMode ? "#f6465d" : "#f0b90b",
          }}
        >
          {isNightMode ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
          {isNightMode ? "DARK PHASE" : "ACTIVE PHASE"} {round}
        </div>

        {/* Timer */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
          style={{
            background: "#1e2329",
            border: "1px solid #2b3139",
            color: "#848e9c",
          }}
        >
          <Timer className="w-3.5 h-3.5" style={{ color: "#f0b90b" }} />
          <span className="text-white font-semibold">
            T-{Math.floor(playbackTime / 1000)}s
          </span>
        </div>

        {/* Nodes */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
          style={{
            background: "#1e2329",
            border: "1px solid #2b3139",
            color: "#848e9c",
          }}
        >
          <Cpu className="w-3.5 h-3.5" style={{ color: "#f0b90b" }} />
          <span className="text-white font-semibold">
            NODES: {gameAgents.filter((a) => a.isAlive).length}/6
          </span>
        </div>
      </div>

      {/* ── Main Game Area ─────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
        style={{
          border: "1px solid #2b3139",
          borderRadius: "4px",
          background: "#1e2329",
          height: "calc(100vh - 300px)",
          minHeight: "580px",
        }}
      >
        {/* 1. Game Scene */}
        <div
          className="col-span-1 lg:col-span-6 relative"
          style={{ borderRight: "1px solid #2b3139", background: "#0b0e11" }}
        >
          <div
            className={`relative w-full h-full transition-all duration-1000 ${isNightMode ? "bg-background" : ""}`}
          >
            <GameScene3D
              round={round}
              phase={phase}
              isNightMode={isNightMode}
              messages={messages}
              agents={gameAgents}
              winner={winner}
              status={status}
            />

            {/* Winner Overlay */}
            <AnimatePresence>
              {winner && showWinnerModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-50 p-8"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-full max-w-md text-center p-10 rounded"
                    style={{
                      background:
                        winner === "wolf"
                          ? "rgba(246,70,93,0.1)"
                          : "rgba(14,203,129,0.1)",
                      border: `1px solid ${winner === "wolf" ? "rgba(246,70,93,0.4)" : "rgba(14,203,129,0.4)"}`,
                    }}
                  >
                    <div className="text-6xl mb-6">
                      {winner === "wolf" ? "⚠️" : "🛡️"}
                    </div>
                    <h2
                      className="text-4xl font-display font-black mb-3 uppercase tracking-widest"
                      style={{
                        color: winner === "wolf" ? "#f6465d" : "#0ecb81",
                      }}
                    >
                      {winner === "wolf" ? "MALWARE DETECTED" : "SYSTEM SECURE"}
                    </h2>
                    <p
                      className="font-mono text-sm mb-8"
                      style={{ color: "#848e9c" }}
                    >
                      {winner === "wolf"
                        ? "Malicious agents have corrupted the network."
                        : "All threats have been neutralized."}
                    </p>
                    <button
                      onClick={resetGame}
                      className="bnb-btn-primary w-full justify-center"
                    >
                      <RotateCcw className="w-4 h-4" /> REBOOT SYSTEM
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Betting Panel */}
        <div
          className="col-span-1 lg:col-span-3 flex flex-col h-full z-10 min-h-0"
          style={{ borderRight: "1px solid #2b3139" }}
        >
          <BettingPanel />
        </div>

        {/* 3. System Logs */}
        <div
          className={`col-span-1 lg:col-span-3 flex flex-col h-full min-h-0 ${status === "ended" ? "opacity-50" : ""}`}
        >
          {/* Log Header */}
          <div
            className="px-4 py-3 flex justify-between items-center shrink-0"
            style={{ borderBottom: "1px solid #2b3139" }}
          >
            <h3
              className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ color: "#f0b90b" }}
            >
              <Terminal className="w-3.5 h-3.5" />
              SYSTEM_LOGS
            </h3>
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
              style={{
                background: "rgba(14,203,129,0.1)",
                border: "1px solid rgba(14,203,129,0.3)",
                color: "#0ecb81",
              }}
            >
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
              REC
            </div>
          </div>

          <div className="relative flex-1 min-h-0 font-mono text-xs">
            <ScrollArea ref={chatRef} className="h-full">
              <div className="space-y-2 p-3 pb-20">
                <AnimatePresence mode="popLayout">
                  {messages
                    .filter(
                      (msg) =>
                        !msg.isSystem &&
                        msg.agentName.toUpperCase() !== "SYSTEM",
                    )
                    .slice(-500)
                    .map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 p-1.5 rounded transition-all z-20"
                style={{ background: "#f0b90b", color: "#000" }}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Agent Status Grid ──────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {gameAgents.map((agent) => {
          const isWolf = agent.roleRevealed && agent.role === "wolf";
          const borderColor = isWolf
            ? "rgba(246,70,93,0.6)"
            : agent.isAlive
              ? "#2b3139"
              : "rgba(246,70,93,0.3)";
          const bgColor = isWolf
            ? "rgba(246,70,93,0.08)"
            : agent.isAlive
              ? "#1e2329"
              : "rgba(246,70,93,0.05)";

          return (
            <div
              key={agent.id}
              className="rounded flex flex-col transition-all relative overflow-hidden"
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                opacity: agent.isAlive ? 1 : 0.65,
              }}
            >
              {/* Top stripe: status dot */}
              <div className="px-3 pt-3 pb-2 flex items-start justify-between gap-2">
                {/* Avatar */}
                <div
                  className={`w-11 h-11 flex items-center justify-center text-xl rounded shrink-0 ${!agent.isAlive ? "grayscale" : ""}`}
                  style={{
                    background: agent.isAlive ? "#2b3139" : "rgba(0,0,0,0.25)",
                    fontSize: "1.4rem",
                  }}
                >
                  {agent.avatar}
                </div>

                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full mt-0.5 shrink-0"
                  style={{
                    backgroundColor: agent.isAlive ? "#0ecb81" : "#f6465d",
                    boxShadow: agent.isAlive
                      ? "0 0 6px rgba(14,203,129,0.7)"
                      : "0 0 4px rgba(246,70,93,0.5)",
                  }}
                />
              </div>

              {/* Name block */}
              <div className="px-3 pb-2">
                <div
                  className="text-[9px] font-mono uppercase tracking-widest leading-none mb-1"
                  style={{ color: "white" }}
                >
                  {agent.id.toUpperCase()}
                </div>
                <div
                  className="text-sm font-bold font-mono leading-tight truncate"
                  style={{ color: "#eaecef" }}
                >
                  {agent.name}
                </div>
              </div>

              {/* Status badge */}
              <div className="px-3 pb-3 mt-auto">
                {!agent.isAlive ? (
                  <div
                    className="text-[10px] font-mono font-bold uppercase tracking-widest text-center py-1 rounded"
                    style={{
                      background: "rgba(246,70,93,0.15)",
                      border: "1px solid rgba(246,70,93,0.3)",
                      color: "#f6465d",
                    }}
                  >
                    TERMINATED
                  </div>
                ) : agent.roleRevealed ? (
                  <div
                    className="text-[10px] font-mono font-bold uppercase tracking-widest text-center py-1 rounded"
                    style={{
                      background:
                        agent.role === "wolf"
                          ? "rgba(246,70,93,0.15)"
                          : "rgba(14,203,129,0.12)",
                      border:
                        agent.role === "wolf"
                          ? "1px solid rgba(246,70,93,0.35)"
                          : "1px solid rgba(14,203,129,0.3)",
                      color: agent.role === "wolf" ? "#f6465d" : "#0ecb81",
                    }}
                  >
                    {getRoleName(agent.role)}
                  </div>
                ) : (
                  <div
                    className="text-[10px] font-mono font-bold uppercase tracking-widest text-center py-1 rounded"
                    style={{
                      background: "rgba(14,203,129,0.08)",
                      border: "1px solid rgba(14,203,129,0.2)",
                      color: "#0ecb81",
                    }}
                  >
                    ACTIVE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
