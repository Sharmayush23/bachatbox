import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BarProps {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
}

// 3D bar for goal visualization
const Bar = ({ position, height, color, label }: BarProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Small animation on Y scale
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.scale.y = Math.max(0.1, height * (1 + Math.sin(t * 2) * 0.05));
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        scale={[1, height, 1]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

interface Goal3DProps {
  goals: Array<{
    name: string;
    targetAmount: number;
    currentAmount: number;
  }>;
  className?: string;
}

const Goal3D = ({ goals, className = '' }: Goal3DProps) => {
  // Filter to show only top 5 goals for better visualization
  const topGoals = goals.slice(0, 5);
  
  // Find maximum target amount for scaling
  const maxAmount = Math.max(...topGoals.map(g => g.targetAmount), 1000);
  
  return (
    <div className={`goal-3d-container h-64 ${className}`}>
      <Canvas camera={{ position: [0, 3, 10], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Progress bars for each goal */}
        {topGoals.map((goal, i) => {
          const position: [number, number, number] = [(i - (topGoals.length - 1) / 2) * 2.5, 0, 0];
          const targetHeight = 5 * (goal.targetAmount / maxAmount);
          const currentHeight = 5 * (goal.currentAmount / maxAmount);
          
          return (
            <group key={i} position={position}>
              {/* Target amount bar (transparent) */}
              <mesh position={[0, targetHeight / 2, 0]} scale={[1, targetHeight, 1]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#cccccc" transparent opacity={0.3} />
              </mesh>
              
              {/* Current amount bar */}
              <Bar 
                position={[0, 0, 0]} 
                height={currentHeight} 
                color="#0F766E" 
                label={goal.name} 
              />
              
              {/* Progress percentage */}
              <Text
                position={[0, targetHeight + 0.5, 0]}
                fontSize={0.4}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {`₹${goal.currentAmount.toLocaleString('en-IN')}`}
              </Text>
            </group>
          );
        })}
        
        <gridHelper args={[20, 20]} position={[0, -0.01, 0]} />
      </Canvas>
      <div className="text-center text-sm mt-2 text-muted-foreground">
        3D visualization of your top financial goals
      </div>
    </div>
  );
};

export default Goal3D;