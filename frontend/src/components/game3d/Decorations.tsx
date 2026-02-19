"use client";

import { useRef, useMemo, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";

// Decoration data generator
const useDecorationData = (
  radiusMin: number,
  radiusMax: number,
  count: number,
  scaleRange: [number, number],
  excludeFront: boolean = false,
) => {
  return useMemo(() => {
    const data: {
      position: [number, number, number];
      scale: number;
      rotation: number;
    }[] = [];
    for (let i = 0; i < count; i++) {
      let angle;
      if (excludeFront) {
        // Avoid the front wedge (approx 45 deg to 135 deg, where 90 is front)
        // We span from 135 (3PI/4) to 405 (2PI + PI/4)
        const startAngle = (3 * Math.PI) / 4;
        const span = (3 * Math.PI) / 2; // 270 deg
        angle = startAngle + Math.random() * span;
      } else {
        angle = Math.random() * Math.PI * 2;
      }

      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale =
        scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      const rotation = Math.random() * Math.PI * 2;
      // y is -0.6 to match the ground plane height
      data.push({ position: [x, -0.6, z], scale, rotation });
    }
    return data;
  }, [radiusMin, radiusMax, count, scaleRange[0], scaleRange[1], excludeFront]);
};

function CyberTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk - Hexagonal Pillar */}
      <mesh position={[0, 1 * scale, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08 * scale, 0.15 * scale, 2 * scale, 6]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.8}
          roughness={0.2}
          emissive="#000"
        />
      </mesh>

      {/* Neon Squares */}
      <mesh position={[0, 0.5 * scale, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.32 * scale, 0.32 * scale]} />
        <meshStandardMaterial
          color="#F0B90B"
          emissive="#F0B90B"
          emissiveIntensity={2}
          wireframe
        />
      </mesh>
      <mesh position={[0, 1.2 * scale, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.24 * scale, 0.24 * scale]} />
        <meshStandardMaterial
          color="#F0B90B"
          emissive="#F0B90B"
          emissiveIntensity={2}
          wireframe
        />
      </mesh>

      {/* Digital Foliage/Data Nodes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <group position={[0, 2.2 * scale, 0]}>
          <mesh position={[0.3 * scale, 0, 0]}>
            <octahedronGeometry args={[0.3 * scale]} />
            <meshStandardMaterial
              color="#F0B90B"
              transparent
              opacity={0.6}
              wireframe
            />
          </mesh>
          <mesh position={[-0.3 * scale, 0.2 * scale, 0.2 * scale]}>
            <octahedronGeometry args={[0.25 * scale]} />
            <meshStandardMaterial
              color="#F0B90B"
              transparent
              opacity={0.6}
              wireframe
            />
          </mesh>
          <mesh position={[0, -0.2 * scale, -0.3 * scale]}>
            <octahedronGeometry args={[0.2 * scale]} />
            <meshStandardMaterial
              color="#F0B90B"
              transparent
              opacity={0.6}
              wireframe
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function DataMonolith({
  position,
  scale = 1,
  rotation = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Main Structure */}
      <mesh position={[0, 1 * scale, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4 * scale, 2 * scale, 0.4 * scale]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glowing Strip */}
      <mesh position={[0, 1 * scale, 0.21 * scale]}>
        <planeGeometry args={[0.1 * scale, 1.8 * scale]} />
        <meshBasicMaterial color="#F0B90B" side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Top */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.2}>
        <mesh position={[0, 2.2 * scale, 0]}>
          <boxGeometry args={[0.3 * scale, 0.3 * scale, 0.3 * scale]} />
          <meshStandardMaterial
            color="#F0B90B"
            emissive="#F0B90B"
            emissiveIntensity={1}
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}

function TechDebris({
  position,
  scale = 1,
  rotation = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      {/* Partially buried box */}
      <mesh
        position={[0, 0, 0]}
        rotation={[0.5, 0.5, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.7} />
      </mesh>
      {/* Wires */}
      <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}

function EnergyGrid({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial
          color="#F0B90B"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#F0B90B" wireframe />
      </mesh>
    </group>
  );
}

function HolographicSun() {
  return (
    <group position={[0, 10, -10]}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[4, 1]} />
        <meshBasicMaterial color="#f0b90b" wireframe />
      </mesh>
      {/* Inner Glow */}
      <mesh scale={[0.8, 0.8, 0.8]}>
        <icosahedronGeometry args={[4, 0]} />
        <meshBasicMaterial color="#f0b90b" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Drone({
  position,
  scale = 1,
  speed = 0.5,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += speed * delta;
      // Reset position if it moves too far
      if (groupRef.current.position.x > 15) {
        groupRef.current.position.x = -15;
      }
      // Bobbing
      groupRef.current.position.y +=
        Math.sin(state.clock.elapsedTime * 2) * 0.005;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Drone Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Rotors (Square Plates) */}
      <mesh position={[0.25, 0.05, 0.15]}>
        <boxGeometry args={[0.3, 0.01, 0.3]} />
        <meshBasicMaterial color="#555" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.05, 0.15]}>
        <boxGeometry args={[0.3, 0.01, 0.3]} />
        <meshBasicMaterial color="#555" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.25, 0.05, -0.15]}>
        <boxGeometry args={[0.3, 0.01, 0.3]} />
        <meshBasicMaterial color="#555" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.25, 0.05, -0.15]}>
        <boxGeometry args={[0.3, 0.01, 0.3]} />
        <meshBasicMaterial color="#555" transparent opacity={0.5} />
      </mesh>
      {/* Light */}
      <mesh position={[0, -0.05, 0.08]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
}

export const Decorations = memo(function Decorations({
  count = 10,
  isNightMode = false,
}: {
  count?: number;
  isNightMode?: boolean;
}) {
  // Generate data for sci-fi elements
  const cyberTreeData = useDecorationData(5, 7, 6, [0.8, 1.5], true);
  const monolithData = useDecorationData(6, 8, 4, [1, 1.8], true);
  const debrisData = useDecorationData(3.5, 6, 8, [0.4, 0.8]);
  const gridData = useDecorationData(3, 7, 20, [1, 1]);

  return (
    <group>
      {!isNightMode && <HolographicSun />}

      {/* Drones replacing clouds */}
      {!isNightMode && (
        <>
          <Drone position={[-8, 4, -4]} scale={1.2} speed={0.8} />
          <Drone position={[-2, 6, -6]} scale={1} speed={1.2} />
          <Drone position={[5, 5, -5]} scale={1.5} speed={0.5} />
        </>
      )}

      {cyberTreeData.map((d, i) => (
        <CyberTree key={`tree-${i}`} position={d.position} scale={d.scale} />
      ))}

      {monolithData.map((d, i) => (
        <DataMonolith
          key={`mono-${i}`}
          position={d.position}
          scale={d.scale}
          rotation={d.rotation}
        />
      ))}

      {debrisData.map((d, i) => (
        <TechDebris
          key={`debris-${i}`}
          position={d.position}
          scale={d.scale}
          rotation={d.rotation}
        />
      ))}

      {gridData.map((d, i) => (
        <EnergyGrid
          key={`grid-${i}`}
          position={d.position}
          rotation={d.rotation}
        />
      ))}
    </group>
  );
});
