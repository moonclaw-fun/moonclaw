"use client";

import { useRef, useMemo, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export const Campfire = memo(function Campfire() {
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5;
      coreRef.current.position.y = -0.3 + Math.sin(time * 2) * 0.05;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = -time * 0.8;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time) * 0.2;
    }

    // Flicker/Pulse light
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(time * 5) * 0.5; // Pulse
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* Central Blue Light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        color="#F0B90B"
        intensity={2}
        distance={8}
        decay={2}
      />

      {/* Base Platform (Square) */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh
        position={[0, -0.14, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial color="#F0B90B" side={THREE.DoubleSide} wireframe />
      </mesh>

      {/* Floating Core */}
      <group ref={coreRef} position={[0, 0.5, 0]}>
        {/* Inner Octahedron */}
        <mesh>
          <octahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial color="#FCD34D" wireframe />
        </mesh>
        {/* Outer Glitch Shell */}
        <mesh scale={[1.2, 1.2, 1.2]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial color="#F0B90B" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Spinning Data Squares */}
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial
            color="#F0B90B"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshBasicMaterial color="#FEF08A" wireframe />
        </mesh>
      </group>

      {/* Rising Data Particles */}
      <DataParticles />
    </group>
  );
});

const DataParticles = memo(function DataParticles() {
  const particlesRef = useRef<THREE.Group>(null);
  const count = 15;

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 0.5,
        Math.random() * 2,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.3,
      offset: Math.random() * 100,
    }));
  }, []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.y += p.speed * delta;
        if (child.position.y > 2) {
          child.position.y = 0;
          child.position.x = (Math.random() - 0.5) * 0.5;
          child.position.z = (Math.random() - 0.5) * 0.5;
        }
        // Fade out near top? Material uniform would be better but simple opacity hack:
        // Not easily doable without custom shader or framing individual materials.
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <boxGeometry args={[0.02, 0.05, 0.02]} />
          <meshBasicMaterial color="#FCD34D" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
});
