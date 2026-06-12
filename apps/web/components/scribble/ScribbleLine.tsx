"use client";
import React from "react";

type ScribbleLineVariant = "bold" | "thin" | "dashed" | "double";
type ScribbleLineOrientation = "horizontal" | "vertical";

interface ScribbleLineProps {
  width?: number | string;
  height?: number;
  color?: string;
  strokeWidth?: number;
  variant?: ScribbleLineVariant;
  orientation?: ScribbleLineOrientation;
  className?: string;
  style?: React.CSSProperties;
  seed?: number; // controls the unique wobble pattern
}

/** Generates a unique wavy path based on a seed so every line looks different */
function genWavyPath(
  w: number,
  h: number,
  seed: number,
  orientation: ScribbleLineOrientation
): string {
  const mid = h / 2;
  const segments = 8;
  const step = w / segments;
  // pseudo-random offsets from seed
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233711) * 43758.5453;
    return x - Math.floor(x);
  };
  let d = `M0 ${mid}`;
  for (let i = 0; i < segments; i++) {
    const x1 = i * step + step * 0.25;
    const y1 = mid + (rand(i * 2) - 0.5) * h * 1.6;
    const x2 = i * step + step * 0.75;
    const y2 = mid + (rand(i * 2 + 1) - 0.5) * h * 1.6;
    const ex = (i + 1) * step;
    const ey = mid + (rand(i + 100) - 0.5) * h * 0.6;
    d += ` C${x1} ${y1} ${x2} ${y2} ${ex} ${ey}`;
  }
  return d;
}

export function ScribbleLine({
  width = "100%",
  height = 6,
  color = "rgba(90,74,48,0.3)",
  strokeWidth = 1.8,
  variant = "bold",
  orientation = "horizontal",
  className = "",
  style = {},
  seed = 42,
}: ScribbleLineProps) {
  const numW = typeof width === "number" ? width : 900;
  const path = genWavyPath(numW, height, seed, orientation);

  const strokeDash =
    variant === "dashed" ? "6 5" : variant === "thin" ? "none" : "none";

  return (
    <svg
      viewBox={`0 0 ${numW} ${height}`}
      height={height}
      style={{ width, display: "block", overflow: "visible", ...style }}
      className={className}
      fill="none"
      preserveAspectRatio="none"
    >
      {variant === "double" && (
        <path
          d={genWavyPath(numW, height, seed + 7, orientation)}
          stroke={color}
          strokeWidth={strokeWidth * 0.6}
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          opacity={0.5}
        />
      )}
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={strokeDash}
      />
    </svg>
  );
}