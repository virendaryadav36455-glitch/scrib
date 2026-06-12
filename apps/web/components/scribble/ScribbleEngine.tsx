"use client";
import React, { useRef, useLayoutEffect, useState, ReactNode, CSSProperties } from "react";

// Deterministic random numbers based on a seed
function rng(s: number, i: number): number {
  const x = Math.sin(s * 9301 + i * 49297 + 233711) * 43758.5453;
  return x - Math.floor(x);
}

// Generate points along a path with rough jitter amplitude
function generateWobblePath(w: number, h: number, seed: number, amp: number) {
  const r = (i: number) => (rng(seed, i) - 0.5) * amp * 2;
  return [
    [4 + r(0), 4 + r(1)],
    [w * 0.25 + r(2), 3 + r(3)],
    [w * 0.5 + r(4), 5 + r(5)],
    [w * 0.75 + r(6), 3 + r(7)],
    [w - 4 + r(8), 4 + r(9)],
    [w - 3 + r(10), h * 0.3 + r(11)],
    [w - 5 + r(12), h * 0.65 + r(13)],
    [w - 4 + r(14), h - 4 + r(15)],
    [w * 0.75 + r(16), h - 3 + r(17)],
    [w * 0.5 + r(18), h - 5 + r(19)],
    [w * 0.25 + r(20), h - 3 + r(21)],
    [4 + r(22), h - 4 + r(23)],
    [3 + r(24), h * 0.6 + r(25)],
    [5 + r(26), h * 0.3 + r(27)],
  ];
}

function renderScribbleLayer(
  canvas: HTMLCanvasElement, w: number, h: number,
  opts: { fill?: string; passes: number; amp: number; sw: number; seed: number; strokeColor: string }
) {
  if (w <= 0 || h <= 0) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // Fill Background context if specified
  if (opts.fill) {
    const fp = generateWobblePath(w, h, opts.seed, opts.amp * 0.4);
    ctx.beginPath();
    ctx.moveTo(fp[0]![0]!, fp[0]![1]!);
    for (let i = 1; i < fp.length; i++) {
      ctx.quadraticCurveTo(fp[i - 1]![0]!, fp[i - 1]![1]!, (fp[i - 1]![0]! + fp[i]![0]!) / 2, (fp[i - 1]![1]! + fp[i]![1]!) / 2);
    }
    ctx.closePath();
    ctx.fillStyle = opts.fill;
    ctx.fill();
  }

  // Draw overlapping organic stroke passes
  for (let p = 0; p < opts.passes; p++) {
    const jitter = (p - opts.passes / 2) * 0.35;
    const pts = generateWobblePath(w, h, opts.seed + p * 37, opts.amp);
    ctx.beginPath();
    ctx.moveTo(pts[0]![0]!, pts[0]![1]! + jitter);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]!, curr = pts[i]!;
      ctx.quadraticCurveTo(prev[0]!, prev[1]! + jitter, (prev[0]! + curr[0]!) / 2, (prev[1]! + curr[1]!) / 2 + jitter);
    }
    ctx.quadraticCurveTo(pts[pts.length - 1]![0]!, pts[pts.length - 1]![1]! + jitter, pts[0]![0]!, pts[0]![1]! + jitter);
    ctx.closePath();
    ctx.strokeStyle = opts.strokeColor;
    ctx.lineWidth = opts.sw * (0.8 + p * 0.15);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

/* ── SYSTEM SCRIBBLER WRAPPER ── */
interface ScribbleWrapperProps {
  children: ReactNode;
  fill?: string;
  strokeColor?: string;
  passes?: number;
  amp?: number;
  sw?: number;
  seed?: number;
  style?: CSSProperties;
  className?: string;
}

export function ScribbleContainer({
  children, fill, strokeColor = "rgba(30,22,8,0.85)",
  passes = 3, amp = 2.5, sw = 1.0, seed = 101, style, className
}: ScribbleWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: Math.floor(entry.contentRect.width),h: Math.floor(entry.contentRect.height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (canvasRef.current && size.w > 0 && size.h > 0) {
      renderScribbleLayer(canvasRef.current, size.w, size.h, { fill, passes, amp, sw, seed, strokeColor });
    }
  }, [size, fill, passes, amp, sw, seed, strokeColor]);

  return (
    <div ref={divRef} className={className} style={{ position: "relative", ...style }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2, width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

/* ── WOBBLY SESSION DIVIDER ── */
export function ScribbleWobblyDivider({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ width: "100%", height: 16, overflow: "hidden", ...style }}>
      <svg width="100%" height="100%" viewBox="0 0 1200 16" preserveAspectRatio="none">
        <path d="M0,8 Q150,1 300,9 T600,6 T900,11 T1200,7 M0,10 Q150,3 300,11 T600,8 T900,13 T1200,9" 
              stroke="rgba(30,22,8,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}