"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";

export function ChatMessage({
  message,
}: {
  message: {
    agentId: string | null;
    agentName: string;
    message: string;
    isSystem: boolean;
    timestamp: number;
  };
}) {
  const { agents } = useGameStore();
  const agent = agents.find((a) => a.id === message.agentId);

  // Agent colors mapping for Cyberpunk theme
  const agentColors: Record<string, string> = {
    p1: "#EF4444", // Red
    p2: "#3B82F6", // Blue
    p3: "#10B981", // Green
    p4: "#F59E0B", // Orange
    p5: "#F0B90B", // Yellow
    p6: "#EC4899", // Pink
  };

  if (message.isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="py-1 text-center font-mono text-[10px] text-primary/70 my-2 relative"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary/20"></div>
        </div>
        <span className="relative bg-black px-2 uppercase tracking-widest">
          {message.message}
        </span>
      </motion.div>
    );
  }

  const isMalware = agent?.roleRevealed && agent?.role === "wolf";
  const color = agentColors[message.agentId || ""] || "#888";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 p-2 mb-2 rounded-sm border-l-2 transition-all relative group hover:bg-white/5 ${isMalware ? "border-red-500 bg-red-900/10" : "border-gray-700 bg-black/20"}`}
      style={{ borderLeftColor: isMalware ? "#EF4444" : color }}
    >
      <div className="text-xl shrink-0 h-fit opacity-80 group-hover:opacity-100 transition-opacity">
        {agent?.avatar || "🤖"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="font-bold text-[10px] uppercase tracking-wider font-mono"
            style={{ color: isMalware ? "#EF4444" : color }}
          >
            {message.agentName}
          </span>
          <span className="text-[9px] text-gray-500 font-mono">
            T+
            {Math.floor(
              (message.timestamp - (useGameStore.getState().startedAt || 0)) /
                1000,
            )}
            s
          </span>
          {isMalware && (
            <span className="text-[8px] bg-red-500 text-black px-1 font-bold rounded-sm animate-pulse">
              MALWARE
            </span>
          )}
        </div>
        <p
          className={`text-xs font-mono leading-relaxed ${isMalware ? "text-red-200" : "text-gray-300"}`}
        >
          {message.message}
        </p>
      </div>
    </motion.div>
  );
}
