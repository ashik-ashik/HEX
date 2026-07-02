import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const floatingItems = [
  { emoji: "🍕", label: "pizza box", top: "12%", left: "8%", rotate: "-15deg", delay: "0s" },
  { emoji: "👟", label: "sneaker", top: "70%", left: "5%", rotate: "20deg", delay: "0.4s" },
  { emoji: "🧦", label: "sock", top: "20%", right: "7%", rotate: "10deg", delay: "0.8s" },
  { emoji: "🎮", label: "controller", top: "65%", right: "6%", rotate: "-8deg", delay: "0.2s" },
  { emoji: "☕", label: "mug", top: "40%", left: "4%", rotate: "5deg", delay: "1s" },
  { emoji: "🧴", label: "shampoo", top: "30%", right: "10%", rotate: "-20deg", delay: "0.6s" },
];

export default function PageNotFound() {
  const navigate = useNavigate();
  const [flicker, setFlicker] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Flicker the door light
  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker((f) => !f);
      setTimeout(() => setFlicker(true), 80);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <div className="relative min-h-screen bg-[#1a1a1f] overflow-hidden flex flex-col items-center justify-center px-4 py-12 select-none">

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-teal-900/10 blur-[80px]" />
      </div>

      {/* Floating bachelor items — hidden on tiny screens, shown sm+ */}
      {floatingItems.map((item) => (
        <span
          key={item.label}
          aria-hidden="true"
          className="hidden sm:block absolute text-2xl md:text-3xl opacity-20 animate-bounce"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            rotate: item.rotate,
            animationDelay: item.delay,
            animationDuration: "3s",
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">

        {/* Door illustration */}
        <div className="relative mx-auto mb-8 w-32 h-44 sm:w-40 sm:h-56">
          {/* Door frame */}
          <div className="absolute inset-0 rounded-t-xl bg-[#2a2218] border-4 border-[#3d3020] shadow-2xl" />
          {/* Door panels */}
          <div className="absolute top-3 left-3 right-3 h-16 sm:h-20 rounded bg-[#231c12] border border-[#3d3020]" />
          <div className="absolute bottom-10 sm:bottom-14 left-3 right-3 h-14 sm:h-16 rounded bg-[#231c12] border border-[#3d3020]" />
          {/* Doorknob */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_2px_rgba(245,158,11,0.6)]" />
          {/* Under-door light glow */}
          <div
            className="absolute -bottom-1 left-4 right-4 h-1 rounded-full transition-all duration-150"
            style={{
              background: flicker
                ? "radial-gradient(ellipse, rgba(245,158,11,0.8) 0%, transparent 100%)"
                : "radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 100%)",
              boxShadow: flicker
                ? "0 0 16px 4px rgba(245,158,11,0.4)"
                : "0 0 4px 1px rgba(245,158,11,0.1)",
            }}
          />
          {/* Sticky note on door */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-200 text-yellow-900 text-[9px] sm:text-[10px] font-bold px-2 py-1 rotate-[-3deg] shadow-md whitespace-nowrap leading-tight rounded-sm">
            WRONG<br />ROOM
          </div>
        </div>

        {/* Error code */}
        <div className="mb-2 font-mono">
          <span className="text-xs sm:text-sm tracking-[0.3em] text-teal-500 uppercase font-semibold">
            Room Error
          </span>
        </div>
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-white leading-none mb-4 tracking-tighter">
          4<span className="text-amber-400">0</span>4
        </h1>

        {/* Message */}
        <p className="text-lg sm:text-xl font-semibold text-zinc-200 mb-2">
          You've knocked on the wrong door, mate.
        </p>
        <p className="text-sm sm:text-base text-zinc-500 mb-8 max-w-xs mx-auto leading-relaxed">
          This room doesn't exist in{" "}
          <span className="text-teal-400 font-semibold">Hexa Haven</span>.
          Maybe someone ate your page like the last pizza slice.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold text-sm transition-all duration-150 shadow-lg shadow-teal-900/40"
          >
            🏠 Back to the House
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold text-sm transition-all duration-150 border border-zinc-700"
          >
            ← Go Back
          </button>
        </div>

        {/* Countdown */}
        <p className="text-xs text-zinc-600">
          Auto-returning home in{" "}
          <span className="text-amber-400 font-bold tabular-nums">{countdown}s</span>
        </p>
      </div>

      {/* Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111115] to-transparent pointer-events-none" />

      {/* Scattered floor items */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 sm:gap-10 text-xl sm:text-2xl opacity-20 pointer-events-none" aria-hidden="true">
        <span style={{ rotate: "-12deg" }}>🥤</span>
        <span style={{ rotate: "6deg" }}>🧢</span>
        <span style={{ rotate: "-4deg" }}>📦</span>
        <span style={{ rotate: "15deg" }}>🔌</span>
        <span style={{ rotate: "-8deg" }}>🧃</span>
      </div>
    </div>
  );
}