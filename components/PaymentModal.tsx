
import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PaymentModalProps {
  onSuccess: (amount: number) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4 && Number(amount) > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess(Number(amount));
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#D12053] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-white/20">
        {/* bKash Parody Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#D12053] font-black text-2xl italic">b</div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg leading-none">bKash</span>
              <span className="text-white/70 text-[10px] font-bold uppercase">Parody / Demo</span>
            </div>
          </div>
          <button onClick={onCancel} className="bg-black/20 p-2 rounded-full text-white hover:bg-black/40 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-white space-y-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] text-gray-700 font-bold">আপনি কত টাকা চাঁদা দিতে চান?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-500">৳</span>
                <input
                  type="number"
                  placeholder="১০"
                  className="w-full pl-10 pr-4 py-4 bg-[#f3f4f6] border-2 border-transparent rounded-xl text-2xl font-black text-gray-900 outline-none focus:border-[#D12053] focus:bg-white transition-all shadow-inner"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] text-gray-700 font-bold">বিকাশ পিন নম্বর</label>
                <input
                  type="password"
                  placeholder="পিন লিখুন"
                  className="w-full p-4 bg-[#f3f4f6] border-2 border-transparent rounded-xl text-center text-3xl tracking-[0.3em] text-gray-900 outline-none focus:border-[#D12053] focus:bg-white transition-all font-mono shadow-inner"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className={`w-full py-4 rounded-xl font-black text-white text-xl shadow-xl transition-all active:scale-95 ${
                  loading ? 'bg-gray-400' : 'bg-[#D12053] hover:bg-[#b01b46]'
                }`}
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'চাঁদা দাও 😂'}
              </button>
            </form>
          </div>

          <div className="p-3 bg-pink-50 rounded-xl text-center border border-pink-100">
             <p className="text-[11px] font-bold text-pink-700 leading-tight">
               এটি শুধুমাত্র মজা করার জন্য। কোনো আসল টাকা কাটা হবে না।
             </p>
          </div>

          {/* User Requested QR Section - Matching Uploaded PNG Screenshot perfectly */}
          <div className="flex flex-col items-center p-6 bg-[#f9fafb] rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=যোগাযোগ-করুন&color=000000" 
                  alt="QR Contact" 
                  className="w-40 h-40" 
                />
            </div>
            <p className="text-xl font-bold text-gray-800 text-center leading-relaxed">
              আসল চাঁদা দিতে যোগাযোগ করেন
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-[#D12053] font-bold text-[10px] uppercase opacity-40">
            <ShieldCheck size={12} /> ১০০% সুরক্ষিত নয় 😂
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
