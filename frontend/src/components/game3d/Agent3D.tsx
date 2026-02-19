"use client";

import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";

interface Agent3DProps {
  id: string;
  name: string;
  emoji: string;
  position: [number, number, number];
  isAlive: boolean;
  isSpeaking: boolean;
  roleRevealed: boolean;
  role: "villager" | "seer" | "wolf";
  isCurrentSpeaker: boolean;
  isNightMode?: boolean;
  onClick?: () => void;
  rotation?: [number, number, number];
}

// Robot configurations
type RobotStyle = {
  colors: {
    primary: string; // Main body
    secondary: string; // Joints/Details
    accent: string; // Glows/Lines
  };
  headType: "box" | "dome" | "angular";
};

const ROBOT_STYLES: Record<string, RobotStyle> = {
  p1: {
    // Alpha
    colors: { primary: "#2A2A2A", secondary: "#111111", accent: "#EF4444" }, // Red/Black (Wolf-like)
    headType: "angular",
  },
  p2: {
    // Beta
    colors: { primary: "#E2E8F0", secondary: "#64748B", accent: "#3B82F6" }, // White/Blue
    headType: "dome",
  },
  p3: {
    // Gamma
    colors: { primary: "#475569", secondary: "#1E293B", accent: "#10B981" }, // Grey/Green
    headType: "box",
  },
  p4: {
    // Delta
    colors: { primary: "#78350F", secondary: "#451A03", accent: "#F59E0B" }, // Bronze/Orange
    headType: "angular",
  },
  p5: {
    // Epsilon
    colors: { primary: "#1E3A8A", secondary: "#172554", accent: "#F0B90B" }, // Blue/Gold
    headType: "dome",
  },
  p6: {
    // Zeta
    colors: { primary: "#9CA3AF", secondary: "#4B5563", accent: "#EC4899" }, // Silver/Pink
    headType: "box",
  },
};

const DEFAULT_STYLE: RobotStyle = {
  colors: { primary: "#94A3B8", secondary: "#475569", accent: "#F0B90B" },
  headType: "box",
};

