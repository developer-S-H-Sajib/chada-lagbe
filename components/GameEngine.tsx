
import React, { useEffect, useRef, useState } from 'react';

interface GameEngineProps {
  onGameOver: (score: number) => void;
  playerPhoto: string | null;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver, playerPhoto }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const playerImgRef = useRef<HTMLImageElement | null>(null);

  // Physics Config
  const GRAVITY = 0.4;
  const JUMP_STRENGTH = -7.5;
  const PIPE_SPEED = 3.2;
  const PIPE_SPAWN_RATE = 110; // frames
  const PIPE_WIDTH = 70;
  const PIPE_GAP = 190;

  // Game State Refs
  const birdRef = useRef({
    y: 300,
    vy: 0,
    radius: 24,
    rotation: 0,
    x: 0 // Will be set in resize
  });

  const pipesRef = useRef<{ x: number; top: number; passed: boolean }[]>([]);
  const frameCount = useRef(0);
  const soundsRef = useRef<{ flap: HTMLAudioElement; point: HTMLAudioElement; crash: HTMLAudioElement } | null>(null);

  useEffect(() => {
    // Preload sounds
    soundsRef.current = {
      flap: new Audio('https://www.myinstants.com/media/sounds/flap_flap.mp3'),
      point: new Audio('https://www.myinstants.com/media/sounds/mario-coin.mp3'),
      crash: new Audio('https://www.myinstants.com/media/sounds/funny-fail-sound-effect.mp3')
    };

    if (playerPhoto) {
      const img = new Image();
      img.src = playerPhoto;
      img.onload = () => { playerImgRef.current = img; };
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
      birdRef.current.y = canvas.height / 2;
      birdRef.current.x = canvas.width / 4;
    };
    resize();
    window.addEventListener('resize', resize);

    const jump = () => {
      birdRef.current.vy = JUMP_STRENGTH;
      if (soundsRef.current) {
        soundsRef.current.flap.currentTime = 0;
        soundsRef.current.flap.play().catch(() => { });
      }
    };

    const handleInput = (e: any) => {
      if (e.type === 'keydown') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          jump();
        }
      } else {
        jump();
      }
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput, { passive: false });

    const update = () => {
      frameCount.current++;
      const bird = birdRef.current;

      // Bird Physics
      bird.vy += GRAVITY;
      bird.y += bird.vy;
      bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.1));

      // Floor/Ceiling Collision
      if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        handleGameOver();
        return;
      }

      // Pipe Management
      if (frameCount.current % PIPE_SPAWN_RATE === 0) {
        const minHeight = 60;
        const maxHeight = canvas.height - PIPE_GAP - minHeight;
        const top = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        pipesRef.current.push({ x: canvas.width, top, passed: false });
      }

      for (let i = pipesRef.current.length - 1; i >= 0; i--) {
        const p = pipesRef.current[i];
        p.x -= PIPE_SPEED;

        // Scoring
        if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
          p.passed = true;
          setScore(s => s + 1);
          soundsRef.current?.point.play().catch(() => { });
        }

        // Collision detection (Circle-Rect)
        const birdX = bird.x;
        const birdY = bird.y;

        // Rect 1 (Top Pipe)
        const inTopRect = birdX + bird.radius > p.x &&
          birdX - bird.radius < p.x + PIPE_WIDTH &&
          birdY - bird.radius < p.top;

        // Rect 2 (Bottom Pipe)
        const inBottomRect = birdX + bird.radius > p.x &&
          birdX - bird.radius < p.x + PIPE_WIDTH &&
          birdY + bird.radius > p.top + PIPE_GAP;

        if (inTopRect || inBottomRect) {
          handleGameOver();
          return;
        }

        // Cleanup
        if (p.x + PIPE_WIDTH < -100) {
          pipesRef.current.splice(i, 1);
        }
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      const bird = birdRef.current;

      // Clear Screen
      ctx.fillStyle = '#bae6fd'; // Sky Blue
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const drawCloud = (x: number, y: number, s: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 30 * s, 0, Math.PI * 2);
        ctx.arc(x + 40 * s, y, 40 * s, 0, Math.PI * 2);
        ctx.arc(x + 80 * s, y, 30 * s, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(100, 150, 1);
      drawCloud(canvas.width - 250, 100, 1.2);
      drawCloud(canvas.width / 2, 250, 0.8);

      // Pipes
      pipesRef.current.forEach(p => {
        ctx.fillStyle = '#D12053'; // bKash Pink

        // Top Pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
        // Bottom Pipe
        ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_WIDTH, canvas.height - (p.top + PIPE_GAP));

        // Pipe Caps
        ctx.fillStyle = '#b01b46';
        ctx.fillRect(p.x - 5, p.top - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(p.x - 5, p.top + PIPE_GAP, PIPE_WIDTH + 10, 20);

        // Label on pipes
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px "Hind Siliguri"';
        ctx.textAlign = 'center';
        ctx.fillText('চাঁদা দে!', p.x + PIPE_WIDTH / 2, p.top - 35);
        ctx.fillText('রাস্তা বন্ধ', p.x + PIPE_WIDTH / 2, p.top + PIPE_GAP + 50);
      });

      // Bird
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#D12053';
      ctx.stroke();
      ctx.clip();

      if (playerImgRef.current) {
        ctx.drawImage(playerImgRef.current, -bird.radius, -bird.radius, bird.radius * 2, bird.radius * 2);
      } else {
        ctx.fillStyle = '#D12053';
        ctx.fillRect(-bird.radius, -bird.radius, bird.radius * 2, bird.radius * 2);
      }
      ctx.restore();

      // UI Score (Large and bold)
      ctx.fillStyle = '#1e293b';
      ctx.font = 'black 80px "Hind Siliguri"';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      ctx.fillText(score.toLocaleString('bn-BD'), canvas.width / 2, 140);
      ctx.shadowBlur = 0;
    };

    const handleGameOver = () => {
      cancelAnimationFrame(gameLoopRef.current);
      if (soundsRef.current) {
        soundsRef.current.crash.play().catch(() => { });
      }
      onGameOver(score);
    };

    // Kickoff
    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
    };
  }, [onGameOver, score]);

  return (
    <div className="fixed inset-0 w-full h-full bg-sky-100 touch-none overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-32 w-full text-center pointer-events-none">
        <div className="inline-block bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-lg border-2 border-pink-100 animate-pulse">
          <span className="text-pink-600 font-black">চাঁদা দিয়ে ওড়ো! 🕊️</span>
        </div>
      </div>
    </div>
  );
};

export default GameEngine;
