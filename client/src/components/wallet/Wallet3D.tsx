import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";

interface Wallet3DProps {
  balance: number;
  className?: string;
}

// A simpler visual wallet component that doesn't use Three.js
const Wallet3D = ({ balance, className = '' }: Wallet3DProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinCount, setCoinCount] = useState(1);
  
  // Calculate wallet height based on balance (10% to 100%)
  const walletHeight = Math.max(10, Math.min(100, (balance / 10000) * 100));
  
  // Calculate number of coins based on balance
  useEffect(() => {
    setCoinCount(Math.min(5, Math.max(1, Math.floor(balance / 2000))));
  }, [balance]);
  
  return (
    <div className={`wallet-3d h-64 ${className}`}>
      <Card className="relative h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-slate-800 overflow-hidden border-primary/30">
        {/* Wallet visualization */}
        <div 
          className={`relative w-60 mx-auto transition-all duration-300 ${isAnimating ? 'scale-110' : ''}`}
          onClick={() => setIsAnimating(!isAnimating)}
          onMouseOver={() => setIsAnimating(true)}
          onMouseOut={() => setIsAnimating(false)}
        >
          {/* Wallet body */}
          <div 
            className="bg-primary rounded-lg border border-primary/30 shadow-lg relative overflow-hidden transition-all duration-500"
            style={{ height: `${Math.max(80, walletHeight)}px` }}
          >
            {/* Money inside wallet */}
            <div className="flex items-center justify-center h-full">
              <span className="text-2xl font-bold text-white">
                ₹{balance.toLocaleString('en-IN')}
              </span>
            </div>
            
            {/* Wallet opening */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#0d5a54]"></div>
          </div>
          
          {/* Coins */}
          <div className="flex justify-center -mt-4">
            {Array.from({ length: coinCount }).map((_, i) => (
              <div 
                key={i}
                className={`w-10 h-10 rounded-full bg-yellow-500 border-2 border-yellow-600 shadow-md flex items-center justify-center text-yellow-800 text-xs font-bold -mt-${i} ml-${i*2} animate-bounce`}
                style={{ 
                  animationDelay: `${i * 0.2}s`, 
                  animationDuration: '1s',
                  transform: `translateX(${(i - coinCount/2) * 20}px)` 
                }}
              >
                ₹
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center text-sm mt-4 text-muted-foreground">
          Interactive wallet visualization - click to interact
        </div>
      </Card>
    </div>
  );
};

export default Wallet3D;