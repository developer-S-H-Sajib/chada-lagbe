
import React from 'react';
import { PlayerData } from '../types';
import { CreditCard, Share2, Facebook, RefreshCcw } from 'lucide-react';
import funnySound from './public/Funny sonud 2.mp3';

interface GameOverScreenProps {
  playerData: PlayerData;
  onPay: () => void;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ playerData, onPay, onRestart }) => {
  React.useEffect(() => {
    const audio = new Audio(funnySound);
    audio.play().catch(e => console.error("Error playing sound:", e));
  }, []);

  const shareGame = () => {
    const text = `আমি চাঁদা লাগবে গেমে ${playerData.score} স্কোর করে ধরা খেয়েছি 😂 এখন তোমার পালা!`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'চাঁদা লাগবে 😂', text, url }).catch(() => copyToClipboard(url));
    } else {
      copyToClipboard(url);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`আমি চাঁদা লাগবে গেমে ${playerData.score} স্কোর করে ধরা খেয়েছি 😂 এখন তোমার পালা!`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("গেমের লিঙ্ক কপি হয়েছে! ফেসবুকে পোস্ট করে বন্ধুদের ফাসিয়ে দাও 😂");
  };

  return (
    <div className="w-full bg-white rounded-[40px] shadow-2xl p-8 flex flex-col items-center text-center gap-6 animate-in slide-in-from-bottom-10 duration-500 border-[6px] border-red-500/10">
      <div className="relative">
        <div className="w-32 h-32 bg-gray-50 rounded-full border-[6px] border-red-500 overflow-hidden shadow-inner flex items-center justify-center">
          {playerData.photoUrl ? (
            <img src={playerData.photoUrl} alt="Player" className="w-full h-full object-cover grayscale opacity-80" />
          ) : (
            <div className="text-5xl">🤡</div>
          )}
        </div>
        <div className="absolute -top-4 -right-12 bg-yellow-400 text-black px-5 py-1.5 rounded-full rotate-[15deg] font-black border-[3px] border-black shadow-xl animate-bounce text-sm">
          ধরা খাইছো! 😂
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl font-black text-red-600 tracking-tight">আইরে বেচারা!</h2>
        <div className="space-y-1">
          <p className="text-xl font-bold text-gray-800">গেম শেষ ভাই!</p>
          <p className="text-lg font-black text-pink-600">চাঁদা দিয়ে বিদায় হও অথবা আবার খেলো 😂</p>
        </div>

        <div className="mt-4 px-10 py-3 bg-gray-50 border-2 border-blue-200 rounded-2xl shadow-sm inline-block min-w-[200px]">
          <span className="text-gray-400 font-black text-lg">স্কোর: {playerData.score} পয়েন্ট</span>
        </div>
      </div>

      <div className="flex flex-col w-full gap-3 mt-2">
        <button
          onClick={onPay}
          className="w-full flex items-center justify-center gap-3 py-5 bg-pink-500 hover:bg-pink-600 rounded-3xl text-2xl font-black text-white shadow-[0_8px_0_rgb(159,18,57)] active:shadow-none active:translate-y-[8px] transition-all"
        >
          <CreditCard className="w-7 h-7" />
          চাঁদা দেবো 😂
        </button>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-3 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-all"
        >
          <RefreshCcw className="w-6 h-6" />
          আবার খেলো (রিভেঞ্জ!)
        </button>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={shareOnFacebook}
            className="flex items-center justify-center gap-2 py-3 bg-[#1877F2] hover:bg-[#166fe5] rounded-xl text-xs font-black text-white shadow-lg active:scale-95 transition-all"
          >
            <Facebook size={16} fill="white" /> ফেসবুক শেয়ার
          </button>
          <button
            onClick={shareGame}
            className="flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-black text-white shadow-lg active:scale-95 transition-all"
          >
            <Share2 size={16} /> অন্যান্য শেয়ার
          </button>
        </div>
      </div>

      <div className="text-[11px] font-bold text-amber-900 bg-amber-100/50 p-3 rounded-2xl border border-dashed border-amber-300 w-full">
        ⚠️ সতর্কবাণী: চাঁদা না দিলে গেমে জেতা অসম্ভব! 😜
      </div>
    </div>
  );
};

export default GameOverScreen;
