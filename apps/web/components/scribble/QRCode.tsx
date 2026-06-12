"use client";

// FILE: apps/web/components/scribble/QRCode.tsx
//
// WHY THIS EXISTS:
// The share page previously used api.qrserver.com — an external CDN call on every
// page render. That breaks offline, gets blocked by corporate firewalls, is a
// privacy leak (the QR URL is sent to a third party), and creates a hard dependency.
//
// This component renders the QR code locally onto a <canvas> using the `qrcode`
// npm package (already in package.json). No network call, always works, same style.

import { useEffect, useRef, useState } from "react";

interface ScribbleQRCodeProps {
  value:     string;
  size?:     number;
  color?:    string;
  bg?:       string;
  className?: string;
  style?:    React.CSSProperties;
}

export function ScribbleQRCode({
  value,
  size  = 130,
  color = "#2d2416",
  bg    = "#faf4f0",
  className,
  style,
}: ScribbleQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;
    let cancelled = false;

    async function draw() {
      try {
        // Dynamic import — only loaded client-side, not in SSR
        const QRCode = (await import("qrcode")).default;
        if (cancelled || !canvasRef.current) return;
        await QRCode.toCanvas(canvasRef.current, value, {
          width:  size,
          margin: 1,
          color:  { dark: color, light: bg },
          errorCorrectionLevel: "M",
        });
      } catch (e) {
        if (!cancelled) {
          console.error("[ScribbleQRCode] Failed:", e);
          setError(true);
        }
      }
    }

    void draw();
    return () => { cancelled = true; };
  }, [value, size, color, bg]);

  const wrapStyle: React.CSSProperties = {
    backgroundColor: bg, padding: 8, borderRadius: 8,
    border: "1.2px solid #e8ddd0", display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    boxSizing: "border-box", ...style,
  };

  if (error) {
    // Fallback: show the URL as text inside the same-sized box
    return (
      <div className={className} style={{ ...wrapStyle, width: size, height: size }}>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 11, color, wordBreak: "break-all", textAlign: "center" }}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className={className} style={wrapStyle}>
      <canvas ref={canvasRef} width={size} height={size} style={{ display: "block", imageRendering: "pixelated" }} />
    </div>
  );
}