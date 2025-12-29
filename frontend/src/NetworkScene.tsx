// frontend/src/NetworkScene.tsx
import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { io } from 'socket.io-client';
import * as THREE from 'three';

// Connect to Python Backend
const socket = io('http://localhost:5000');

type PacketData = {
  src: string;
  dst: string;
  protocol: 'TCP' | 'UDP' | 'OTHER';
  size: number;
  id: number;
};

// --- 3D Component: A single flying packet ---
const PacketParticle = ({ protocol }: { protocol: string }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Start at a random position deep in the background
  const [position] = useState(() => {
    const x = (Math.random() - 0.5) * 30; // Spread width
    const y = (Math.random() - 0.5) * 30; // Spread height
    const z = -40 - Math.random() * 20;   // Start far away
    return new THREE.Vector3(x, y, z);
  });

  // Animation Loop (60fps)
  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.z += 0.3; // Fly forward speed
      
      // If it passes the camera, reset it far back (recycle particles)
      if (mesh.current.position.z > 5) {
         mesh.current.position.z = -50;
      }
      
      mesh.current.rotation.x += 0.02;
      mesh.current.rotation.y += 0.02;
    }
  });

  // Color Mapping
  const color = protocol === 'TCP' ? '#00ccff' : protocol === 'UDP' ? '#ff0055' : '#00ff66';

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
};

// --- Main Scene ---
export const NetworkScene = () => {
  const [packets, setPackets] = useState<PacketData[]>([]);

  useEffect(() => {
    socket.on('packet_data', (data: PacketData) => {
      // Add a unique ID to keep React happy
      const newPacket = { ...data, id: Math.random() };
      
      // Keep only the last 100 packets to save memory
      setPackets((prev) => [...prev.slice(-100), newPacket]);
    });

    return () => {
      socket.off('packet_data');
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        {/* Environment */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />

        {/* The "Home Base" (You) */}
        <mesh position={[0, -2, 0]}>
           <boxGeometry args={[2, 0.2, 2]} />
           <meshStandardMaterial color="#333" wireframe />
        </mesh>

        {/* The Packets */}
        {packets.map((p) => (
          <PacketParticle key={p.id} protocol={p.protocol} />
        ))}

        <OrbitControls />
      </Canvas>

      {/* HUD Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#0f0', fontFamily: 'monospace', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0 }}>📡 PacketLens</h1>
        <p>Live Traffic Monitor</p>
        <p style={{ color: '#fff' }}>Objects in view: {packets.length}</p>
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <span style={{ color: '#00ccff' }}>● TCP (Web/Data)</span>
          <span style={{ color: '#ff0055' }}>● UDP (Media/DNS)</span>
        </div>
      </div>
    </div>
  );
};