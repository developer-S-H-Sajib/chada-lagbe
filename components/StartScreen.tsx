
import React, { useState, useEffect } from 'react';
import { Camera, User, Play } from 'lucide-react';

interface StartScreenProps {
  onStart: (name: string, photo: string | null) => void;
  initialName?: string;
  initialPhoto?: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, initialName = '', initialPhoto = null }) => {
  const [name, setName] = useState(initialName);
  const [photo, setPhoto] = useState<string | null>(initialPhoto);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = name.trim().length > 0 && photo !== null;

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center gap-6 border-4 border-dashed border-pink-200">
      <div className="relative">
        <div className={`w-32 h-32 bg-gray-100 rounded-full border-4 overflow-hidden flex items-center justify-center transition-all ${photo ? 'border-pink-500' : 'border-gray-300 animate-pulse'}`}>
          {photo ? (
            <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full cursor-pointer shadow-lg hover:bg-pink-600 transition-colors">
          <Camera className="w-5 h-5 text-white" />
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {!photo && <p className="text-red-500 text-sm font-bold animate-bounce">গেম শুরু করতে একটি ছবি দিন! 📸</p>}

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">চাঁদা লাগবে 😂</h2>
        <p className="text-gray-500 italic">খেলো, হারো, চাঁদা দাও!</p>
      </div>

      <div className="w-full space-y-4">
        <input
          type="text"
          placeholder="তোমার নাম লেখো..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 outline-none transition-all text-lg text-center"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <button
          onClick={() => isFormValid && onStart(name, photo)}
          disabled={!isFormValid}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xl font-bold text-white transition-all transform active:scale-95 ${
            isFormValid ? 'bg-pink-500 hover:bg-pink-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed opacity-50'
          }`}
        >
          <Play className="fill-current" />
          খেলা শুরু করো
        </button>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        * এটি শুধুমাত্র একটি মজার গেম। কোনো আসল টাকা লেনদেন হয় না।
      </div>
    </div>
  );
};

export default StartScreen;