export const Agent3D = memo(function Agent3D({
  id,
  name,
  emoji,
  position,
  isAlive,
  isSpeaking,
  roleRevealed,
  role,
  isCurrentSpeaker,
  isNightMode = false,
  onClick,
  rotation,
}: Agent3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Animation state
  const animState = useRef({
    hoverOffset: Math.random() * 100,
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      if (!isAlive) {
        // Disabled/Destroyed state
        const targetRotX = -0.5;
        const targetPosY = -0.6; // Sink to ground

        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          targetRotX,
          0.1,
        );
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          targetPosY,
          0.1,
        );
        // Jitter
        if (Math.random() > 0.95) {
          groupRef.current.position.x += (Math.random() - 0.5) * 0.05;
        }
      } else {
        // Active State - Float Logic is handled by wrapper or manual lerp
        // We'll do manual bobbing here to keep control
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          0,
          0.1,
        );

        const hoverY = Math.sin(time * 2 + animState.current.hoverOffset) * 0.1;
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          hoverY,
          0.1,
        );

        // Speaking Action
        if (isSpeaking && bodyRef.current) {
          // Energetic bounce/twitch
          bodyRef.current.rotation.y = Math.sin(time * 20) * 0.05;
          bodyRef.current.scale.y = 1 + Math.sin(time * 15) * 0.02;
        } else if (bodyRef.current) {
          bodyRef.current.rotation.y = THREE.MathUtils.lerp(
            bodyRef.current.rotation.y,
            0,
            0.1,
          );
          bodyRef.current.scale.y = THREE.MathUtils.lerp(
            bodyRef.current.scale.y,
            1,
            0.1,
          );
        }

        // Head Tracking
        if (headRef.current) {
          const headSway =
            Math.sin(time * 0.5 + animState.current.hoverOffset) * 0.15;
          headRef.current.rotation.y = headSway;
        }
      }
    }
  });

  const style = ROBOT_STYLES[id] || DEFAULT_STYLE;

  // Determine appearance based on role
  const currentColors = useMemo(() => {
    if (roleRevealed && role === "wolf") {
      // Virus/Malware appearance
      return {
        primary: "#1A0505",
        secondary: "#000000",
        accent: "#FF0000",
      };
    }
    return style.colors;
  }, [roleRevealed, role, style]);

  const glowIntensity = isSpeaking ? 2.5 : isCurrentSpeaker ? 1.5 : 0.5;
  const accentColor =
    roleRevealed && role === "wolf" ? "#FF0000" : style.colors.accent;

  return (
    <group
      position={position}
      rotation={rotation ? new THREE.Euler(...rotation) : undefined}
      onClick={onClick}
    >
      <group ref={groupRef}>
        {/* === STATUS SQUARE (SPACE STYLE) === */}
        {isAlive && (
          <group position={[0, -0.6, 0]}>
            {/* Large faint square background */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.0, 1.0]} />
              <meshBasicMaterial
                color={isSpeaking ? "#F0B90B" : accentColor}
                transparent
                opacity={isSpeaking ? 0.2 : 0.05}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Outer square frame */}
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
              <ringGeometry args={[0.48, 0.52, 4]} />
              <meshBasicMaterial
                color={isSpeaking ? "#F0B90B" : accentColor}
                transparent
                opacity={isSpeaking ? 0.8 : 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Inner tech square grid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[0.7, 0.7]} />
              <meshBasicMaterial
                color={accentColor}
                transparent
                opacity={0.15}
                wireframe
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Center glow dot */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.1, 0.1]} />
              <meshBasicMaterial
                color={accentColor}
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        )}

        <group ref={bodyRef}>
          {/* === FLOATING BASE / THRUSTERS === */}
          <group position={[0, -0.4, 0]}>
            <RoundedBox args={[0.4, 0.1, 0.3]} radius={0.02} smoothness={4}>
              <meshStandardMaterial
                color="#222"
                metalness={0.8}
                roughness={0.4}
              />
            </RoundedBox>
            {/* Thruster Glow */}
            <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.25, 0.25]} />
              <meshBasicMaterial
                color={accentColor}
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>

          {/* === TORSO === */}
          {/* Main Core Block */}
          <RoundedBox
            args={[0.45, 0.5, 0.25]}
            radius={0.05}
            smoothness={4}
            position={[0, 0.1, 0]}
          >
            <meshStandardMaterial
              color={currentColors.primary}
              metalness={0.7}
              roughness={0.3}
            />
          </RoundedBox>

          {/* Armor Plates */}
          <RoundedBox
            args={[0.35, 0.4, 0.3]}
            radius={0.02}
            smoothness={2}
            position={[0, 0.1, 0]}
          >
            <meshStandardMaterial
              color={currentColors.secondary}
              metalness={0.5}
              roughness={0.5}
            />
          </RoundedBox>

          {/* Energy Core */}
          <mesh position={[0, 0.15, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial
              color="#000"
              emissive={accentColor}
              emissiveIntensity={isAlive ? glowIntensity : 0}
            />
            {/* Core Lattice */}
            <meshBasicMaterial
              wireframe
              color="white"
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* === ARMS === */}
          {/* Shoulders */}
          <group position={[-0.32, 0.25, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={currentColors.secondary}
              metalness={0.8}
            />
          </group>
          <group position={[0.32, 0.25, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={currentColors.secondary}
              metalness={0.8}
            />
          </group>

          {/* Arm Segments */}
          <group position={[-0.32, 0, 0]} rotation={[0, 0, 0.1]}>
            <RoundedBox args={[0.1, 0.35, 0.1]} radius={0.02} smoothness={2}>
              <meshStandardMaterial color={currentColors.primary} />
            </RoundedBox>
            {/* Hand */}
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
          <group position={[0.32, 0, 0]} rotation={[0, 0, -0.1]}>
            <RoundedBox args={[0.1, 0.35, 0.1]} radius={0.02} smoothness={2}>
              <meshStandardMaterial color={currentColors.primary} />
            </RoundedBox>
            {/* Hand */}
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.08]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>

          {/* === HEAD === */}
          <group ref={headRef} position={[0, 0.5, 0]}>
            {/* Neck Connection */}
            <cylinderGeometry args={[0.08, 0.1, 0.15, 8]} />
            <meshStandardMaterial color="#333" />

            {/* Head Geometry based on Type */}
            <group position={[0, 0.15, 0]}>
              {style.headType === "dome" ? (
                <mesh>
                  <capsuleGeometry args={[0.18, 0.15, 4, 16]} />
                  <meshStandardMaterial
                    color={currentColors.primary}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              ) : style.headType === "angular" ? (
                <mesh>
                  <dodecahedronGeometry args={[0.22, 0]} />
                  <meshStandardMaterial
                    color={currentColors.primary}
                    metalness={0.9}
                    roughness={0.1}
                    flatShading
                  />
                </mesh>
              ) : (
                <RoundedBox
                  args={[0.35, 0.35, 0.35]}
                  radius={0.08}
                  smoothness={4}
                >
                  <meshStandardMaterial
                    color={currentColors.primary}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </RoundedBox>
              )}

              {/* Visor */}
              <mesh position={[0, 0.02, 0.14]}>
                <boxGeometry args={[0.25, 0.08, 0.1]} />
                <meshStandardMaterial
                  color={isAlive ? "#000" : "#111"}
                  emissive={
                    isAlive
                      ? roleRevealed && role === "wolf"
                        ? "#FF0000"
                        : isSpeaking
                          ? "#FFFFFF"
                          : accentColor
                      : "#000000"
                  }
                  emissiveIntensity={isAlive ? 1.5 : 0}
                />
              </mesh>

              {/* Ears / Antennae */}
              <mesh position={[0.21, 0.05, 0]}>
                <boxGeometry args={[0.05, 0.15, 0.1]} />
                <meshStandardMaterial color={currentColors.secondary} />
              </mesh>
              <mesh position={[-0.21, 0.05, 0]}>
                <boxGeometry args={[0.05, 0.15, 0.1]} />
                <meshStandardMaterial color={currentColors.secondary} />
              </mesh>

              {/* Top Antenna */}
              <mesh position={[0.1, 0.22, -0.1]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2]} />
                <meshBasicMaterial color="#888" />
              </mesh>
              <mesh position={[0.1, 0.32, -0.1]}>
                <sphereGeometry args={[0.02]} />
                <meshBasicMaterial color={isAlive ? accentColor : "#333"} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Info Text */}
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.12}
          anchorX="center"
          anchorY="middle"
          color="#fff"
          outlineWidth={0.01}
          outlineColor={currentColors.accent}
        >
          {name.toUpperCase()}
        </Text>

        {/* Role Reveal Indicator */}
        {roleRevealed && (
          <group position={[0, 1.6, 0]}>
            <Text
              fontSize={0.15}
              color={role === "wolf" ? "#FF0000" : "#F0B90B"}
              outlineWidth={0.02}
              outlineColor="#000"
            >
              {role === "wolf" ? "⚠️ VIRUS" : "🛡️ PROTOCOL"}
            </Text>
          </group>
        )}
      </group>
    </group>
  );
});
