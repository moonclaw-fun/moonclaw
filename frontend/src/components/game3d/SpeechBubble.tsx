"use client";

import { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface SpeechBubbleProps {
  message: string;
  position: [number, number, number];
  speakerColor: string;
  speakerName: string;
  isSystem?: boolean;
}

export const SpeechBubble = memo(function SpeechBubble({
  message,
  position,
  speakerColor,
  speakerName,
  isSystem = false,
}: SpeechBubbleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(1);

  // Calculate bubble width based on message length
  const maxWidth = Math.min(message.length * 0.08, 3);
  const lines = Math.ceil(message.length / 30);
  const height = 0.3 + lines * 0.15;

  // Fade in and float up animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Float up slightly
      groupRef.current.position.y += delta * 0.1;

      // Gentle sway
      groupRef.current.position.x =
        position[0] + Math.sin(state.clock.elapsedTime * 2) * 0.02;

      // Start fading after 3 seconds
      const age = state.clock.elapsedTime % 5;
      if (age > 3) {
        opacityRef.current = Math.max(0, 1 - (age - 3) / 2);
        groupRef.current.visible = opacityRef.current > 0;
      }
    }
  });

  if (isSystem) {
    return (
      <group ref={groupRef} position={position}>
        <RoundedBox args={[maxWidth, height, 0.05]} radius={0.1} smoothness={2}>
          <meshBasicMaterial color="#161B22" transparent opacity={0.9} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.12}
          maxWidth={maxWidth - 0.1}
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {message}
          <meshBasicMaterial color="#FFFFFF" />
        </Text>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Bubble background */}
      <RoundedBox args={[maxWidth, height, 0.05]} radius={0.1} smoothness={2}>
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.95} />
      </RoundedBox>

      {/* Speaker name */}
      <Text
        position={[-maxWidth / 2 + 0.1, height / 2 - 0.08, 0.03]}
        fontSize={0.08}
        anchorX="left"
        anchorY="middle"
      >
        {speakerName}
        <meshBasicMaterial color={speakerColor} />
      </Text>

      {/* Message */}
      <Text
        position={[0, -0.02, 0.03]}
        fontSize={0.1}
        maxWidth={maxWidth - 0.15}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {message}
        <meshBasicMaterial color="#333333" />
      </Text>

      {/* Tail pointing down */}
      <mesh position={[0, -height / 2 - 0.05, 0.01]}>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
});

// Floating notification for game events
interface EventNotificationProps {
  text: string;
  type: "death" | "elimination" | "phase" | "winner";
}

export function EventNotification({ text, type }: EventNotificationProps) {
  const groupRef = useRef<THREE.Group>(null);

  const colors: Record<string, string> = {
    death: "#DC2626",
    elimination: "#B45309",
    phase: "#F0B90B",
    winner: "#F0B90B",
  };

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 3, 0]}>
      <RoundedBox args={[3, 0.6, 0.1]} radius={0.1} smoothness={2}>
        <meshBasicMaterial color={colors[type]} transparent opacity={0.9} />
      </RoundedBox>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshBasicMaterial color="#FFFFFF" />
      </Text>
    </group>
  );
}
