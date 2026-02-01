import React, { useState, useRef } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PaymentModalProps {
  onSuccess: (amount: number) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);

  // 🔊 Sound
  const funnySoundRef = useRef<HTMLAudioElement | null>(null);

  const playFunnySound = () => {
    if (!funnySoundRef.current) {
      funnySoundRef.current = new Audio('/funny-sound-1.mp3');
      funnySoundRef.current.volume = 1;
    }
    funnySoundRef.current.currentTime = 0;
    funnySoundRef.current.play().catch(() => { });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length >= 4 && Number(amount) > 0) {
      playFunnySound();

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess(Number(amount));
      }, 1500);
    }
  };

  const openProfile = () => {
    window.open('https://www.facebook.com/Sayem1271/', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="bg-[#D12053] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20"
        style={{ transform: 'scale(0.96)' }}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#D12053] font-black text-2xl italic">
              b
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg leading-none">
                bKash
              </span>
              <span className="text-white/70 text-[10px] font-bold uppercase">
                Parody / Demo
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="bg-black/20 p-2 rounded-full text-white hover:bg-black/40 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white space-y-6">
          {/* Amount */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] text-gray-700 font-bold">
                আপনি কত টাকা চাঁদা দিতে চান?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-500">
                  ৳
                </span>
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-4 bg-gray-100 rounded-xl text-2xl font-black outline-none focus:ring-2 focus:ring-[#D12053]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* PIN */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] text-gray-700 font-bold">
                  বিকাশ পিন নম্বর
                </label>
                <input
                  type="password"
                  placeholder="পিন লিখুন"
                  className="w-full p-4 bg-gray-100 rounded-xl text-center text-3xl tracking-[0.3em] outline-none focus:ring-2 focus:ring-[#D12053]"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 5))
                  }
                  maxLength={5}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className={`w-full py-4 rounded-xl font-black text-white text-xl transition-all active:scale-95 ${loading
                  ? 'bg-gray-400'
                  : 'bg-[#D12053] hover:bg-[#b01b46]'
                  }`}
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'চাঁদা দাও 😂'}
              </button>
            </form>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-pink-50 rounded-xl text-center border border-pink-100">
            <p className="text-[11px] font-bold text-pink-700">
              এটি শুধুমাত্র মজা করার জন্য। কোনো আসল টাকা কাটা হবে না।
            </p>
          </div>

          {/* 🔥 Profile Button with Animation */}
          <div className="flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-[14px] font-bold text-gray-700 text-center">
              আসল চাঁদা দিতে যোগাযোগ করুন
            </p>

            <button
              onClick={openProfile}
              className="
                w-full py-3
                bg-[#1877F2]
                text-white font-black
                rounded-xl shadow
                transition-all duration-300
                hover:bg-[#145fd1]
                hover:scale-105
                active:scale-95
                animate-pulse
              "
            >
              প্রোফাইল দেখুন
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 text-[#D12053] font-bold text-[10px] uppercase opacity-40">
            <ShieldCheck size={12} /> ১০০% সুরক্ষিত নয় 😂
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;