import { create } from "zustand";
import { getGameProgress, getUserBets, getBalance } from "@/services/queries";
import { GameProgressResponseDto } from "@/services/models";
import { agents as staticAgents } from "@/data/agents";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export type TabId = "live" | "history" | "leaderboard" | "howtoplay" | "agents";
export type GameStatus = "in_progress" | "ended" | "pending";
export type GamePhase = "day" | "night" | "lobby";

import { io, Socket } from "socket.io-client";

export interface Agent {
  id: string;
  name: string;
  role: string;
  isAlive: boolean;
  roleRevealed: boolean;
  avatar: string;
  personality?: string;
}

export interface ChatMessage {
  id: string;
  agentId: string | null;
  agentName: string;
  message: string;
  isSystem: boolean;
  timestamp: number;
}

export interface GameEvent {
  type: string;
  message: string;
  timestamp: number;
  agentId?: string;
  round?: number;
}

export interface Market {
  id: string;
  type: "game_winner" | "round_death" | "wolf_identity";
  options: {
    target: string;
    label: string;
    odds: number;
  }[];
  resolved: boolean;
  result: string | null;
}

export interface Bet {
  id: string;
  marketId: string;
  bettor: string;
  target: string;
  amount: number;
  odds: number;
  timestamp: number;
  status: "pending" | "won" | "lost";
}

// Hardcoded avatars for now
const AVATARS: Record<string, string> = {
  "0": "🧙‍♂️",
  "1": "🐺",
  "2": "👱‍♀️",
  "3": "👴",
  "4": "🧒",
  "5": "👵",
  "6": "👮",
  "7": "👷",
};

const getAvatar = (index: number) => {
  return AVATARS[index.toString()] || "👤";
};

// Initial Markets (Placeholder until API supports markets)
const initialMarkets: Market[] = [
  {
    id: "mkt_winner",
    type: "game_winner",
    options: [
      { target: "wolf", label: "Werewolves Win", odds: 1.5 },
      { target: "villager", label: "Villagers Win", odds: 1.5 },
    ],
    resolved: false,
    result: null,
  },
  {
    id: "mkt_death",
    type: "round_death",
    options: [], // populated dynamically with alive agents
    resolved: false,
    result: null,
  },
  {
    id: "mkt_wolf",
    type: "wolf_identity",
    options: [], // populated dynamically with alive agents
    resolved: false,
    result: null,
  },
];

interface PlacedBet {
  id: string;
  betType: "game_winner" | "round_death" | "wolf_identity";
  target: string;
  targetLabel: string;
  amount: number;
  odds: number;
  round: number; // Track which round this bet was placed in
  status: "pending" | "won" | "lost";
  gameId: string;
  timestamp: number;
  payout: number | null;
  bettor: string;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  userId: string | null;
}

interface GameState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Wallet
  wallet: WalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // Game state
  gameId: string;
  status: GameStatus;
  phase: GamePhase;
  round: number;
  agents: Agent[];
  messages: ChatMessage[];
  events: GameEvent[];
  winner: "village" | "wolf" | null;
  playbackTime: number;
  startedAt: number | null;
  isPlaying: boolean;
  isNightMode: boolean;

  // Markets & Betting
  markets: Market[];
  userBets: Bet[];
  placedBets: PlacedBet[];
  selectedBet: {
    marketId: string;
    target: string;
    odds: number;
    label: string;
  } | null;
  betAmount: number;

  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => Promise<void>;
  tick: (delta: number) => void;
  fetchGameProgress: () => Promise<void>;
  fetchUserBets: () => Promise<void>;
  fetchBalance: () => Promise<void>;

  // Betting actions
  selectBet: (
    marketId: string,
    target: string,
    odds: number,
    label: string,
  ) => void;
  setBetAmount: (amount: number) => void;
  placeBet: () => void;
  clearSelectedBet: () => void;

  // Socket Actions
  setUserId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  addEvent: (event: GameEvent) => void;
  setGameStatus: (status: GameStatus) => void;
  setWinner: (winner: "village" | "wolf" | null) => void;
  setAgents: (agents: Agent[]) => void;
  setMarkets: (markets: Market[]) => void;

  // Socket
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

// ============================================
// STORE
// ============================================

