import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: 'indigo' | 'violet' | 'amber';
  phase: number;
}

export function AnimatedUniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(54, Math.max(24, Math.floor((width * height) / 28000)));
    const hues: Particle['hue'][] = ['indigo', 'violet', 'amber'];
    const particles: Particle[] = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.08 - Math.random() * 0.25,
      radius: 1 + Math.random() * 2.1,
      alpha: 0.22 + Math.random() * 0.45,
      hue: hues[idx % 7 === 0 ? 2 : idx % 2],
      phase: Math.random() * Math.PI * 2,
    }));

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const pulse = 0.65 + 0.35 * Math.sin(time * 0.0018 + p.phase);
        const alpha = p.alpha * pulse;
        const color =
          p.hue === 'amber'
            ? `rgba(252, 211, 77, ${alpha})`
            : p.hue === 'violet'
              ? `rgba(167, 139, 250, ${alpha})`
              : `rgba(129, 140, 248, ${alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Connect very close star motes with subtle constellation threads
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 11000) {
            const lineAlpha = (1 - distSq / 11000) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    let rafId = 0;
    const loop = (time: number) => {
      drawFrame(time);
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(loop);
      }
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="animated-universe-canvas"
      className="pointer-events-none fixed inset-0 z-0 opacity-85"
    />
  );
}
