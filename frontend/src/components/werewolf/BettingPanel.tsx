"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Target,
  Trophy,
  Skull,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Dna,
  Zap,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePlaceBet } from "@/services/queries";

export function BettingPanel() {
  const {
    markets,
    selectedBet,
    selectBet,
    betAmount,
    setBetAmount,
    placeBet,
    clearSelectedBet,
    wallet,
    placedBets,
    status,
    round,
    agents,
    fetchUserBets,
    fetchBalance,
    gameId,
  } = useGameStore();

  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<
    string | null
  >(null);

  const gameWinnerMarket = markets.find((m) => m.type === "game_winner");
  const roundDeathMarket = markets.find((m) => m.type === "round_death");
  const wolfIdMarket = markets.find((m) => m.type === "wolf_identity");

  const currentGameBets = placedBets.filter((b) => b.gameId === gameId);
  const gameWinnerBet = currentGameBets.find(
    (b) => b.betType === "game_winner",
  );
  const roundDeathBet = currentGameBets.find(
    (b) => b.betType === "round_death" && b.round === round,
  );
  const wolfIdentityBet = currentGameBets.find(
    (b) => b.betType === "wolf_identity",
  );

  const hasGameWinnerBet = !!gameWinnerBet;
  const hasRoundDeathBet = !!roundDeathBet;
  const hasWolfIdentityBet = !!wolfIdentityBet;
  const isBettingDisabled = status === "ended";

  const { mutate: placeBetMutation } = usePlaceBet();

  const handlePlaceBet = () => {
    if (!wallet.isConnected) {
      toast.error("Connect wallet required");
      return;
    }
    if (betAmount > wallet.balance) {
      toast.error("Insufficient funds");
      return;
    }
    if (!selectedBet) return;
    if (!wallet.userId) {
      toast.error("User sync pending...");
      return;
    }

    const market = markets.find((m) => m.id === selectedBet.marketId);
    if (!market) return;

    let apiBetType: "WINNER" | "NEXT_DEATH" | "WEREWOLF" = "WINNER";
    let targetId: string | undefined;
    let predictedWinner: "werewolf" | "villager" | undefined;

    if (market.type === "game_winner") {
      apiBetType = "WINNER";
      predictedWinner = selectedBet.target === "wolf" ? "werewolf" : "villager";
    } else if (market.type === "round_death") {
      apiBetType = "NEXT_DEATH";
      targetId = selectedBet.target;
    } else if (market.type === "wolf_identity") {
      apiBetType = "WEREWOLF";
      targetId = selectedBet.target;
    }

    placeBetMutation(
      {
        data: {
          gameId,
          userId: wallet.userId,
          betType: apiBetType,
          amount: betAmount,
          targetId,
          predictedWinner,
        },
      },
      {
        onSuccess: () => {
          placeBet();
          toast.success(`${betAmount} BNB committed to ${selectedBet?.label}`, {
            icon: "✅",
          });
          setTimeout(() => {
            fetchUserBets();
            fetchBalance();
          }, 1000);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Transaction failed");
        },
      },
    );
  };

  const renderMarketOptions = () => {
    let market: typeof gameWinnerMarket | undefined = undefined;
    let existingBet: typeof gameWinnerBet | undefined = undefined;

    if (selectedMarketCategory === "game_winner") {
      market = gameWinnerMarket;
      existingBet = gameWinnerBet;
    } else if (selectedMarketCategory === "round_death") {
      market = roundDeathMarket;
      existingBet = roundDeathBet;
    } else if (selectedMarketCategory === "wolf_identity") {
      market = wolfIdMarket;
      existingBet = wolfIdentityBet;
    }

    if (!market)
      return (
        <div className="p-4 text-center" style={{ color: "#848e9c" }}>
          Market Offline
        </div>
      );

    return (
      <div className="grid grid-cols-2 gap-3 pb-20">
        {market.options.map((opt) => (
          <button
            key={opt.target}
            onClick={() => {
              if (isBettingDisabled || existingBet) return;
              selectBet(market!.id, opt.target, opt.odds, opt.label);
              setIsBettingModalOpen(false);
            }}
            disabled={!!existingBet || isBettingDisabled}
            className={cn(
              "bnb-market-tile text-left flex flex-col justify-between h-28",
              selectedBet?.target === opt.target &&
                selectedBet?.marketId === market!.id &&
                "selected",
              (!!existingBet || isBettingDisabled) &&
                "opacity-40 cursor-not-allowed pointer-events-none",
            )}
          >
            <div className="flex justify-between items-start w-full">
              <span
                className="text-[11px] font-mono uppercase tracking-wider"
                style={{ color: "#848e9c" }}
              >
                {opt.label === "Werewolf"
                  ? "MALWARE"
                  : opt.label === "Villager"
                    ? "SYSTEM"
                    : opt.label}
              </span>
              {existingBet?.target === opt.target && (
                <CheckCircle2
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#f0b90b" }}
                />
              )}
            </div>

            <div className="flex items-end justify-between mt-auto">
              <span
                className="text-[10px] font-mono"
                style={{ color: "#474d57" }}
              >
                ODDS
              </span>
              <span
                className="text-2xl font-mono font-bold"
                style={{ color: opt.target === "wolf" ? "#f6465d" : "#0ecb81" }}
              >
                {opt.odds}x
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col relative overflow-hidden"
      style={{ background: "#1e2329" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex justify-between items-center shrink-0"
        style={{ borderBottom: "1px solid #2b3139" }}
      >
        <div className="flex items-center gap-2">
          <Target
            className="w-3.5 h-3.5 animate-pulse"
            style={{ color: "#f0b90b" }}
          />
          <h2
            className="text-xs font-mono font-bold uppercase tracking-widest"
            style={{ color: "#eaecef" }}
          >
            Markets
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${status === "in_progress" ? "animate-pulse" : ""}`}
            style={{
              backgroundColor: status === "in_progress" ? "#f0b90b" : "#474d57",
            }}
          />
          <span className="text-[10px] font-mono" style={{ color: "#848e9c" }}>
            {status === "in_progress" ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {/* Main Action Button */}
          <button
            onClick={() => {
              setIsBettingModalOpen(true);
              setSelectedMarketCategory(null);
            }}
            disabled={status === "ended"}
            className="w-full py-5 rounded flex flex-col items-center justify-center gap-1 transition-all group"
            style={
              status === "ended"
                ? {
                    background: "#2b3139",
                    border: "1px solid #474d57",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }
                : {
                    background: "rgba(240,185,11,0.07)",
                    border: "1px solid rgba(240,185,11,0.35)",
                    color: "#f0b90b",
                  }
            }
          >
            {status === "ended" ? (
              <>
                <X
                  className="w-5 h-5 mb-0.5 text-current"
                  style={{ color: "#848e9c" }}
                />
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#848e9c" }}
                >
                  Markets Closed
                </span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black tracking-[0.18em] font-display uppercase">
                  Place Bet
                </span>
                <span className="text-[10px] font-mono opacity-70">
                  Choose prediction market
                </span>
              </>
            )}
          </button>

          {/* Active Bets */}
          {placedBets.length > 0 && (
            <div>
              <h3
                className="text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 mb-3"
                style={{ color: "#848e9c" }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Active Transactions
              </h3>
              <div className="space-y-2">
                {placedBets
                  .slice()
                  .reverse()
                  .map((bet) => (
                    <div
                      key={bet.id}
                      className="p-3 flex justify-between items-center text-xs font-mono rounded"
                      style={{
                        background: "#2b3139",
                        border: "1px solid rgba(43,49,57,0.8)",
                      }}
                    >
                      <div>
                        <div
                          className="font-bold uppercase mb-0.5"
                          style={{ color: "#eaecef" }}
                        >
                          {bet.targetLabel === "Werewolf"
                            ? "MALWARE"
                            : bet.targetLabel === "Villager"
                              ? "SYSTEM"
                              : bet.targetLabel}
                        </div>
                        <div
                          className="text-[10px] flex items-center gap-1"
                          style={{ color: "#848e9c" }}
                        >
                          <span
                            className="uppercase"
                            style={{
                              color:
                                bet.betType === "round_death"
                                  ? "#f6465d"
                                  : "#f0b90b",
                            }}
                          >
                            {bet.betType.replace("_", " ")}
                          </span>
                          <span>•</span>
                          <span>{bet.odds}x</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: "#f0b90b" }}>
                          {bet.amount} BNB
                        </div>
                        <div className="text-[10px]">
                          {getStatusBadge(bet.status)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* BETTING MODAL */}
      <AnimatePresence>
        {isBettingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col"
            style={{ background: "#1e2329" }}
          >
            {/* Modal Header */}
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ borderBottom: "1px solid #2b3139" }}
            >
              <div className="flex items-center gap-2">
                {selectedMarketCategory && (
                  <button
                    onClick={() => setSelectedMarketCategory(null)}
                    className="p-1 rounded hover:bg-white/5 transition-colors mr-1"
                  >
                    <ChevronLeft
                      className="w-5 h-5"
                      style={{ color: "#848e9c" }}
                    />
                  </button>
                )}
                <h2
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: "#eaecef" }}
                >
                  {selectedMarketCategory
                    ? selectedMarketCategory === "game_winner"
                      ? "Simulation Outcome"
                      : selectedMarketCategory === "round_death"
                        ? "Next Termination"
                        : "Malware Origin"
                    : "Select Market"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsBettingModalOpen(false);
                  setSelectedMarketCategory(null);
                }}
                className="p-1.5 rounded hover:bg-white/5 transition-colors"
                style={{ color: "#848e9c" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 p-4">
              {!selectedMarketCategory ? (
                <div className="space-y-3">
                  {/* Game Winner */}
                  {gameWinnerMarket && (
                    <button
                      onClick={() => setSelectedMarketCategory("game_winner")}
                      disabled={hasGameWinnerBet || isBettingDisabled}
                      className="w-full p-5 rounded text-left transition-all group relative"
                      style={
                        hasGameWinnerBet
                          ? {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }
                          : {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!hasGameWinnerBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "rgba(240,185,11,0.5)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(240,185,11,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!hasGameWinnerBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#2b3139";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#2b3139";
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded"
                            style={{
                              background: "rgba(240,185,11,0.1)",
                              border: "1px solid rgba(240,185,11,0.2)",
                            }}
                          >
                            <Trophy
                              className="w-5 h-5"
                              style={{ color: "#f0b90b" }}
                            />
                          </div>
                          <div>
                            <h3
                              className="font-bold uppercase tracking-wider text-sm mb-0.5"
                              style={{ color: "#eaecef" }}
                            >
                              Simulation Outcome
                            </h3>
                            <p
                              className="text-[11px] font-mono"
                              style={{ color: "#848e9c" }}
                            >
                              Predict Protocol vs Virus Victory
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: "#848e9c" }}
                        />
                      </div>
                      {hasGameWinnerBet && (
                        <div
                          className="absolute top-2.5 right-8 text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(240,185,11,0.15)",
                            color: "#f0b90b",
                            border: "1px solid rgba(240,185,11,0.3)",
                          }}
                        >
                          FULFILLED
                        </div>
                      )}
                    </button>
                  )}

                  {/* Round Death */}
                  {roundDeathMarket && (
                    <button
                      onClick={() => setSelectedMarketCategory("round_death")}
                      disabled={hasRoundDeathBet || isBettingDisabled}
                      className="w-full p-5 rounded text-left transition-all group relative"
                      style={
                        hasRoundDeathBet
                          ? {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }
                          : {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!hasRoundDeathBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "rgba(246,70,93,0.5)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(246,70,93,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!hasRoundDeathBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#2b3139";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#2b3139";
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded"
                            style={{
                              background: "rgba(246,70,93,0.1)",
                              border: "1px solid rgba(246,70,93,0.2)",
                            }}
                          >
                            <Skull
                              className="w-5 h-5"
                              style={{ color: "#f6465d" }}
                            />
                          </div>
                          <div>
                            <h3
                              className="font-bold uppercase tracking-wider text-sm mb-0.5"
                              style={{ color: "#eaecef" }}
                            >
                              Next Termination
                            </h3>
                            <p
                              className="text-[11px] font-mono"
                              style={{ color: "#848e9c" }}
                            >
                              Predict next node failure
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: "#848e9c" }}
                        />
                      </div>
                      {hasRoundDeathBet && (
                        <div
                          className="absolute top-2.5 right-8 text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(240,185,11,0.15)",
                            color: "#f0b90b",
                            border: "1px solid rgba(240,185,11,0.3)",
                          }}
                        >
                          FULFILLED
                        </div>
                      )}
                    </button>
                  )}

                  {/* Wolf Identity */}
                  {wolfIdMarket && (
                    <button
                      onClick={() => setSelectedMarketCategory("wolf_identity")}
                      disabled={hasWolfIdentityBet || isBettingDisabled}
                      className="w-full p-5 rounded text-left transition-all group relative"
                      style={
                        hasWolfIdentityBet
                          ? {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }
                          : {
                              background: "#2b3139",
                              border: "1px solid #2b3139",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!hasWolfIdentityBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "rgba(240,185,11,0.5)";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(240,185,11,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!hasWolfIdentityBet) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = "#2b3139";
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#2b3139";
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded"
                            style={{
                              background: "rgba(240,185,11,0.1)",
                              border: "1px solid rgba(240,185,11,0.2)",
                            }}
                          >
                            <Dna
                              className="w-5 h-5"
                              style={{ color: "#f0b90b" }}
                            />
                          </div>
                          <div>
                            <h3
                              className="font-bold uppercase tracking-wider text-sm mb-0.5"
                              style={{ color: "#eaecef" }}
                            >
                              Malware Origin
                            </h3>
                            <p
                              className="text-[11px] font-mono"
                              style={{ color: "#848e9c" }}
                            >
                              Identify source of infection
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: "#848e9c" }}
                        />
                      </div>
                      {hasWolfIdentityBet && (
                        <div
                          className="absolute top-2.5 right-8 text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(240,185,11,0.15)",
                            color: "#f0b90b",
                            border: "1px solid rgba(240,185,11,0.3)",
                          }}
                        >
                          FULFILLED
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  {renderMarketOptions()}
                </motion.div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION SLIP */}
      <AnimatePresence>
        {selectedBet && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-50 p-5"
            style={{
              background: "#161a1f",
              borderTop: "1px solid rgba(240,185,11,0.5)",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, #f0b90b, transparent)",
              }}
            />

            <div className="flex justify-between items-end mb-4">
              <div>
                <div
                  className="text-[10px] font-mono uppercase tracking-widest mb-1"
                  style={{ color: "#f0b90b" }}
                >
                  Confirm Prediction
                </div>
                <div
                  className="text-lg font-bold font-display uppercase tracking-wider truncate max-w-[200px]"
                  style={{ color: "#eaecef" }}
                >
                  {selectedBet.label === "Werewolf"
                    ? "MALWARE"
                    : selectedBet.label === "Villager"
                      ? "SYSTEM"
                      : selectedBet.label}
                </div>
              </div>
              <div
                className="text-3xl font-mono font-bold"
                style={{ color: "#f0b90b" }}
              >
                {selectedBet.odds}x
              </div>
            </div>

            {/* Amount Input */}
            <div className="relative mb-3">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={1}
                max={wallet.balance}
                className="bnb-input pr-14 h-12 text-base"
                placeholder="Amount"
              />
              <span
                className="absolute right-4 top-3.5 text-xs font-mono"
                style={{ color: "#848e9c" }}
              >
                BNB
              </span>
            </div>

            <div
              className="flex justify-between items-center mb-4 text-xs font-mono"
              style={{ color: "#848e9c" }}
            >
              <span>Potential Payout</span>
              <span className="font-bold" style={{ color: "#f0b90b" }}>
                {(betAmount * selectedBet.odds).toFixed(2)} BNB
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={clearSelectedBet}
                className="flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded transition-colors"
                style={{
                  background: "#2b3139",
                  color: "#848e9c",
                  border: "1px solid #2b3139",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBet}
                disabled={status === "ended" || !wallet.isConnected}
                className="flex-2 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2"
                style={{
                  background: "#f0b90b",
                  color: "#181a20",
                  opacity: status === "ended" || !wallet.isConnected ? 0.5 : 1,
                }}
              >
                {wallet.isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Execute
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "won":
      return <span style={{ color: "#0ecb81" }}>WON</span>;
    case "lost":
      return <span style={{ color: "#f6465d" }}>LOST</span>;
    case "pending":
      return (
        <span className="animate-pulse" style={{ color: "#f0b90b" }}>
          PENDING
        </span>
      );
    default:
      return <span>{status}</span>;
  }
}
