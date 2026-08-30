import React from "react";

const letters = [
  { char: "H", delay: "0s" },
  { char: "E", delay: "0.08s" },
  { char: "X", delay: "0.16s" },
  { char: "A", delay: "0.24s" },
  { char: "H", delay: "0.42s" },
  { char: "O", delay: "0.50s" },
  { char: "U", delay: "0.58s" },
  { char: "S", delay: "0.66s" },
  { char: "E", delay: "0.74s" },
];

const HexaHouseLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      {/* Main radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.035] blur-[80px]" />

      <div className="pointer-events-none absolute left-[20%] top-[20%] h-32 w-32 animate-[orbFloat_7s_ease-in-out_infinite] rounded-full bg-blue-500/[0.06] blur-[70px]" />

      <div className="pointer-events-none absolute bottom-[15%] right-[15%] h-36 w-36 animate-[orbFloat_9s_ease-in-out_infinite_reverse] rounded-full bg-purple-500/[0.05] blur-[80px]" />

      {/* Moving background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(34,211,238,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.8)_1px,transparent_1px)] [background-size:45px_45px] animate-[gridMove_12s_linear_infinite]" />

      {/* =========================================================
          FLOATING PARTICLES
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }).map((_, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-cyan-300"
            style={{
              left: `${5 + ((index * 17) % 90)}%`,
              top: `${8 + ((index * 29) % 82)}%`,
              width: `${index % 3 === 0 ? 3 : 2}px`,
              height: `${index % 3 === 0 ? 3 : 2}px`,
              opacity: 0.15 + (index % 4) * 0.1,
              animation: `particleFloat ${
                3 + (index % 5)
              }s ease-in-out infinite`,
              animationDelay: `${-(index * 0.37)}s`,
            }}
          />
        ))}
      </div>

      {/* =========================================================
          MAIN LOADER
      ========================================================== */}

      <div className="relative flex flex-col items-center">
        {/* =======================================================
            HOUSE
        ======================================================== */}

        <div className="relative h-[100px] w-[117px]">
          {/* House aura */}
          <div className="absolute left-1/2 top-[48%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.045] blur-[36px] animate-[houseAura_3s_ease-in-out_infinite]" />

          <svg
            viewBox="0 0 320 280"
            className="relative h-full w-full overflow-visible"
          >
            <defs>
              {/* Main house gradient */}
              <linearGradient
                id="houseGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="45%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              {/* Bright energy */}
              <linearGradient
                id="energyGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              {/* Window */}
              <linearGradient
                id="windowGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              {/* Glow */}
              <filter id="houseGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="6" result="blur" />

                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Mask for scanning effect */}
              <linearGradient id="scanGradient">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* =================================================
                GROUND RINGS
            ================================================== */}

            <ellipse
              cx="160"
              cy="248"
              rx="108"
              ry="13"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              opacity="0.25"
              className="animate-[groundPulse_2.5s_ease-out_infinite]"
            />

            <ellipse
              cx="160"
              cy="248"
              rx="82"
              ry="8"
              fill="none"
              stroke="#818cf8"
              strokeWidth="1"
              opacity="0.3"
              className="animate-[groundPulse_2.5s_ease-out_0.6s_infinite]"
            />

            {/* =================================================
                HOUSE SHADOW
            ================================================== */}

            <path
              d="M70 220 H250"
              stroke="#22d3ee"
              strokeWidth="2"
              opacity="0.35"
              strokeLinecap="round"
              className="animate-[shadowPulse_2s_ease-in-out_infinite]"
            />

            {/* =================================================
                HOUSE BODY
            ================================================== */}

            <path
              d="M72 125 L160 57 L248 125 V220 H72 Z"
              fill="rgba(8,20,40,0.7)"
              stroke="url(#houseGradient)"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeDasharray="700"
              strokeDashoffset="700"
              filter="url(#houseGlow)"
              className="animate-[drawHouse_2.2s_cubic-bezier(.65,0,.35,1)_forwards]"
            />

            {/* Inner body lines */}
            <path
              d="M85 135 V207 M235 135 V207"
              stroke="#22d3ee"
              strokeWidth="1"
              opacity="0.2"
              strokeDasharray="5 7"
              className="animate-[fadeIn_1s_ease_1.8s_both]"
            />

            {/* =================================================
                ROOF
            ================================================== */}

            <path
              d="M45 132 L160 38 L275 132"
              fill="none"
              stroke="url(#houseGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="600"
              strokeDashoffset="600"
              filter="url(#strongGlow)"
              className="animate-[drawRoof_1.7s_cubic-bezier(.65,0,.35,1)_0.15s_forwards]"
            />

            {/* Roof inner highlight */}
            <path
              d="M62 128 L160 48 L258 128"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4 8"
              className="animate-[roofShimmer_3s_linear_2s_infinite]"
            />

            {/* =================================================
                CHIMNEY
            ================================================== */}

            <path
              d="M205 75 V43 H229 V96"
              fill="rgba(8,20,40,0.9)"
              stroke="#818cf8"
              strokeWidth="3"
              strokeDasharray="180"
              strokeDashoffset="180"
              className="animate-[drawChimney_1s_ease-out_0.9s_forwards]"
            />

            {/* Chimney energy */}
            <path
              d="M211 50 H224"
              stroke="#67e8f9"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[energyBlink_1.2s_ease-in-out_2s_infinite]"
            />

            {/* =================================================
                HEXAGON EMBLEM
            ================================================== */}

            <g
              className="animate-[hexFloat_3s_ease-in-out_2s_infinite]"
              style={{ transformOrigin: "160px 91px" }}
            >
              <polygon
                points="160,73 177,83 177,102 160,112 143,102 143,83"
                fill="rgba(34,211,238,0.04)"
                stroke="#22d3ee"
                strokeWidth="2"
                filter="url(#houseGlow)"
              />

              <polygon
                points="160,78 172,85 172,99 160,106 148,99 148,85"
                fill="none"
                stroke="#818cf8"
                strokeWidth="1"
                opacity="0.7"
              />

              <circle
                cx="160"
                cy="92"
                r="4"
                fill="#67e8f9"
                filter="url(#strongGlow)"
                className="animate-pulse"
              />
            </g>

            {/* =================================================
                DOOR
            ================================================== */}

            <g className="animate-[doorAppear_1s_cubic-bezier(.34,1.56,.64,1)_1.45s_both]">
              <rect
                x="138"
                y="160"
                width="44"
                height="60"
                rx="3"
                fill="rgba(15,23,42,0.9)"
                stroke="#38bdf8"
                strokeWidth="3"
              />

              {/* Door inner border */}
              <rect
                x="143"
                y="165"
                width="34"
                height="50"
                rx="2"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1"
                opacity="0.5"
              />

              {/* Door knob */}
              <circle
                cx="172"
                cy="190"
                r="3"
                fill="#67e8f9"
                filter="url(#houseGlow)"
                className="animate-[knobPulse_2s_ease-in-out_infinite]"
              />
            </g>

            {/* =================================================
                LEFT WINDOW
            ================================================== */}

            <g className="animate-[windowAppear_1s_cubic-bezier(.34,1.56,.64,1)_1.5s_both]">
              <rect
                x="88"
                y="151"
                width="34"
                height="34"
                rx="3"
                fill="url(#windowGradient)"
                opacity="0.85"
                filter="url(#houseGlow)"
              />

              <path
                d="M105 151 V185 M88 168 H122"
                stroke="#e0f2fe"
                strokeWidth="2"
              />

              {/* Window reflection */}
              <path
                d="M91 154 L99 154"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
                className="animate-[windowShine_2.5s_ease-in-out_3s_infinite]"
              />
            </g>

            {/* =================================================
                RIGHT WINDOW
            ================================================== */}

            <g className="animate-[windowAppear_1s_cubic-bezier(.34,1.56,.64,1)_1.65s_both]">
              <rect
                x="198"
                y="151"
                width="34"
                height="34"
                rx="3"
                fill="url(#windowGradient)"
                opacity="0.85"
                filter="url(#houseGlow)"
              />

              <path
                d="M215 151 V185 M198 168 H232"
                stroke="#e0f2fe"
                strokeWidth="2"
              />

              <path
                d="M201 154 L209 154"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
                className="animate-[windowShine_2.5s_ease-in-out_3.5s_infinite]"
              />
            </g>

            {/* =================================================
                ENERGY SCANNER
            ================================================== */}

            <path
              d="M55 128 H265"
              stroke="url(#scanGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0"
              className="animate-[scanHouse_2.5s_ease-in-out_2s_infinite]"
            />

            {/* =================================================
                ROOF ENERGY PARTICLES
            ================================================== */}

            <circle
              cx="160"
              cy="38"
              r="5"
              fill="#fff"
              filter="url(#strongGlow)"
              className="animate-[roofSpark_2s_ease-in-out_infinite]"
            />

            <circle
              cx="45"
              cy="132"
              r="3"
              fill="#22d3ee"
              className="animate-[cornerSpark_2s_ease-in-out_1s_infinite]"
            />

            <circle
              cx="275"
              cy="132"
              r="3"
              fill="#a855f7"
              className="animate-[cornerSpark_2s_ease-in-out_1.5s_infinite]"
            />

            {/* Small flying energy particles */}
            <circle
              cx="95"
              cy="105"
              r="2"
              fill="#67e8f9"
              className="animate-[energyParticle_2.5s_linear_2s_infinite]"
            />

            <circle
              cx="220"
              cy="95"
              r="2"
              fill="#818cf8"
              className="animate-[energyParticle_3s_linear_2.5s_infinite_reverse]"
            />
          </svg>
        </div>

        {/* =======================================================
            TEXT
        ======================================================== */}

        <div className="relative mt-1 flex items-center justify-center">
          {/* Background glow */}
          <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 bg-cyan-400/10 blur-xl" />

          <div className="relative flex items-center justify-center">
            {/* HEXA */}
            <div className="flex">
              {letters.slice(0, 4).map((item, index) => (
                <span
                  key={`${item.char}-${index}`}
                  className="
                    relative
                    inline-block
                    select-none
                    text-[20px]
                    font-black
                    leading-none
                    tracking-tight
                    text-transparent
                    bg-gradient-to-b
                    from-cyan-200
                    via-cyan-400
                    to-blue-500
                    bg-clip-text
                    drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]
                    animate-[letterDance_2.4s_ease-in-out_infinite]
                  "
                  style={{
                    animationDelay: item.delay,
                  }}
                >
                  {item.char}

                  {/* Individual letter glow */}
                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      text-transparent
                      bg-gradient-to-b
                      from-white
                      to-cyan-300
                      bg-clip-text
                      opacity-0
                      animate-[letterFlash_3s_ease-in-out_infinite]
                    "
                    style={{
                      animationDelay: `${0.5 + index * 0.15}s`,
                    }}
                  >
                    {item.char}
                  </span>
                </span>
              ))}
            </div>

            {/* Space */}
            <span className="w-2.5" />

            {/* HOUSE */}
            <div className="flex">
              {letters.slice(4).map((item, index) => (
                <span
                  key={`${item.char}-${index}`}
                  className="
                    relative
                    inline-block
                    select-none
                    text-[20px]
                    font-black
                    leading-none
                    tracking-tight
                    text-transparent
                    bg-gradient-to-b
                    from-purple-200
                    via-indigo-400
                    to-purple-600
                    bg-clip-text
                    drop-shadow-[0_0_6px_rgba(139,92,246,0.45)]
                    animate-[letterDance_2.4s_ease-in-out_infinite]
                  "
                  style={{
                    animationDelay: `${0.42 + index * 0.11}s`,
                  }}
                >
                  {item.char}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      text-transparent
                      bg-gradient-to-b
                      from-white
                      to-purple-300
                      bg-clip-text
                      opacity-0
                      animate-[letterFlash_3s_ease-in-out_infinite]
                    "
                    style={{
                      animationDelay: `${1 + index * 0.13}s`,
                    }}
                  >
                    {item.char}
                  </span>
                </span>
              ))}
            </div>

            {/* Moving light across text */}
            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-[30%]
                w-[25%]
                skew-x-[-20deg]
                bg-gradient-to-r
                from-transparent
                via-white/70
                to-transparent
                blur-sm
                animate-[textSweep_3.5s_ease-in-out_1s_infinite]
              "
            />
          </div>
        </div>

        {/* =======================================================
            LOADING INDICATOR
        ======================================================== */}

        <div className="mt-4 flex items-center gap-2.5">
          <div className="relative h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping" />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-cyan-300" />
          </div>

          <div className="relative h-[2px] w-20 overflow-hidden rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 w-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-[loadingBar_1.6s_ease-in-out_infinite]" />
          </div>

          <div className="relative h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping [animation-delay:0.5s]" />
            <span className="relative block h-1.5 w-1.5 rounded-full bg-purple-300" />
          </div>
        </div>

        <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.45em] text-slate-500 animate-[subtleFade_2s_ease-in-out_infinite]">
          Entering the house
        </p>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        @keyframes drawHouse {
          0% {
            stroke-dashoffset: 700;
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawRoof {
          0% {
            stroke-dashoffset: 600;
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawChimney {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes doorAppear {
          0% {
            opacity: 0;
            transform: translateY(15px) scaleY(0.5);
            transform-origin: bottom;
          }

          70% {
            transform: translateY(-2px) scaleY(1.05);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes windowAppear {
          0% {
            opacity: 0;
            transform: scale(0);
            transform-origin: center;
          }

          65% {
            transform: scale(1.18);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes houseAura {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0.35;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 0.7;
          }
        }

        @keyframes groundPulse {
          0% {
            opacity: 0.6;
            transform: scale(0.7);
          }

          70% {
            opacity: 0;
            transform: scale(1.5);
          }

          100% {
            opacity: 0;
          }
        }

        @keyframes shadowPulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scaleX(0.85);
          }

          50% {
            opacity: 0.6;
            transform: scaleX(1);
          }
        }

        @keyframes hexFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-4px) rotate(5deg);
          }
        }

        @keyframes roofShimmer {
          0% {
            stroke-dashoffset: 100;
            opacity: 0.15;
          }

          50% {
            opacity: 0.6;
          }

          100% {
            stroke-dashoffset: -100;
            opacity: 0.15;
          }
        }

        @keyframes scanHouse {
          0% {
            transform: translateY(-35px);
            opacity: 0;
          }

          15% {
            opacity: 0.9;
          }

          70% {
            opacity: 0.7;
          }

          100% {
            transform: translateY(115px);
            opacity: 0;
          }
        }

        @keyframes roofSpark {
          0%,
          100% {
            transform: scale(0.5);
            opacity: 0.25;
          }

          40% {
            transform: scale(1.5);
            opacity: 1;
          }

          55% {
            transform: scale(0.7);
            opacity: 0.4;
          }
        }

        @keyframes cornerSpark {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.5);
          }

          50% {
            opacity: 1;
            transform: scale(1.7);
          }
        }

        @keyframes energyParticle {
          0% {
            transform: translate(0, 10px);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          100% {
            transform: translate(20px, -30px);
            opacity: 0;
          }
        }

        @keyframes knobPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.4);
          }
        }

        @keyframes windowShine {
          0%,
          100% {
            opacity: 0.2;
            transform: translateX(0);
          }

          50% {
            opacity: 1;
            transform: translateX(12px);
          }
        }

        /* ================================================
           LETTER ANIMATION
        ================================================= */

        @keyframes letterDance {
          0%,
          100% {
            transform:
              translateY(0)
              rotate(0deg)
              scale(1);
          }

          15% {
            transform:
              translateY(-5px)
              rotate(-4deg)
              scale(1.05);
          }

          30% {
            transform:
              translateY(2px)
              rotate(3deg)
              scale(0.97);
          }

          45% {
            transform:
              translateY(-8px)
              rotate(-2deg)
              scale(1.09);
          }

          60% {
            transform:
              translateY(1px)
              rotate(4deg)
              scale(0.98);
          }

          75% {
            transform:
              translateY(-4px)
              rotate(-3deg)
              scale(1.04);
          }
        }

        @keyframes letterFlash {
          0%,
          72%,
          100% {
            opacity: 0;
            transform: translateX(0);
          }

          76% {
            opacity: 0.9;
            transform: translateX(-2px);
          }

          79% {
            opacity: 0;
            transform: translateX(3px);
          }
        }

        @keyframes textSweep {
          0% {
            left: -30%;
            opacity: 0;
          }

          15% {
            opacity: 0.8;
          }

          50% {
            opacity: 1;
          }

          75% {
            opacity: 0.4;
          }

          100% {
            left: 115%;
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(0.8);
          }

          25% {
            transform: translate3d(8px, -15px, 0) scale(1);
          }

          50% {
            transform: translate3d(-5px, -28px, 0) scale(1.2);
          }

          75% {
            transform: translate3d(12px, -12px, 0) scale(0.9);
          }
        }

        @keyframes orbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(30px, -25px, 0);
          }
        }

        @keyframes gridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 45px 45px;
          }
        }

        @keyframes energyBlink {
          0%,
          100% {
            opacity: 0.2;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes subtleFade {
          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-32px);
          }

          50% {
            transform: translateX(56px);
          }

          100% {
            transform: translateX(-32px);
          }
        }
      `}</style>
    </div>
  );
};

export default HexaHouseLoader;