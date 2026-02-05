import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';

import { GameState, PlayerData } from '../types';
import StartScreen from './StartScreen';
import GameEngine from './GameEngine';
import GameOverScreen from './GameOverScreen';
import PaymentModal from './PaymentModal';
import ReceiptView from './ReceiptView';
import FakeCounter from './FakeCounter';

const App: React.FC = () => {
  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const saved = localStorage.getItem('chanda_profile');
    return saved
      ? JSON.parse(saved)
      : { name: '', photoUrl: null, score: 0, chandaAmount: 0 };
  });

  const [currentState, setCurrentState] = useState<GameState>(GameState.START);

  // 🎵 Background music ref
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  // init music once
  useEffect(() => {
    const audio = new Audio('/chada-deo-music.mp3');
    audio.loop = true;
    audio.volume = 0.6;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // helper for short sounds
  const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(() => { });
  };

  // ▶️ START GAME
  const startGame = (name: string, photo: string | null) => {
    playSound('/funny-sound-1.mp3');
    bgMusicRef.current?.play().catch(() => { });
    setPlayerData(prev => ({ ...prev, name, photoUrl: photo }));
    setCurrentState(GameState.PLAYING);
  };

  // ⛔ GAME OVER
  const endGame = (score: number) => {
    playSound('/funny-sound-2.mp3');

    bgMusicRef.current?.pause();
    if (bgMusicRef.current) bgMusicRef.current.currentTime = 0;

    setPlayerData(prev => ({ ...prev, score }));
    setCurrentState(GameState.GAMEOVER);
  };

  const goToPayment = () => {
    bgMusicRef.current?.pause();
    setCurrentState(GameState.PAYMENT);
  };

  const handlePaymentSuccess = (amount: number) => {
    setPlayerData(prev => ({ ...prev, chandaAmount: amount }));
    setCurrentState(GameState.RECEIPT);

    const audio = new Audio(
      'https://www.myinstants.com/media/sounds/cha-ching.mp3'
    );
    audio.play().catch(() => { });
  };

  const resetGame = () => {
    setPlayerData(prev => ({ ...prev, score: 0, chandaAmount: 0 }));
    bgMusicRef.current?.play().catch(() => { });
    setCurrentState(GameState.PLAYING);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 overflow-x-hidden">
      {currentState !== GameState.PLAYING && (
        <header className="w-full bg-white shadow-sm p-4 text-center">
          <h1 className="text-2xl font-bold bkash-text">চাঁদা লাগবে 😂</h1>
        </header>
      )}

      <main
        className={`flex-grow w-full flex items-center justify-center relative ${currentState === GameState.PLAYING
            ? 'fixed inset-0 z-50 bg-white h-screen w-screen'
            : 'max-w-md mx-auto p-4'
          }`}
      >
        {currentState === GameState.START && (
          <StartScreen
            onStart={startGame}
            initialName={playerData.name}
            initialPhoto={playerData.photoUrl}
          />
        )}

        {currentState === GameState.PLAYING && (
          <GameEngine
            onGameOver={endGame}
            playerPhoto={playerData.photoUrl}
          />
        )}

        {currentState === GameState.GAMEOVER && (
          <GameOverScreen
            playerData={playerData}
            onPay={goToPayment}
            onRestart={resetGame}
          />
        )}

        {currentState === GameState.PAYMENT && (
          <PaymentModal
            onSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentState(GameState.GAMEOVER)}
          />
        )}

        {currentState === GameState.RECEIPT && (
          <ReceiptView playerData={playerData} onDone={resetGame} />
        )}
      </main>

      {currentState !== GameState.PLAYING && (
        <footer className="w-full flex justify-center mt-4">
          <FakeCounter />
        </footer>
      )}

      {/* ⭐ Vercel Analytics */}
      <Analytics />
    </div>
  );
};

export default App;
