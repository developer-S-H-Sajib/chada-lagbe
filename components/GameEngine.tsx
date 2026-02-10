
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
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const bgXRef = useRef(0);

  // Physics Config
  const GRAVITY = 0.2; // Even floatier
  const JUMP_STRENGTH = -5.0; // Gentle hop
  const PIPE_GAP = 260; // Massive gap
  const PIPE_WIDTH = 70;
  const COLLISION_RADIUS = 12; // Tiny hitbox for "Very Easy"

  // Difficulty Progression Config
  const START_SPEED = 2.2; // Very slow start
  const MAX_SPEED = 3.5;   // Normal speed
  const RAMP_START_FRAME = 900; // 15 seconds (assuming 60fps)
  const RAMP_END_FRAME = 2400;  // 40 seconds
  const PIPE_SPAWN_DISTANCE = 400; // More horizontal space

  // Color Palette for Pipes
  const PIPE_PALETTE = [
    { main: '#D12053', cap: '#b01b46' }, // Original Pink
    { main: '#22c55e', cap: '#15803d' }, // Green
    { main: '#3b82f6', cap: '#1d4ed8' }, // Blue
    { main: '#eab308', cap: '#a16207' }, // Yellow
    { main: '#a855f7', cap: '#7e22ce' }, // Purple
    { main: '#f97316', cap: '#c2410c' }, // Orange
  ];

  // Game State Refs
  const birdRef = useRef({
    y: 300,
    vy: 0,
    radius: 16, // Visual radius (smaller)
    rotation: 0,
    x: 0 // Will be set in resize
  });

  const pipesRef = useRef<{ x: number; top: number; passed: boolean; color: string; capColor: string }[]>([]);
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

    // Load Background Image
    const bgImg = new Image();
    bgImg.src = '/sky_background.png';
    bgImg.onload = () => { bgImgRef.current = bgImg; };

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

      // Calculate Current Speed based on progression
      let currentSpeed = START_SPEED;
      if (frameCount.current > RAMP_START_FRAME) {
        if (frameCount.current >= RAMP_END_FRAME) {
          currentSpeed = MAX_SPEED;
        } else {
          const progress = (frameCount.current - RAMP_START_FRAME) / (RAMP_END_FRAME - RAMP_START_FRAME);
          currentSpeed = START_SPEED + (MAX_SPEED - START_SPEED) * progress;
        }
      }

      // Update Background Scroll (Parallax: slower than foreground)
      bgXRef.current -= currentSpeed * 0.5;
      // Reset background scroll if it moves too far (assuming repeatable or handled in draw)

      // Bird Physics
      bird.vy += GRAVITY;
      bird.y += bird.vy;
      bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.vy * 0.1));

      // Floor/Ceiling Collision (Keep visual radius for floor check)
      if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        handleGameOver();
        return;
      }

      // Pipe Management (Distance Based Spawning)
      const lastPipe = pipesRef.current[pipesRef.current.length - 1];
      let shouldSpawn = false;

      if (!lastPipe) {
        // Initial spawn delay
        if (frameCount.current > 100) shouldSpawn = true;
      } else {
        // Spawn if enough distance has passed
        if (canvas.width - lastPipe.x >= PIPE_SPAWN_DISTANCE) {
          shouldSpawn = true;
        }
      }

      if (shouldSpawn) {
        const minHeight = 60;
        const maxHeight = canvas.height - PIPE_GAP - minHeight;
        const top = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        // Random Color
        const colorPair = PIPE_PALETTE[Math.floor(Math.random() * PIPE_PALETTE.length)];

        pipesRef.current.push({
          x: canvas.width,
          top,
          passed: false,
          color: colorPair.main,
          capColor: colorPair.cap
        });
      }

      for (let i = pipesRef.current.length - 1; i >= 0; i--) {
        const p = pipesRef.current[i];
        p.x -= currentSpeed;

        // Scoring
        if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
          p.passed = true;
          setScore(s => s + 1);
          soundsRef.current?.point.play().catch(() => { });
        }

        // Collision detection (Circle-Rect)
        // Use COLLISION_RADIUS instead of bird.radius for "Coyote Time" / Forgiveness
        const birdX = bird.x;
        const birdY = bird.y;

        // Rect 1 (Top Pipe)
        const inTopRect = birdX + COLLISION_RADIUS > p.x &&
          birdX - COLLISION_RADIUS < p.x + PIPE_WIDTH &&
          birdY - COLLISION_RADIUS < p.top;

        // Rect 2 (Bottom Pipe)
        const inBottomRect = birdX + COLLISION_RADIUS > p.x &&
          birdX - COLLISION_RADIUS < p.x + PIPE_WIDTH &&
          birdY + COLLISION_RADIUS > p.top + PIPE_GAP;

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

      // Draw Background
      if (bgImgRef.current) {
        const img = bgImgRef.current;
        // Scale height to fit canvas, maintain aspect ratio or cover
        // Strategy: Cover height, repeat width
        const scale = canvas.height / img.height;
        const scaledWidth = img.width * scale;

        // Wrap logic
        const totalWidth = scaledWidth;
        let currentX = bgXRef.current % totalWidth;
        if (currentX > 0) currentX -= totalWidth;

        // Draw multiple times to fill screen
        while (currentX < canvas.width) {
          ctx.drawImage(img, currentX, 0, scaledWidth, canvas.height);
          currentX += scaledWidth;
        }
      } else {
        // Fallback or Loading
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Pipes
      // Pipes
      pipesRef.current.forEach(p => {
        ctx.fillStyle = p.color || '#D12053'; // Use random color

        // Top Pipe
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
        // Bottom Pipe
        ctx.fillRect(p.x, p.top + PIPE_GAP, PIPE_WIDTH, canvas.height - (p.top + PIPE_GAP));

        // Pipe Caps
        ctx.fillStyle = p.capColor || '#b01b46';
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
