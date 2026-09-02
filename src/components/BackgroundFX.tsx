import { useMemo } from "react";
import {
  Sparkles,
  Star,
  Heart,
  Triangle,
  Hexagon,
  Gem,
  Wand2,
  PartyPopper,
  Music2,
  Rocket,
  Zap,
  CircleDot,
} from "lucide-react";

const ICONS = [
  Sparkles,
  Star,
  Heart,
  Triangle,
  Hexagon,
  Gem,
  Wand2,
  PartyPopper,
  Music2,
  Rocket,
  Zap,
  CircleDot,
];

interface Particle {
  id: number;
  Icon: (typeof ICONS)[number];
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    Icon: ICONS[i % ICONS.length],
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 14 + Math.random() * 22,
    duration: 10 + Math.random() * 14,
    delay: Math.random() * -20,
    opacity: 0.12 + Math.random() * 0.22,
    driftX: Math.random() > 0.5 ? 1 : -1,
  }));
}

export default function BackgroundFX() {
  const particles = useMemo(() => makeParticles(16), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0f0620]">
      {/* base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b32] via-[#210f3f] to-[#0d0620]" />

      {/* aurora blobs */}
      <div className="blob-anim absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-600/40 blur-3xl" />
      <div
        className="blob-anim absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-indigo-600/40 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="blob-anim absolute bottom-[-5rem] left-1/4 h-72 w-72 rounded-full bg-purple-700/40 blur-3xl"
        style={{ animationDelay: "-12s" }}
      />

      {/* grid overlay for techy feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* floating shape particles */}
      {particles.map(({ id, Icon, top, left, size, duration, delay, opacity, driftX }) => (
        <div
          key={id}
          className="particle-float absolute"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            // @ts-expect-error custom property for keyframes
            "--drift-x": `${driftX * (20 + Math.random() * 40)}px`,
          }}
        >
          <Icon
            style={{ width: size, height: size, opacity, color: "#e9d5ff" }}
            strokeWidth={1.5}
          />
        </div>
      ))}

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(6,2,15,0.55)_100%)]" />
    </div>
  );
}
