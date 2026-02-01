
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GameEngineProps {
  onGameOver: (score: number) => void;
  playerPhoto: string | null;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver, playerPhoto }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  
  // Player state
  const playerRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight - 150,
    size: 55, // 40-50px range
    targetX: window.innerWidth / 2,
    scale: 1,
    speed: 8
  });

  // Obstacles
  const obstaclesRef = useRef<any[]>([]);

  // Pre-load player image
  useEffect(() => {
    if (playerPhoto) {
      const img = new Image();
      img.src = playerPhoto;
      img.onload = () => {
        playerImgRef.current = img;
      };
    }
  }, [playerPhoto]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      playerRef.current.y = canvas.height - 150;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleInput = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      playerRef.current.targetX = clientX;
      playerRef.current.scale = 0.9;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            playerRef.current.targetX -= 50;
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            playerRef.current.targetX += 50;
        }
    };

    canvas.addEventListener('mousemove', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    canvas.addEventListener('touchmove', handleInput);
    window.addEventListener('keydown', handleKeyDown);

    const update = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      
      // Move player towards target
      playerRef.current.x += (playerRef.current.targetX - playerRef.current.x) * 0.15;
      playerRef.current.scale += (1 - playerRef.current.scale) * 0.1;

      // Keep player within bounds
      playerRef.current.x = Math.max(playerRef.current.size/2, Math.min(canvas.width - playerRef.current.size/2, playerRef.current.x));

      setScore(Math.floor(elapsed * 10));

      // PROGRESSIVE DIFFICULTY LOGIC
      // Spawn rate increases over time
      const baseSpawnChance = 0.04;
      const difficultyFactor = elapsed * 0.003;
      const finalSpawnChance = Math.min(baseSpawnChance + difficultyFactor, 0.25);

      // Obstacle speed increases over time
      const baseObstacleSpeed = 4;
      const speedDifficultyFactor = elapsed * 0.15;
      const currentObstacleSpeed = baseObstacleSpeed + speedDifficultyFactor;

      if (Math.random() < finalSpawnChance) {
        obstaclesRef.current.push({
          x: Math.random() * canvas.width,
          y: -100,
          speed: currentObstacleSpeed * (0.8 + Math.random() * 0.4),
          size: 50 + Math.random() * 40,
          text: Math.random() > 0.5 ? 'চাঁদা দাও!' : 'টাকা দে!',
          type: Math.random() > 0.7 ? 'money' : 'text',
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }

      // Update obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.y += obs.speed;
        obs.rot += obs.rotSpeed;

        // Collision Check (tight circle)
        const dx = playerRef.current.x - obs.x;
        const dy = playerRef.current.y - obs.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (playerRef.current.size / 2 + obs.size / 3)) {
          onGameOver(Math.floor(elapsed * 10));
          if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
          return;
        }

        if (obs.y > canvas.height + 150) {
          obstaclesRef.current.splice(i, 1);
        }
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple grid background
      ctx.strokeStyle = 'rgba(209, 32, 83, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for(let i=0; i<canvas.width; i+=gridSize) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for(let i=0; i<canvas.height; i+=gridSize) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

      // Draw Player Avatar
      ctx.save();
      const shakeX = Math.sin(Date.now() / 30) * 2;
      ctx.translate(playerRef.current.x + shakeX, playerRef.current.y);
      ctx.scale(playerRef.current.scale, 2 - playerRef.current.scale);
      
      // Avatar Shadow
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(209, 32, 83, 0.4)';
      
      // Circular clip for profile picture
      ctx.beginPath();
      ctx.arc(0, 0, playerRef.current.size / 2, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#D12053';
      ctx.stroke();
      ctx.clip();
      
      if (playerImgRef.current) {
        ctx.drawImage(
          playerImgRef.current, 
          -playerRef.current.size/2, 
          -playerRef.current.size/2, 
          playerRef.current.size, 
          playerRef.current.size
        );
      } else {
        ctx.fillStyle = '#D12053';
        ctx.fillRect(-playerRef.current.size/2, -playerRef.current.size/2, playerRef.current.size, playerRef.current.size);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🏃', 0, 0);
      }
      ctx.restore();

      // Draw Obstacles
      obstaclesRef.current.forEach(obs => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rot);
        if (obs.type === 'money') {
          ctx.font = `${obs.size}px Arial`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('💰', 0, 0);
        } else {
          ctx.fillStyle = '#D12053';
          ctx.font = `bold ${obs.size / 2}px "Hind Siliguri"`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(obs.text, 0, 0);
        }
        ctx.restore();
      });

      // UI Overlay
      ctx.fillStyle = '#D12053';
      ctx.font = 'bold 32px "Hind Siliguri"';
      ctx.textAlign = 'center';
      ctx.fillText(`স্কোর: ${Math.floor((Date.now() - startTimeRef.current) / 100)}`, canvas.width / 2, 80);
      
      const difficulty = Math.min(100, Math.floor(((Date.now() - startTimeRef.current) / 1000) * 2));
      ctx.font = '12px "Hind Siliguri"';
      ctx.fillText(`লেভেল: ${difficulty}%`, canvas.width / 2, 110);
    };

    update();

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousemove', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
      canvas.removeEventListener('touchmove', handleInput);
    };
  }, [onGameOver]);

  const moveLeft = () => { playerRef.current.targetX -= 120; };
  const moveRight = () => { playerRef.current.targetX += 120; };

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-sky-50 overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block cursor-none" />
      
      {/* IMPROVED MOBILE CONTROLS - Full side buttons */}
      <div className="absolute inset-0 flex md:hidden pointer-events-none">
        <div 
          className="flex-1 h-full pointer-events-auto active:bg-pink-500/10 transition-colors flex items-end justify-center pb-20"
          onMouseDown={moveLeft}
          onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
        >
          <div className="w-20 h-20 bg-pink-500/90 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white/50">
            <ChevronLeft size={40} strokeWidth={4} />
          </div>
        </div>
        <div 
          className="flex-1 h-full pointer-events-auto active:bg-pink-500/10 transition-colors flex items-end justify-center pb-20"
          onMouseDown={moveRight}
          onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
        >
          <div className="w-20 h-20 bg-pink-500/90 rounded-2xl flex items-center justify-center text-white shadow-2xl border-4 border-white/50">
            <ChevronRight size={40} strokeWidth={4} />
          </div>
        </div>
      </div>

      <div className="absolute top-24 w-full text-center pointer-events-none">
        <div className="inline-block bg-white/90 px-6 py-2 rounded-full shadow-lg text-sm font-black text-pink-600 animate-bounce border-2 border-pink-100">
           চাঁদাখোর আসতেছে! পালাও! 🏃‍♂️💨
        </div>
      </div>
    </div>
  );
};

export default GameEngine;
