import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface WalletBoxProps {
  balance: number;
  maxBalance?: number;
}

// Wallet box that scales with balance
const WalletBox = ({ balance, maxBalance = 10000 }: WalletBoxProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Calculate height based on balance (min 0.5, max 3)
  const height = Math.max(0.5, Math.min(3, (balance / maxBalance) * 3));
  
  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Scale up if clicked or hovered
      const targetScale = clicked ? 1.2 : hovered ? 1.1 : 1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={[0, height/2, 0]}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, height, 1]} />
      <meshStandardMaterial 
        color={hovered ? "#FF9D00" : "#0F766E"} 
        metalness={0.3}
        roughness={0.4}
      />
      <Text
        position={[0, 0, 0.51]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ₹{balance.toLocaleString('en-IN')}
      </Text>
    </mesh>
  );
};

interface CoinProps {
  position: [number, number, number];
}

// Coin for the visualization
const Coin = ({ position }: CoinProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
      <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

interface Wallet3DProps {
  balance: number;
  className?: string;
}

// Main component
const Wallet3D = ({ balance, className = '' }: Wallet3DProps) => {
  // Calculate number of coins based on balance (max 5)
  const coinCount = Math.min(5, Math.max(1, Math.floor(balance / 2000)));
  
  return (
    <div className={`wallet-3d h-64 ${className}`}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Main wallet visualization */}
        <WalletBox balance={balance} />
        
        {/* Coins around the wallet */}
        {[...Array(coinCount)].map((_, i) => (
          <Coin 
            key={i} 
            position={[
              1.5 * Math.cos(i * (Math.PI * 2) / coinCount), 
              0, 
              1.5 * Math.sin(i * (Math.PI * 2) / coinCount)
            ]} 
          />
        ))}
        
        {/* Visual helpers */}
        <gridHelper args={[10, 10]} position={[0, -0.01, 0]} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="text-center text-sm mt-2 text-muted-foreground">
        Interactive 3D wallet visualization - drag to rotate
      </div>
    </div>
  );
};

export default Wallet3D;