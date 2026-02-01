
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const FakeCounter: React.FC = () => {
  const [count, setCount] = useState(12435);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment to look "live"
      if (Math.random() > 0.7) {
        setCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-pink-100 flex items-center gap-3 animate-pulse">
      <div className="bg-pink-100 p-2 rounded-full">
        <Users className="w-5 h-5 text-pink-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">আজকের চাঁদা দাতা</span>
        <span className="text-lg font-black text-gray-800 leading-none">{count.toLocaleString('bn-BD')} জন 😂</span>
      </div>
    </div>
  );
};

export default FakeCounter;
