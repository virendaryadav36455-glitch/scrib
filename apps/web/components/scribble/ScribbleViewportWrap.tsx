"use client";
import React, { useId, useState, useEffect, useRef } from "react";

interface ScribbleViewportProps {
  children: React.ReactNode;
}

export function ScribbleViewportWrap({ children }: ScribbleViewportProps) {
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Track the bounding rect of the shrinked container box itself, NOT the browser window
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const w = dimensions.width;
  const h = dimensions.height;

  const noise = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x) - 0.5;
  };

  const generateScratchyLine = (x1: number, y1: number, x2: number, y2: number, seedOffset: number, amplitude: number) => {
    const steps = 12;
    let path = `M ${x1} ${y1}`;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      let lx = x1 + (x2 - x1) * t;
      let ly = y1 + (y2 - y1) * t;
      if (i < steps) {
        lx += noise(seedOffset + i * 13) * amplitude;
        ly += noise(seedOffset + i * 17) * amplitude;
      }
      path += ` L ${lx.toFixed(1)} ${ly.toFixed(1)}`;
    }
    return path;
  };

  const renderScribbleBorder = () => {
    const borderPadding = 14;
    const tY = borderPadding;
    const bY = h - borderPadding;
    const lX = borderPadding;
    const rX = w - borderPadding;
    const overshot = 16;

    let fullPath = "";
    const passes = [
      { seed: 100, amp: 3.5, offset: -1.0 },
      { seed: 200, amp: 2.8, offset: 0.5 },
      { seed: 300, amp: 4.2, offset: -0.5 },
      { seed: 400, amp: 2.0, offset: 1.0 },
      { seed: 500, amp: 3.0, offset: -1.5 },
      { seed: 600, amp: 1.5, offset: 0.0 }
    ];

    passes.forEach((p) => {
      const curLX = lX + p.offset;
      const curRX = rX + p.offset;
      const curTY = tY + p.offset;
      const curBY = bY + p.offset;

      fullPath += " " + generateScratchyLine(curLX - overshot, curTY, curRX + overshot, curTY, p.seed + 1, p.amp);
      fullPath += " " + generateScratchyLine(curRX, curTY - overshot, curRX, curBY + overshot, p.seed + 2, p.amp);
      fullPath += " " + generateScratchyLine(curRX + overshot, curBY, curLX - overshot, curBY, p.seed + 3, p.amp);
      fullPath += " " + generateScratchyLine(curLX, curBY + overshot, curLX, curTY - overshot, p.seed + 4, p.amp);
    });

    return fullPath;
  };

  return (
    <div 
      ref={containerRef}
      id={containerId} 
      style={{ 
        position: "relative", 
        width: "100%",
        maxWidth: "1340px", // Limits desktop width to force left/right side spacing
        height: "calc(100vh - 40px)", // Creates top/bottom spacing
        margin: "20px auto", // Centers the viewport board container panel smoothly
        overflow: "hidden",
        background: "#fdf1df",
        boxShadow: "0px 20px 40px rgba(0,0,0,0.4)" // Drop shadow makes the workspace card stand out
      }}
    >
      {/* ─── GLOBAL OVERLAPPING OVER-DRAWN SVG BORDER FRAME ─── */}
      <svg 
        style={{ 
          position: "absolute", 
          inset: 0, 
          width: "100%", 
          height: "100%", 
          pointerEvents: "none", 
          zIndex: 9999,
          overflow: "visible"
        }}
      >
        <path 
          d={renderScribbleBorder()} 
          stroke="#1c160c" 
          strokeWidth="1.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path 
          d={renderScribbleBorder()} 
          stroke="#2d2416" 
          strokeWidth="0.8" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>

      {/* ─── INNER PROJECT COMPONENT WRAPPER ─── */}
      <div 
        style={{ 
          position: "absolute",
          inset: "24px", 
          width: "calc(100% - 48px)",
          height: "calc(100% - 48px)",
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: "6px"
        }}
      >
        {children}
      </div>
    </div>
  );
}