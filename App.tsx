
import React, { useState, useEffect } from 'react';
import { GameState, PlayerData } from './types';
import StartScreen from './components/StartScreen';
import GameEngine from './components/GameEngine';
import GameOverScreen from './components/GameOverScreen';
import PaymentModal from './components/PaymentModal';
import ReceiptView from './components/ReceiptView';
import FakeCounter from './components/FakeCounter';

const App: React.FC = () => {
  // Load saved profile on initial load
  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const saved = localStorage.getItem('chanda_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      photoUrl: null,
      score: 0,
      chandaAmount: 0
    };
  });

  const [currentState, setCurrentState] = useState<GameState>(
    (playerData.name && playerData.photoUrl) ? GameState.START : GameState.START
  );

  // Persistence
  useEffect(() => {
    if (playerData.name && playerData.photoUrl) {
      localStorage.setItem('chanda_profile', JSON.stringify({
        ...playerData,
        score: 0,
        chandaAmount: 0
      }));
    }
  }, [playerData.name, playerData.photoUrl]);

  const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const startGame = (name: string, photo: string | null) => {
    // play funny-sound-1.mp3 when “খেলা শুরু করো” is clicked
    playSound('/sounds/funny-sound-1.mp3');
    setPlayerData(prev => ({ ...prev, name, photoUrl: photo }));
    setCurrentState(GameState.PLAYING);
  };

  const endGame = (score: number) => {
    // play funny-sound-2.mp3 automatically on game over
    playSound('/sounds/funny-sound-2.mp3');
    setPlayerData(prev => ({ ...prev, score }));
    setCurrentState(GameState.GAMEOVER);
  };

  const goToPayment = () => setCurrentState(GameState.PAYMENT);

  const handlePaymentSuccess = (amount: number) => {
    setPlayerData(prev => ({ ...prev, chandaAmount: amount }));
    setCurrentState(GameState.RECEIPT);
    // Optional success sound
    const audio = new Audio('https://www.myinstants.com/media/sounds/cha-ching.mp3');
    audio.play().catch(() => { });
  };

  const resetGame = () => {
    // Don't wipe the profile, just reset score/chanda
    setPlayerData(prev => ({ ...prev, score: 0, chandaAmount: 0 }));
    setCurrentState(GameState.PLAYING); // Start immediately as requested
  };

  return (
    <div className={`min-h-screen flex flex-col items-center bg-gray-50 overflow-x-hidden ${currentState === GameState.PLAYING ? 'p-0' : 'pb-8'}`}>
      {currentState !== GameState.PLAYING && (
        <header className="w-full bg-white shadow-sm p-4 text-center z-10">
          <h1 className="text-2xl font-bold bkash-text">
            চাঁদা লাগবে 😂
          </h1>
        </header>
      )}

      <main className={`flex-grow w-full flex items-center justify-center relative ${currentState === GameState.PLAYING ? 'fixed inset-0 z-50 bg-white h-screen w-screen' : 'max-w-md mx-auto p-4'}`}>
        {currentState === GameState.START && (
          <StartScreen
            onStart={startGame}
            initialName={playerData.name}
            initialPhoto={playerData.photoUrl}
          />
        )}

        {currentState === GameState.PLAYING && (
          <GameEngine onGameOver={endGame} playerPhoto={playerData.photoUrl} />
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
          <ReceiptView
            playerData={playerData}
            onDone={resetGame}
          />
        )}
      </main>

      {currentState !== GameState.PLAYING && (
        <footer className="w-full flex justify-center mt-4">
          <FakeCounter />
        </footer>
      )}
    </div>
  );
};

export default App;
