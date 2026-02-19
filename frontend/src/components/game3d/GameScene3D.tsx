"use client";

import { useRef, useMemo, useEffect, memo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Agent3D } from "./Agent3D";
import { Campfire } from "./Campfire";
import { SpeechBubble, EventNotification } from "./SpeechBubble";
import { Decorations } from "./Decorations";
import { Agent, ChatMessage, GamePhase } from "@/lib/store";

interface GameSceneProps {
  round: number;
  phase: GamePhase;
  isNightMode: boolean;
  messages: ChatMessage[];
  agents: Agent[];
  winner: "village" | "wolf" | null;
  status: string;
}

// Agent positions in a circle
const agentPositions: [number, number, number][] = [
  [2.5, 0, 0], // Agent 1 - Right
  [1.25, 0, 2.2], // Agent 2 - Top Right
  [-1.25, 0, 2.2], // Agent 3 - Top Left
  [-2.5, 0, 0], // Agent 4 - Left
  [-1.25, 0, -2.2], // Agent 5 - Bottom Left
  [1.25, 0, -2.2], // Agent 6 - Bottom Right
  // Add more positions if more than 6 agents
  [-2.5, 0, 2.2],
  [2.5, 0, -2.2],
];

// Agent colors for speech bubbles
const agentColors: Record<string, string> = {
  p1: "#FF6B6B",
  p2: "#4ECDC4",
  p3: "#9B59B6",
  p4: "#3498DB",
  p5: "#F39C12",
  p6: "#2ECC71",
  // Add p7, p8 if needed
};

// Get bubble position based on speaker
function getSpeakerBubblePosition(
  agentId: string | null,
  agents: Agent[],
): [number, number, number] {
  const index = agents.findIndex((a) => a.id === agentId);
  if (index === -1) return [0, 3, 0];

  const basePos = agentPositions[index % agentPositions.length];
  return [basePos[0], 2.5, basePos[2]];
}

function Scene({
  round,
  phase,
  isNightMode,
  messages,
  agents,
  winner,
  status,
}: GameSceneProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // Get the last message for speech bubble
  const lastMessage = messages[messages.length - 1];
  const currentSpeakerId =
    lastMessage && !lastMessage.isSystem ? lastMessage.agentId : null;

  // Day/Night lighting transition
  useFrame(() => {
    if (ambientRef.current) {
      ambientRef.current.intensity = isNightMode ? 0.2 : 0.6;
    }
    if (lightRef.current) {
      lightRef.current.intensity = isNightMode ? 0.3 : 1;
      lightRef.current.position.set(
        isNightMode ? -5 : 5,
        isNightMode ? 8 : 10,
        isNightMode ? 5 : 5,
      );
    }
  });

  // Ground color based on phase (Underwater / Deep Ocean)
  const groundColor = isNightMode ? "#001a33" : "#1A8CA5";

  return (
    <>
      {/* Lighting */}
      <ambientLight ref={ambientRef} intensity={0.6} />
      <directionalLight
        ref={lightRef}
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Moonlight for night */}
      {isNightMode && (
        <pointLight position={[-5, 8, 5]} color="#6366f1" intensity={0.5} />
      )}

      {/* Sky/Background - Cyan for Day, Deep Blue for Night */}
      <color attach="background" args={[isNightMode ? "#002b4d" : "#4FC3F7"]} />

      {/* Stars for night */}
      {isNightMode && (
        <Stars
          radius={50}
          depth={50}
          count={1000}
          factor={3}
          saturation={0}
          fade
          speed={1}
        />
      )}

      {/* Ground (Square Arena) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={groundColor} roughness={0.9} />
      </mesh>

      {/* Outer tech border (Square) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.595, 0]}>
        <planeGeometry args={[12.2, 12.2]} />
        <meshBasicMaterial
          color={isNightMode ? "#004080" : "#AEEEEE"}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Inner square pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.59, 0]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial
          color={isNightMode ? "#004080" : "#AEEEEE"}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Decorations (Trees, Animals) */}
      <Decorations isNightMode={isNightMode} />

      {/* Campfire in center */}
      <Campfire />

      {/* Agents arranged in circle */}
      {agents.map((agent, index) => {
        // Adjust for index in case we have more agents than positions
        const position = agentPositions[index % agentPositions.length] || [
          0, 0, 0,
        ];
        // Calculate rotation to face center (0,0,0)
        // Agents face +Z by default, so we use atan2(-x, -z)
        const rotationY = Math.atan2(-position[0], -position[2]);

        return (
          <Agent3D
            key={agent.id}
            id={agent.id}
            name={agent.name}
            emoji={agent.avatar}
            position={position}
            rotation={[0, rotationY, 0]}
            isAlive={agent.isAlive}
            isSpeaking={currentSpeakerId === agent.id}
            roleRevealed={agent.roleRevealed}
            role={agent.role as any}
            isCurrentSpeaker={currentSpeakerId === agent.id}
            isNightMode={isNightMode}
          />
        );
      })}

      {/* Current speech bubble above speaker */}
      {lastMessage && !lastMessage.isSystem && (
        <SpeechBubble
          message={
            lastMessage.message.length > 50
              ? lastMessage.message.slice(0, 50) + "..."
              : lastMessage.message
          }
          position={getSpeakerBubblePosition(lastMessage.agentId, agents)}
          speakerColor={agentColors[lastMessage.agentId || ""] || "#888888"}
          speakerName={lastMessage.agentName}
        />
      )}

      {/* Winner announcement */}
      {winner && (
        <EventNotification
          text={winner === "wolf" ? "🐺 WOLVES WIN!" : "👥 VILLAGE WINS!"}
          type="winner"
        />
      )}

      {/* Camera controls - limited to prevent going underground */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// Camera controller for smooth transitions
function CameraController({ isNightMode }: { isNightMode: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    // Initial position
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

export const GameScene3D = memo(function GameScene3D(props: GameSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 8], fov: 50 }}
      style={{ background: "transparent" }}
    >
      <CameraController isNightMode={props.isNightMode} />
      <Scene {...props} />
    </Canvas>
  );
});
