
import React, { useRef } from 'react';
import { PlayerData } from '../types';
import { Download, CheckCircle, RefreshCcw, Facebook } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReceiptViewProps {
  playerData: PlayerData;
  onDone: () => void;
}

const ReceiptView: React.FC<ReceiptViewProps> = ({ playerData, onDone }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `chanda_receipt_${playerData.name || 'haru'}.png`;
        link.click();
      } catch (error) {
        alert("রসিদ ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে স্ক্রিনশট নিন! 😂");
      }
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`আমি সফলভাবে ${playerData.chandaAmount} টাকা চাঁদা দিয়ে মুক্তি পেলাম! 😂 গেমটি খেলে দেখো: `);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank');
  };

  const today = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
      <div className="bg-green-100 text-green-700 p-4 rounded-full border-4 border-green-500 shadow-xl animate-bounce">
        <CheckCircle size={48} />
      </div>

      <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">চাঁদা সফল!</h2>
          <p className="text-gray-500 font-medium italic">হাসতে হাসতে চাঁদা দেওয়ার জন্য ধন্যবাদ 😂</p>
      </div>

      <div 
        ref={receiptRef}
        className="w-full bg-white border-t-[12px] border-pink-500 shadow-2xl p-6 rounded-b-3xl relative overflow-hidden font-mono select-none"
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <h1 className="text-8xl font-black rotate-12">😂 HA HA</h1>
        </div>

        <div className="text-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
            <h3 className="text-2xl font-black text-pink-600">চাঁদার রসিদ 😂</h3>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">চাঁদা লাগবে অফিসিয়াল</p>
        </div>

        <div className="space-y-4 text-sm relative z-10">
            <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase text-[9px]">দাতা</span>
                <span className="font-black text-gray-800">{playerData.name || 'নামহীন হারু'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase text-[9px]">তারিখ</span>
                <span className="text-gray-800 font-medium">{today}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase text-[9px]">স্ট্যাটাস</span>
                <span className="text-green-600 font-bold">হাসতে হাসতে চাঁদা</span>
            </div>
            
            <div className="mt-8 pt-4 border-t-4 border-double border-gray-100 flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="text-lg font-black text-gray-900 uppercase">মোট চাঁদা:</span>
                <span className="text-3xl font-black text-pink-600">৳ {playerData.chandaAmount}.০০</span>
            </div>
        </div>

        <div className="mt-8 text-center space-y-3">
            <div className="flex flex-col items-center">
              <div className="relative w-28 h-28 bg-white p-2 border border-gray-100 rounded-xl shadow-sm mb-2">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CHANDA_SUCCESS&color=D12053" 
                  alt="QR" 
                  className="w-full h-full" 
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/BKash_Logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
              <p className="text-[8px] text-gray-400 font-black uppercase">এটি আসল আর্থিক দলিল নয়। ফানি রসিদ মাত্র।</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 w-full gap-3">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={downloadReceipt} className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95">
            <Download size={20} /> রসিদ নিন
          </button>
          <button onClick={shareOnFacebook} className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1877F2] text-white rounded-2xl font-black hover:bg-[#166fe5] transition-all shadow-lg active:scale-95">
            <Facebook size={20} /> শেয়ার
          </button>
        </div>
        <button onClick={onDone} className="w-full flex items-center justify-center gap-2 py-4 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 transition-all shadow-lg active:scale-95">
          <RefreshCcw size={20} /> আবার হারুন
        </button>
      </div>
    </div>
  );
};

export default ReceiptView;
