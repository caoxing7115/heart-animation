
import React, { useState, useEffect, useCallback } from 'react';
import FireworkCanvas from './components/FireworkCanvas';
import CountdownTimer from './components/CountdownTimer';
import { generateNewYearWish } from './services/geminiService';
import { NewYearWish } from './types';

const App: React.FC = () => {
  const [wish, setWish] = useState<NewYearWish | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [phase, setPhase] = useState<'input' | 'wish'>('input');
  const [isCelebration, setIsCelebration] = useState(false);

  useEffect(() => {
    const target = new Date('January 1, 2026 00:00:00').getTime();
    const check = () => {
      if (Date.now() >= target) setIsCelebration(true);
    };
    check();
    const itv = setInterval(check, 1000);
    return () => clearInterval(itv);
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPhase('wish');
    const result = await generateNewYearWish(userName || "匿名好友");
    setWish(result);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#050505] overflow-hidden">
      <FireworkCanvas />

      {/* 核心容器 */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        
        {/* 标题 */}
        <div className="mb-10 animate-fade-in-down">
          <h2 className="text-yellow-600 font-cinzel text-lg sm:text-xl tracking-[0.5em] mb-2 uppercase">
            {isCelebration ? "Welcome to the Future" : "Counting Down To"}
          </h2>
          <h1 className="text-7xl sm:text-9xl font-cinzel font-bold tracking-tighter text-white text-glow-gold">
            2026
          </h1>
          <div className="h-0.5 w-40 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-6" />
        </div>

        {/* 倒计时 */}
        {!isCelebration && <CountdownTimer />}
        
        {isCelebration && (
          <div className="animate-bounce-slow my-6">
            <h2 className="text-5xl sm:text-7xl font-cinzel font-bold text-red-600 text-glow-red">
              HAPPY NEW YEAR
            </h2>
          </div>
        )}

        {/* 交互区 */}
        <div className="w-full max-w-xl mt-12 min-h-[320px] flex items-center justify-center">
          {phase === 'input' ? (
            <form onSubmit={handleStart} className="glass-morphism p-10 rounded-[2.5rem] w-full flex flex-col space-y-8 animate-slide-up">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">开启专属新年寄语</h3>
                <p className="text-gray-400 text-sm">请输入您的名字，让 2026 的星光为您停留</p>
              </div>
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="在此输入名字..."
                className="bg-white/5 border border-yellow-500/20 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all text-center text-lg"
              />
              <button 
                type="submit"
                className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-black font-black py-5 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-yellow-900/20 uppercase tracking-widest"
              >
                点亮 2026
              </button>
            </form>
          ) : (
            <div className="glass-morphism p-10 sm:p-14 rounded-[3rem] w-full animate-fade-in relative">
              {loading ? (
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-14 h-14 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                  <p className="text-yellow-500/80 font-medium tracking-widest">正在连接 2026 的时空...</p>
                </div>
              ) : wish ? (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <p className="text-2xl sm:text-3xl text-white font-medium leading-[1.8] whitespace-pre-wrap">
                      {wish.chinese}
                    </p>
                    <div className="flex justify-center items-center space-x-4 opacity-30">
                      <div className="h-px w-10 bg-yellow-500" />
                      <i className="fas fa-star text-[10px] text-yellow-500"></i>
                      <div className="h-px w-10 bg-yellow-500" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 italic leading-relaxed font-light">
                      {wish.english}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                    <span className="text-yellow-500/80 font-cinzel font-bold text-sm tracking-widest">— {wish.author} —</span>
                    <button 
                      onClick={() => setPhase('input')}
                      className="mt-10 text-[10px] text-gray-600 hover:text-yellow-500 transition-colors uppercase tracking-[0.3em] font-bold"
                    >
                      <i className="fas fa-arrow-left mr-2"></i> 返回修改
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-gray-600 text-[10px] tracking-[0.4em] uppercase animate-pulse">
          Click or Tap to release fireworks
        </div>
      </div>

      {/* 氛围灯 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-yellow-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-800/10 blur-[120px]" />
      </div>

      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in-down { animation: fade-in-down 1.2s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        .animate-fade-in { animation: fade-in-down 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
