import { NextResponse } from "next/server";

// Mock data based on game_script.example.json
const MOCK_GAME_DATA = {
  gameId: "game_001",
  status: "in_progress", // forced to in_progress for testing
  winner: null,
  startedAt: new Date().toISOString(),
  currentRound: 2,
  currentPhase: "day",
  players: [
    {
      id: "p1",
      name: "Alpha",
      role: "wolf",
      isAlive: false,
      roleRevealed: true,
    },
    {
      id: "p2",
      name: "Beta",
      role: "villager",
      isAlive: true,
      roleRevealed: false,
    },
    {
      id: "p3",
      name: "Gamma",
      role: "seer",
      isAlive: true,
      roleRevealed: false,
    },
    {
      id: "p4",
      name: "Delta",
      role: "wolf",
      isAlive: false,
      roleRevealed: true,
    },
    {
      id: "p5",
      name: "Epsilon",
      role: "villager",
      isAlive: false,
      roleRevealed: true,
    },
    {
      id: "p6",
      name: "Zeta",
      role: "villager",
      isAlive: false,
      roleRevealed: true,
    },
    {
      id: "p7",
      name: "Eta",
      role: "villager",
      isAlive: true,
      roleRevealed: false,
    },
    {
      id: "p8",
      name: "Theta",
      role: "villager",
      isAlive: true,
      roleRevealed: false,
    },
  ],
  rounds: [
    {
      roundNumber: 1,
      phase: "night",
      actions: [
        {
          actorId: "p1",
          role: "wolf",
          type: "kill",
          targetId: "p6",
          timestamp: Date.now() - 100000,
        },
      ],
      result: {
        deaths: ["p6"],
        timestamp: Date.now() - 95000,
      },
    },
    {
      roundNumber: 1,
      phase: "day",
      messages: [
        {
          id: "m1",
          playerId: "p1",
          playerName: "Alpha",
          content:
            "Sad to see Zeta go so early. We need to focus on finding who did this.",
          timestamp: Date.now() - 90000,
        },
        {
          id: "m2",
          playerId: "p3",
          playerName: "Gamma",
          content: "I have a feeling about p1. He seems too eager to lead.",
          timestamp: Date.now() - 85000,
        },
        {
          id: "m3",
          playerId: "p2",
          playerName: "Beta",
          content: "I agree with Gamma. p1 is acting suspicious.",
          timestamp: Date.now() - 80000,
        },
      ],
      votes: [
        { voterId: "p2", targetId: "p1" },
        { voterId: "p3", targetId: "p1" },
      ],
      result: {
        eliminatedPlayerId: "p1",
        timestamp: Date.now() - 70000,
      },
    },
    {
      roundNumber: 2,
      phase: "night",
      actions: [
        {
          actorId: "p4",
          role: "wolf",
          type: "kill",
          targetId: "p5",
          timestamp: Date.now() - 60000,
        },
      ],
      result: {
        deaths: ["p5"],
        timestamp: Date.now() - 55000,
      },
    },
    {
      roundNumber: 2,
      phase: "day",
      messages: [
        {
          id: "m4",
          playerId: "p2",
          playerName: "Beta",
          content: "Another villager down...",
          timestamp: Date.now() - 50000,
        },
      ],
      votes: [],
      result: {},
    },
  ],
};

export async function GET() {
  // Transform mock data to GameProgressResponseDto
  const alivePlayers = MOCK_GAME_DATA.players.filter((p) => p.isAlive);
  const deadPlayers = MOCK_GAME_DATA.players.filter((p) => !p.isAlive);

  const messages = MOCK_GAME_DATA.rounds.flatMap((r) =>
    (r.messages || []).map((m: any) => ({
      ...m,
      roundNumber: r.roundNumber,
    })),
  );

  const events = MOCK_GAME_DATA.rounds.flatMap((r) => {
    const roundEvents: any[] = [];

    // Action events
    if (r.actions) {
      r.actions.forEach((a: any) => {
        roundEvents.push({
          type: a.type === "kill" ? "NIGHT_ATTACK" : "NIGHT_ACTION",
          data: a,
          timestamp: a.timestamp || Date.now(),
          roundNumber: r.roundNumber,
        });
      });
    }

    // Result events (Death)
    if (r.result && r.result.deaths) {
      r.result.deaths.forEach((d: string) => {
        roundEvents.push({
          type: "NIGHT_DEATH",
          data: { playerId: d, description: `Player ${d} was killed` },
          timestamp: r.result.timestamp || Date.now(),
          roundNumber: r.roundNumber,
        });
      });
    }

    // Result events (Elimination)
    if (r.result && r.result.eliminatedPlayerId) {
      roundEvents.push({
        type: "DAY_ELIMINATION",
        data: {
          playerId: r.result.eliminatedPlayerId,
          description: `Player ${r.result.eliminatedPlayerId} was eliminated`,
        },
        timestamp: r.result.timestamp || Date.now(),
        roundNumber: r.roundNumber,
      });
    }

    return roundEvents;
  });

  return NextResponse.json({
    gameId: MOCK_GAME_DATA.gameId,
    isRunning: MOCK_GAME_DATA.status === "in_progress",
    currentRound: MOCK_GAME_DATA.currentRound,
    currentPhase: MOCK_GAME_DATA.currentPhase,
    startedAt: MOCK_GAME_DATA.startedAt,
    players: {
      alive: alivePlayers,
      dead: deadPlayers,
    },
    messages: messages,
    events: events,
  });
}
