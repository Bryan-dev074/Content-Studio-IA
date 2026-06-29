"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo interactivo:
 *  - 3 manchas "aurora" que flotan y hacen PARALLAX siguiendo el mouse.
 *  - Red de partículas en canvas que se conectan entre sí y con el cursor.
 *  - RIPPLES (ondas) al hacer click en cualquier parte.
 * Todo es decorativo y no bloquea la interacción (pointer-events: none).
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;

    type P = { x: number; y: number; vx: number; vy: number };
    type Ripple = { x: number; y: number; r: number; a: number };

    let particles: P[] = [];
    const ripples: Ripple[] = [];
    const mouse = { x: -9999, y: -9999 };
    // parallax: objetivo y actual (suavizado)
    const par = { tx: 0, ty: 0, cx: 0, cy: 0 };

    const isDark = () =>
      document.documentElement.classList.contains("dark");

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = reduce ? 0 : Math.min(95, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
      }));
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      par.tx = (e.clientX / w - 0.5) * 46;
      par.ty = (e.clientY / h - 0.5) * 46;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      par.tx = 0;
      par.ty = 0;
    };
    const onClick = (e: PointerEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 0.5 });
      if (ripples.length > 8) ripples.shift();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dark = isDark();
      const rgb = dark ? "129,140,248" : "79,70,229"; // indigo
      const ripRgb = dark ? "167,139,250" : "124,58,237"; // violet

      // Parallax suavizado de las manchas
      par.cx += (par.tx - par.cx) * 0.06;
      par.cy += (par.ty - par.cy) * 0.06;
      if (blobsRef.current) {
        blobsRef.current.style.setProperty("--mx", `${par.cx}px`);
        blobsRef.current.style.setProperty("--my", `${par.cy}px`);
      }

      const D = 130;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Repulsión suave del cursor
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 120 * 120) {
          const md = Math.sqrt(md2) || 1;
          const f = (1 - md / 120) * 0.6;
          p.vx += (mdx / md) * f;
          p.vy += (mdy / md) * f;
        }

        // Fricción + límite de velocidad
        p.vx *= 0.96;
        p.vy *= 0.96;
        const sp = Math.hypot(p.vx, p.vy);
        const min = 0.12;
        if (sp < min) {
          const ang = Math.atan2(p.vy || Math.random() - 0.5, p.vx || Math.random() - 0.5);
          p.vx = Math.cos(ang) * min;
          p.vy = Math.sin(ang) * min;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Punto
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${dark ? 0.55 : 0.4})`;
        ctx.fill();

        // Conexiones entre partículas
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < D * D) {
            const a = (1 - Math.sqrt(d2) / D) * (dark ? 0.22 : 0.16);
            ctx.strokeStyle = `rgba(${rgb},${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // Conexión al cursor
        if (md2 < 170 * 170) {
          const a = (1 - Math.sqrt(md2) / 170) * (dark ? 0.35 : 0.25);
          ctx.strokeStyle = `rgba(${ripRgb},${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 4.5;
        r.a *= 0.96;
        if (r.a < 0.02) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ripRgb},${r.a})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("blur", onLeave);

    if (reduce) {
      draw(); // un frame estático
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div ref={blobsRef} className="absolute inset-0">
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "-5%",
            transform: "translate(var(--mx,0), var(--my,0))",
          }}
        >
          <div
            className="aurora-blob animate-floatA"
            style={{ width: "45vw", height: "45vw", background: "var(--aurora-1)" }}
          />
        </div>
        <div
          className="absolute"
          style={{
            top: "18%",
            right: "-10%",
            transform: "translate(calc(var(--mx,0) * -1.5), calc(var(--my,0) * -1.5))",
          }}
        >
          <div
            className="aurora-blob animate-floatB"
            style={{ width: "42vw", height: "42vw", background: "var(--aurora-2)" }}
          />
        </div>
        <div
          className="absolute"
          style={{
            bottom: "-15%",
            left: "25%",
            transform: "translate(calc(var(--mx,0) * 0.8), calc(var(--my,0) * 0.8))",
          }}
        >
          <div
            className="aurora-blob animate-floatC"
            style={{ width: "38vw", height: "38vw", background: "var(--aurora-3)" }}
          />
        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Viñeta para enfocar el centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 45%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