export const useGameStore = create<GameState>((set, get) => ({
  // Navigation
  activeTab: "live",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Wallet
  wallet: {
    isConnected: false,
    address: null,
    balance: 100,
    userId: null,
  },
  connectWallet: () =>
    set({
      wallet: {
        isConnected: true,
        address: "0x1234...5678",
        balance: 100,
        userId: "user-123",
      },
    }),
  disconnectWallet: () =>
    set({
      wallet: {
        isConnected: false,
        address: null,
        balance: 0,
        userId: null,
      },
    }),

  // Game state
  gameId: "game-001",
  status: "in_progress",
  phase: "day",
  round: 1,
  agents: staticAgents,
  messages: [],
  events: [],
  winner: null,
  playbackTime: 0,
  startedAt: null,
  isPlaying: true,
  isNightMode: false,

  // Markets & Betting
  markets: initialMarkets,
  userBets: [],
  placedBets: [],
  selectedBet: null,
  betAmount: 10,

  // Game Actions
  startGame: () => set({ isPlaying: true }),
  pauseGame: () => set({ isPlaying: false }),
  resetGame: async () => {
    set({
      status: "in_progress",
      phase: "day",
      round: 1,
      agents: staticAgents,
      messages: [],
      events: [],
      winner: null,
      playbackTime: 0,
      startedAt: null,
      isPlaying: true,
      isNightMode: false,
      markets: initialMarkets.map((m) => ({
        ...m,
        resolved: false,
        result: null,
      })),
      placedBets: [],
    });
    await get().fetchGameProgress();
  },

  // Socket
  socket: null,
  connectSocket: () => {
    const {
      socket,
      addEvent,
      addMessage,
      setGameStatus,
      setWinner,
      setUserId,
      wallet,
    } = get();
    if (socket?.connected) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      {
        path: "/socket.io",
        transports: ["websocket"],
        reconnection: true,
      },
    );

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("subscribe_game");
      if (wallet.userId) {
        newSocket.emit("subscribe_user_bets", wallet.userId);
      }
    });

    newSocket.on("game_event", (event: any) => {
      // Map backend event to frontend
      addEvent({
        type: event.type,
        message: JSON.stringify(event.data),
        timestamp: event.timestamp,
        round: event.roundNumber,
        agentId: event.data?.playerId || event.data?.actorId,
      });

      // Handle specific event types
      if (event.type === "DAY_MESSAGE") {
        const isSystem = event.data.playerName === "SYSTEM";

        // Strictly filter out SYSTEM messages (case-insensitive)
        if (isSystem || event.data.playerName?.toUpperCase() === "SYSTEM")
          return;

        // Verify agent is valid
        const isValidAgent = staticAgents.some(
          (a) =>
            a.id === event.data.playerId || a.name === event.data.playerName,
        );
        if (!isValidAgent) return;

        addMessage({
          id: `msg-${event.timestamp}-${Date.now()}`,
          agentId: event.data.playerId,
          agentName: event.data.playerName || "Unknown",
          message: event.data.content,
          isSystem: false,
          timestamp: event.timestamp,
        });
      } else if (event.type === "GAME_END") {
        set({ status: "ended", isPlaying: false, winner: event.data.winner });
      } else if (event.type === "NIGHT_START" || event.type === "DAY_START") {
        const { agents } = get();
        set({
          phase: event.type === "NIGHT_START" ? "night" : "day",
          isNightMode: event.type === "NIGHT_START",
          round: event.roundNumber || get().round,
          // Refresh markets based on alive agents
          markets: initialMarkets.map((m) => {
            if (m.type === "round_death") {
              return {
                ...m,
                options: agents
                  .filter((a) => a.isAlive)
                  .map((a) => ({
                    target: a.id,
                    label: `${a.name} dies`,
                    odds: 2.5,
                  })),
              };
            }
            if (m.type === "wolf_identity") {
              return {
                ...m,
                options: agents
                  .filter((a) => a.isAlive)
                  .map((a) => ({
                    target: a.id,
                    label: a.name,
                    odds: 3.0,
                  })),
              };
            }
            return m;
          }),
        });
      } else if (
        event.type === "NIGHT_DEATH" ||
        event.type === "DAY_ELIMINATION"
      ) {
        const deadId = event.data.playerId || event.data.targetId;
        const { agents } = get();
        const newAgents = agents.map((a) =>
          a.id === deadId ? { ...a, isAlive: false } : a,
        );
        set({ agents: newAgents });

        // Update markets based on new alive agents
        set({
          markets: initialMarkets.map((m) => {
            if (m.type === "round_death") {
              return {
                ...m,
                options: newAgents
                  .filter((a) => a.isAlive)
                  .map((a) => ({
                    target: a.id,
                    label: `${a.name} dies`,
                    odds: 2.5,
                  })),
              };
            }
            if (m.type === "wolf_identity") {
              return {
                ...m,
                options: newAgents
                  .filter((a) => a.isAlive)
                  .map((a) => ({
                    target: a.id,
                    label: a.name,
                    odds: 3.0,
                  })),
              };
            }
            return m;
          }),
        });
      }
    });

    newSocket.on("user_bet_result", (event: any) => {
      // Update placed bets status
      const { placedBets, wallet } = get(); // Refresh state
      const updatedBets = placedBets.map((b) => {
        // Match bet ID somehow? Backend sends 'bet' object with 'id'.
        // Frontend 'placedBets' has 'id'.
        // We need to ensure IDs match or we can map them.
        // Assuming backend ID is used if we fetch bets.
        // If we created optimistic bet with temp ID, we might have issue.
        // But for now, let's assume we fetch bets or use backend IDs.
        if (b.id === event.bet.id) {
          return { ...b, status: event.bet.status.toLowerCase() };
        }
        return b;
      });
      // Update user balance if won
      if (event.type === "BET_WON") {
        set({
          wallet: {
            ...wallet,
            balance: wallet.balance + (event.bet.payout || 0),
          },
        });
        toast.success(`You won a bet! +${event.bet.payout}`);
      }
      set({ placedBets: updatedBets });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchGameProgress: async () => {
    try {
      const data = await getGameProgress();

      const agents: Agent[] = [
        ...data.players.alive.map((p, idx) => {
          const staticAgent = staticAgents.find((a) => a.id === p.id);
          return {
            id: p.id,
            name: staticAgent?.name || p.name,
            role: (p as any)?.role?.toLowerCase() ?? "villager",
            isAlive: true,
            roleRevealed: false,
            avatar: staticAgent?.avatar || getAvatar(idx % 8),
            personality: staticAgent?.personality,
          };
        }),
        ...data.players.dead.map((p, idx) => {
          const staticAgent = staticAgents.find((a) => a.id === p.id);
          return {
            id: p.id,
            name: staticAgent?.name || p.name,
            role: p.role.toLowerCase(),
            isAlive: false,
            roleRevealed: true,
            avatar: staticAgent?.avatar || getAvatar(idx % 8),
            personality: staticAgent?.personality,
          };
        }),
      ];

      const rawMessages = data.messages.map((m, idx) => ({
        id: `msg-${m.timestamp}-${idx}`,
        agentId: m.playerId || null,
        agentName: m.playerName || "Unknown",
        message: m.content,
        isSystem: m.playerName === "SYSTEM",
        timestamp: m.timestamp,
      }));

      const messages = rawMessages.filter((msg) => {
        // Filter out ALL system messages (case-insensitive)
        if (msg.isSystem || msg.agentName.toUpperCase() === "SYSTEM") {
          return false;
        }

        // Ensure message is from one of the known agents
        const isValidAgent = staticAgents.some(
          (a) => a.id === msg.agentId || a.name === msg.agentName,
        );

        return isValidAgent;
      });

      // Sort events by timestamp
      const events: GameEvent[] = data.events.map((e) => ({
        type: e.type,
        message: JSON.stringify(e.data),
        timestamp: e.timestamp,
        round: e.roundNumber,
      }));

      // Check for game end event
      const gameEndEvent = data.events.find((e) => e.type === "GAME_END");
      const winner = gameEndEvent ? (gameEndEvent.data as any)?.winner : null;

      set({
        gameId: data.gameId,
        status: gameEndEvent || !data.isRunning ? "ended" : "in_progress",
        round: data.currentRound,
        // Map API phase
        phase: (data.currentPhase as GamePhase) || "day",
        isNightMode: ((data.currentPhase as GamePhase) || "day") === "night",
        agents,
        messages,
        events,
        winner: winner as "village" | "wolf" | null,
        // Calculate playback time?
        playbackTime: data.startedAt
          ? Date.now() - new Date(data.startedAt).getTime()
          : 0,
        startedAt: data.startedAt ? new Date(data.startedAt).getTime() : null,
        isPlaying: !gameEndEvent && data.isRunning,
        // Update markets based on alive agents
        markets: initialMarkets.map((m) => {
          if (m.type === "round_death") {
            return {
              ...m,
              options: agents
                .filter((a) => a.isAlive)
                .map((a) => ({
                  target: a.id,
                  label: `${a.name} dies`,
                  odds: 2.5, // Backend constant: NEXT_DEATH
                })),
            };
          }
          if (m.type === "wolf_identity") {
            return {
              ...m,
              options: agents
                .filter((a) => a.isAlive)
                .map((a) => ({
                  target: a.id,
                  label: a.name,
                  odds: 3.0, // Backend constant: WEREWOLF
                })),
            };
          }
          return m;
        }),
      });
    } catch (error) {
      console.error("Failed to fetch game progress:", error);
    }
  },

  tick: (delta) => {
    const state = get();
    if (!state.isPlaying || state.status === "ended") return;

    // Just advance time if needed, or rely on polling
    const newTime = state.playbackTime + delta;
    set({ playbackTime: newTime });
  },

  // Betting Actions
  selectBet: (marketId, target, odds, label) =>
    set({ selectedBet: { marketId, target, odds, label } }),

  setBetAmount: (amount) => set({ betAmount: amount }),

  placeBet: () => {
    const state = get();
    if (!state.selectedBet || !state.wallet.isConnected) return;
    if (state.betAmount > state.wallet.balance) return;

    const newBet: PlacedBet = {
      id: `bet-${Date.now()}`,
      betType: state.markets.find((m) => m.id === state.selectedBet!.marketId)!
        .type as PlacedBet["betType"],
      target: state.selectedBet.target,
      targetLabel: state.selectedBet.label,
      amount: state.betAmount,
      odds: state.selectedBet.odds,
      round: state.round, // Store the current round
      status: "pending",
      gameId: state.gameId,
      timestamp: Date.now(),
      payout: null,
      bettor: state.wallet.userId || "unknown",
    };

    set({
      placedBets: [...state.placedBets, newBet],
      selectedBet: null,
      betAmount: 10,
      wallet: {
        ...state.wallet,
        balance: state.wallet.balance - state.betAmount,
      },
    });
  },

  clearSelectedBet: () => set({ selectedBet: null, betAmount: 10 }),

  // Socket Actions
  setUserId: (id) => {
    set((state) => ({ wallet: { ...state.wallet, userId: id } }));
    const { socket } = get();
    if (socket?.connected && id) {
      socket.emit("subscribe_user_bets", id);
      get().fetchUserBets();
    }
  },
  fetchUserBets: async () => {
    const { wallet, agents } = get();
    if (!wallet.userId) return;

    try {
      const bets = (await getUserBets(wallet.userId)) as unknown as any[];
      if (!Array.isArray(bets)) return;

      const placedBets: PlacedBet[] = bets.map((b: any) => {
        let label = b.targetId || b.predictedWinner;
        const agent = agents.find((a) => a.id === b.targetId);
        if (agent) label = agent.name;
        if (b.betType === "WINNER") {
          label =
            b.predictedWinner === "villager"
              ? "Villagers Win"
              : "Werewolves Win";
        } else if (b.betType === "NEXT_DEATH" && agent) {
          label = `${agent.name} dies`;
        } else if (b.betType === "WOLF_IDENTITY" && agent) {
          label = `${agent.name} is Wolf`;
        }

        return {
          id: b.id,
          betType:
            b.betType === "WINNER"
              ? "game_winner"
              : b.betType === "NEXT_DEATH"
                ? "round_death"
                : "wolf_identity",
          target: b.targetId || b.predictedWinner,
          targetLabel: label,
          amount: b.amount,
          odds: b.odds,
          round: Number(b.roundNumber ?? b.round ?? b.round_number ?? 0),
          status: b.status.toLowerCase(),
          gameId: b.gameId || b.game_id || "unknown",
          timestamp: b.createdAt ? new Date(b.createdAt).getTime() : Date.now(),
          payout: b.payout || null,
          bettor: b.userId || wallet.userId || "unknown",
        };
      });
      set({ placedBets });
    } catch (error) {
      console.error("Failed to fetch user bets:", error);
    }
  },
  fetchBalance: async () => {
    const { wallet } = get();
    if (!wallet.userId) return;
    try {
      const resp = await getBalance(wallet.userId);
      set({ wallet: { ...wallet, balance: resp.balance } });
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  },
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  setGameStatus: (status) => set({ status }),
  setWinner: (winner) => set({ winner }),
  setAgents: (agents) => set({ agents }),
  setMarkets: (markets) => set({ markets }),
}));
