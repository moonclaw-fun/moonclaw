"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore, GamePhase, GameStatus } from "@/lib/store";

export function GameSocketListener() {
  const socketRef = useRef<Socket | null>(null);
  const {
    addMessage,
    addEvent,
    setGameStatus,
    setWinner,
    phase,
    round,
    fetchGameProgress,
  } = useGameStore();

  // Default to localhost:3001 if not set
  const SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

  useEffect(() => {
    // Initialize socket
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Game Socket", socket.id);
      socket.emit("subscribe_game");
      // socket.emit("get_game_info"); // Using fetchGameProgress instead
    });

    // Fetch initial game state once
    fetchGameProgress();

    socket.on("game_event", (event: any) => {
      console.log("Game Event:", event);

      // Map types
      let eventType:
        | "death"
        | "elimination"
        | "investigation"
        | "phase_change"
        | "vote"
        | null = null;

      switch (event.type) {
        case "NIGHT_DEATH":
          eventType = "death";
          break;
        case "DAY_ELIMINATION":
          eventType = "elimination";
          break;
        case "DAY_VOTE":
          eventType = "vote";
          break;
        case "NIGHT_ACTION":
          eventType = "investigation";
          break; // Approximate
        case "GAME_PHASE":
          eventType = "phase_change";
          break;
      }

      if (eventType) {
        addEvent({
          type: eventType,
          timestamp: Date.now(),
          message:
            typeof event.data === "string"
              ? event.data
              : event.data?.description || JSON.stringify(event.data),
          agentId: event.data?.agentId || undefined,
          round: event.data?.round || round,
        });
      }

      // Handle specific event types for logic or messages
      // Check if event type is DAY_MESSAGE or NIGHT_MESSAGE or just MESSAGE
      if (event.type === "DAY_MESSAGE" || event.type === "MESSAGE") {
        addMessage({
          id: `msg-${Date.now()}-${Math.random()}`,
          agentId: event.data?.agentId || null,
          agentName: event.data?.sender || "System",
          message: event.data?.content || "",
          timestamp: Date.now(),
          isSystem: false,
        });
      } else if (event.type === "GAME_END") {
        setGameStatus("ended");
        setWinner(event.data?.winner === "werewolf" ? "wolf" : "village");
      } else if (event.type === "GAME_START") {
        setGameStatus("in_progress");
      }
    });

    socket.on("game_state", (state: any) => {
      // Full state sync if needed
      console.log("Game State:", state);
      if (state.status) {
        setGameStatus(state.status === "ENDED" ? "ended" : "in_progress");
      }
    });

    socket.on("user_balance", (data: { userId: string; balance: number }) => {
      const { wallet } = useGameStore.getState();
      // Check if update is for current user
      if (wallet.userId === data.userId || wallet.address === data.userId) {
        useGameStore.setState({
          wallet: { ...wallet, balance: data.balance },
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [
    addMessage,
    addEvent,
    setGameStatus,
    setWinner,
    SERVER_URL,
    phase,
    round,
    fetchGameProgress,
  ]);

  return null;
}
