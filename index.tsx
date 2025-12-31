
import React, { useState, useEffect, useRef, useCallback } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai@1.34.0';

// --- Types ---
interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number;
}

interface NewYearWish {
  chinese: string; english: string; author: string;
}

interface FireworkParticle {
  x: number; y: number; vx: number; vy: number;
  color: string; alpha: number; decay: number; size: number;
}

// --- Services ---
const generateNewYearWish = async (userName: string = "朋友"): Promise<NewYearWish> => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  
  if (!apiKey) {
    return {
      chinese: "岁序更迭，华章日新。\n2026年，愿你眼中有光，心中有海。\n每一滴汗水都化作星辰，照亮你奔赴山海的征程。",
      english: "As the chapters turn, a new verse begins.\nIn 2026, may your eyes be filled with light and your heart with the vast sea.",
      author: "星火诗人"
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一位优雅的诗人。请为 ${userName} 创作一段迎接 2026 年的新年寄语。JSON格式，包含chinese, english, author属性。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chinese: { type: Type.STRING },
            english: { type: Type.STRING },
            author: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { chinese: "愿星光照亮你的 2026。", english: "May starlight illuminate your 2026.", author: "Gemini" };
  }
};

// --- Components ---
const COLORS = ['#FFD700', '#FF4500', '#FF1493', '#00BFFF', '#7FFF00', '#FFFFFF'];

const FireworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FireworkParticle[]>([]);

  const createFirework = useCallback((x: number, y: number) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      particlesRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color, alpha: 1, decay: Math.random() * 0.015 + 0.01, size: Math.random() * 2 + 0.5
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    let frame: number;
    const render = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.alpha -= p.decay;
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
      if (Math.random() < 0.02) createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.5);
      frame = requestAnimationFrame(render);
    };
    render();
    const handleAction = (e: any) => createFirework(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);
    window.addEventListener('mousedown', handleAction);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [createFirework]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

const CountdownTimer: React.FC = () => {
  const [time, setTime] = useState<TimeLeft | null>(null);
  useEffect(() => {
    const itv = setInterval(() => {
      const diff = new Date('2026-01-01T00:00:00').getTime() - Date.now();
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(itv);
  }, []);

  if (!time) return null;
  return (
    <div className="flex space-x-4 mt-8">
      {Object.entries(time).map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="glass-morphism w-16 h-20 flex items-center justify-center rounded-xl border border-yellow-500/30">
            <span className="text-3xl font-bold text-yellow-500 text-glow-gold">{val.toString().padStart(2,'0')}</span>
          </div>
          <span className="text-[10px] uppercase text-yellow-500/50 mt-2">{label}</span>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [wish, setWish] = useState<NewYearWish | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWish, setShowWish] = useState(false);

  const start = async (e: any) => {
    e.preventDefault();
    setLoading(true); setShowWish(true);
    const res = await generateNewYearWish(name || "朋友");
    setWish(res); setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#050505] p-6 text-center">
      <FireworkCanvas />
      <div className="relative z-10 w-full max-w-2xl">
        <h2 className="text-yellow-600 font-cinzel tracking-[0.5em] mb-2">COUNTDOWN TO</h2>
        <h1 className="text-8xl sm:text-9xl font-cinzel font-bold text-white text-glow-gold">2026</h1>
        <CountdownTimer />

        <div className="mt-12 min-h-[300px] flex items-center justify-center">
          {!showWish ? (
            <form onSubmit={start} className="glass-morphism p-8 rounded-3xl w-full space-y-6">
              <h3 className="text-xl font-bold">开启您的 2026 专属寄语</h3>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="输入您的名字..." className="w-full bg-white/5 border border-yellow-500/20 p-4 rounded-xl text-center focus:ring-2 focus:ring-yellow-500" />
              <button type="submit" className="w-full bg-yellow-500 text-black font-bold p-4 rounded-xl hover:scale-105 transition-transform">点亮 2026</button>
            </form>
          ) : (
            <div className="glass-morphism p-8 rounded-3xl w-full animate-fade-in">
              {loading ? <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-500 mx-auto" /> : 
                wish && (
                  <div className="space-y-6">
                    <p className="text-2xl leading-relaxed whitespace-pre-wrap">{wish.chinese}</p>
                    <p className="text-sm text-gray-500 italic">{wish.english}</p>
                    <p className="text-yellow-500 font-bold">— {wish.author} —</p>
                    <button onClick={()=>setShowWish(false)} className="text-[10px] text-gray-600 uppercase tracking-widest mt-4">返回</button>
                  </div>
                )
              }
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
