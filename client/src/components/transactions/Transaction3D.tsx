import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Color palette for categories
const CATEGORY_COLORS = {
  'Food': '#FF6B6B',
  'Shopping': '#4ECDC4',
  'Entertainment': '#FFD166',
  'Transportation': '#6A0572',
  'Bills': '#1A535C',
  'Groceries': '#3BCEAC',
  'Utilities': '#EE6C4D',
  'Healthcare': '#5E60CE',
  'Education': '#7209B7',
  'Housing': '#4361EE',
  'Salary': '#06D6A0',
  'Investment': '#118AB2',
  'Income': '#06D6A0',
  'Other': '#073B4C'
};

interface Category {
  name: string;
  amount: number;
  percentage: number;
}

interface PieSliceProps {
  category: Category;
  index: number;
  total: number;
  radius: number;
  selected: string | null;
  setSelected: (category: string | null) => void;
}

// 3D pie slice component
const PieSlice = ({ category, index, total, radius, selected, setSelected }: PieSliceProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const isSelected = selected === category.name;
  
  // Calculate angles for the pie slice
  const startAngle = (index / total) * Math.PI * 2;
  const endAngle = ((index + 1) / total) * Math.PI * 2;
  const middleAngle = (startAngle + endAngle) / 2;
  
  // Generate pie slice geometry
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius);
  
  // Create arc
  const curve = new THREE.EllipseCurve(
    0, 0,
    radius, radius,
    startAngle, endAngle,
    false, 0
  );
  
  const points = curve.getPoints(32);
  points.forEach(point => {
    shape.lineTo(point.x, point.y);
  });
  
  shape.lineTo(0, 0);
  
  // Animation on hover or select
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.1 : 1;
      const targetZ = hovered || isSelected ? 0.2 : 0;
      
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
    }
  });
  
  // Get color for category
  const color = CATEGORY_COLORS[category.name as keyof typeof CATEGORY_COLORS] || '#073B4C';
  
  // Label position
  const labelDist = radius * 0.7;
  const labelPos = [
    Math.cos(middleAngle) * labelDist,
    Math.sin(middleAngle) * labelDist,
    0.1
  ];
  
  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setSelected(isSelected ? null : category.name)}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.5}
          metalness={0.2}
          emissive={hovered || isSelected ? color : "#000000"}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <Text
          position={labelPos as [number, number, number]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          renderOrder={1}
        >
          {`${category.name}: ₹${category.amount.toLocaleString('en-IN')}`}
        </Text>
      )}
    </group>
  );
};

interface Transaction3DProps {
  categories: Category[];
  className?: string;
}

const Transaction3D = ({ categories, className = '' }: Transaction3DProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  return (
    <div className={`transaction-3d-container h-80 ${className}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        <group rotation={[0.3, 0, 0]}>
          {categories.map((category, i) => (
            <PieSlice 
              key={category.name}
              category={category}
              index={i}
              total={categories.length}
              radius={3}
              selected={selectedCategory}
              setSelected={setSelectedCategory}
            />
          ))}
        </group>
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
      
      <div className="text-center text-sm mt-2 text-muted-foreground">
        Interactive 3D view of your spending by category (drag to rotate)
      </div>
    </div>
  );
};

export default Transaction3D;