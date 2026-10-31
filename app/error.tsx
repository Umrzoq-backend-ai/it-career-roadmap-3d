'use client';

import { useEffect } from 'react';
import { RefreshCw, Terminal } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Professional Map runtime error:', error);
  }, [error]);

  return (
    <div className="w-screen h-screen bg-[#090d16] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full rounded-3xl bg-[#0b1120] border border-slate-800 p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#a3e635]/15 border border-[#a3e635]/40 flex items-center justify-center mx-auto mb-5 text-[#a3e635]">
          <Terminal className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white mb-2">
          Professional Map — Qayta yuklash
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          3D grafik muhitni ishga tushirishda vaqtinchalik uzilish yuz berdi. Sahifani qayta
          yuklash orqali xaritani davom ettiring.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-[#090d16] font-extrabold text-xs hover:bg-[#bef264] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Xaritani qayta ochish
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer border border-slate-700"
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    </div>
  );
}
