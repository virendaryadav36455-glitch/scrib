"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Sidebar from "~/components/Sidebar";
import { ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";
import { useFormDetail } from "~/hooks/api/forms";
import { useFormStats } from "~/hooks/api/analytics";

// ─── LOADING SKELETON ────────────────────────────────────────────────────────
function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div style={{ height, backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: 10, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)", animation: "shimmer 1.4s infinite", backgroundSize: "200% 100%" }} />
    </div>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ width: "1420px", height: "100%", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: 10, padding: 16 }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e57373" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      <p style={{ color: "#2d2416", fontWeight: 700, fontSize: 13, margin: 0, fontFamily: "'Nunito', sans-serif" }}>Failed to load analytics</p>
      <p style={{ color: "rgba(45,36,22,0.5)", fontSize: 11, margin: 0, textAlign: "center", fontFamily: "'Nunito', sans-serif" }}>{message}</p>
    </div>
  );
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({
  color = "#7b1fa2",
  width = 45,
  height = 30,
}: {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 45 30"
      fill="none"
      style={{
        opacity: 0.8,
        alignSelf: "flex-end",
        marginBottom: "4px",
      }}
    >
      <path
        d="M2 24 L10 26 L18 14 L26 18 L34 4 L42 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="42"
        cy="12"
        r="2"
        fill={color}
      />
    </svg>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPICard({
  label, value, diffDisplay, up, prevLabel, iconColor, iconBg, iconPath, sparkData, sparkColor, wide
}: {
  label: string; value: string; diffDisplay: string; up: boolean; prevLabel: string;
  iconColor: string; iconBg: string; iconPath: React.ReactNode;
  sparkData: number[]; sparkColor: string; wide?: boolean;
}) {
  return (
    <div style={{
      height: "120px",
      backgroundColor: "#FFFDF8",
      border: "1px solid #e1dbcf",
      borderRadius: "10px",
      padding: "0px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
      ...(wide ? { width: "300px" } : {}),
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{
          marginBottom: "28px",
          width: "40px", height: "40px", borderRadius: "50%",
          backgroundColor: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px dashed ${iconColor}`, flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {iconPath}
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontFamily: "'Nunito', sans-serif" }}>
          <span style={{ fontSize: "16px", fontWeight: 500, fontFamily: "'Caveat', cursive" }}>{label}</span>
          <span style={{ marginBottom: "8px", fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "800", color: "#1a150e", lineHeight: 1.1 }}>{value}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{
              fontSize: "11px", fontFamily: "'Caveat', cursive", fontWeight: "800",
              color: up ? "#2e7d32" : "#ef6c00",
              backgroundColor: up ? "#e8f5e9" : "#fff3e0",
              padding: "1px 6px", borderRadius: "4px",
              border: `1px solid ${up ? "rgba(46,125,50,0.15)" : "rgba(239,108,0,0.15)"}`,
              display: "inline-flex", alignItems: "center", gap: "2px",
            }}>
              {up ? "↑" : "↓"} {diffDisplay}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: "rgba(45,36,22,0.4)", fontWeight: 600 }}>{prevLabel}</span>
        </div>
      </div>
      <Sparkline data={sparkData} color={sparkColor} width={45} height={30} />
    </div>
  );
}

// ─── LINE CHART ───────────────────────────────────────────────────────────────
function LineChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length || data.every(d => d.count === 0)) return (
    <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(45,36,22,0.3)", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>No data available</div>
  );

  const W = 540, H = 130;
  const pL = 32, pR = 12, pT = 18, pB = 26;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = Math.max(...data.map(d => d.count), 1);

  const pts = data.map((d, i) => ({
    x: pL + (i / Math.max(data.length - 1, 1)) * cW,
    y: pT + cH - (d.count / maxV) * cH,
    v: d.count,
    label: d.date,
  }));

  // Build smooth bezier path using control points
  const smoothPath = pts.map((p, i) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1]!;
    const cpX = (prev.x + p.x) / 2;
    return `C${cpX.toFixed(1)},${prev.y.toFixed(1)} ${cpX.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");

  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const areaPath = `${smoothPath} L${last.x.toFixed(1)},${(pT + cH).toFixed(1)} L${first.x.toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  const ticks = [0, Math.round(maxV / 2), maxV].filter((v, i, a) => a.indexOf(v) === i);

  const fmtDate = (d: string) => {
    const parts = d.split("-");
    const m = parseInt(parts[1] ?? "1");
    const day = parseInt(parts[2] ?? "1");
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[m] ?? ""} ${day}`;
  };

  // Show x labels at max 8 evenly spaced points + always show first and last
  const maxLabels = 8;
  const step = Math.max(1, Math.ceil(data.length / maxLabels));
  const labelIndices = new Set<number>();
  for (let i = 0; i < data.length; i += step) labelIndices.add(i);
  labelIndices.add(0);
  labelIndices.add(data.length - 1);

  // Find peak points to annotate with value
  const peakIndices = new Set<number>();
  pts.forEach((p, i) => {
    if (p.v === 0) return;
    const prev = i > 0 ? pts[i-1]!.v : -1;
    const next = i < pts.length - 1 ? pts[i+1]!.v : -1;
    if (p.v >= prev && p.v >= next) peakIndices.add(i);
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#634cc9" stopOpacity="0.18" />
          <stop offset="80%" stopColor="#634cc9" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#634cc9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {ticks.map(v => {
        const ty = pT + cH - (v / maxV) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={ty} x2={W - pR} y2={ty}
              stroke={v === 0 ? "rgba(45,36,22,0.18)" : "rgba(45,36,22,0.05)"}
              strokeWidth={v === 0 ? "1.2" : "0.8"}
              strokeDasharray={v === 0 ? "none" : "4,4"} />
            <text x={pL - 6} y={ty + 4} textAnchor="end" fontSize="9"
              fill="rgba(45,36,22,0.45)" fontFamily="'Nunito', sans-serif" fontWeight="700">{v}</text>
          </g>
        );
      })}
      <line x1={pL - 3} y1={pT + cH} x2={W - pR} y2={pT + cH}
        stroke="rgba(45,36,22,0.2)" strokeWidth="1.2" strokeLinecap="round" />

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Smooth line */}
      <path d={smoothPath} fill="none" stroke="#634cc9" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots at all points */}
      {pts.map((p, i) => (
        p.v > 0 ? (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={peakIndices.has(i) ? 5 : 3.5}
              fill="#634cc9" stroke="white" strokeWidth="1.5"
              style={{ filter: "drop-shadow(0px 1px 2px rgba(99,76,201,0.3))" }} />
            {peakIndices.has(i) && (
              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="10"
                fontWeight="800" fill="#634cc9" fontFamily="'Nunito', sans-serif">{p.v}</text>
            )}
          </g>
        ) : null
      ))}

      {/* X axis labels — only at step intervals */}
      {pts.map((p, i) =>
        labelIndices.has(i) ? (
          <text key={i} x={p.x} y={H - 3} textAnchor="middle" fontSize="8.5"
            fill="rgba(45,36,22,0.5)" fontFamily="'Nunito', sans-serif" fontWeight="700">
            {fmtDate(p.label)}
          </text>
        ) : null
      )}
    </svg>
  );
}

// ─── COMPLETION FUNNEL ────────────────────────────────────────────────────────
function CompletionFunnel({ data, dropOffRate }: { data: { stage: string; count: number }[]; dropOffRate: number }) {
  const stages = data.slice(0, 3);
  const colors = [
    { fill: "#f3e5f5", rim: "#eae0fa" },
    { fill: "#e1f5fe", rim: "#d0edf9" },
    { fill: "#e8f5e9", rim: "#dceddc" },
  ];

  // FIX: was dividing by zero when stages[0].count === 0, producing NaN%
  // Now shows "—" instead of NaN when parent stage is empty
  const conv12 = stages[0] && stages[1] && stages[0].count > 0
    ? Math.round((stages[1].count / stages[0].count) * 100)
    : null;
  const conv23 = stages[1] && stages[2] && stages[1].count > 0
    ? Math.round((stages[2].count / stages[1].count) * 100)
    : null;
  const dropIsHigh = dropOffRate > 40;

  return (
    <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%", height: "210px", marginTop: "5px" }}>
      <svg width="180" height="210" viewBox="0 0 180 210" style={{ overflow: "visible", zIndex: 2 }}>
        {stages[0] && (
          <g>
            <path d="M 10 20 L 170 20 L 146 70 L 34 70 Z" fill={colors[0]!.fill} fillOpacity="0.85" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
            <ellipse cx="90" cy="20" rx="80" ry="10" fill={colors[0]!.rim} stroke="#2d2416" strokeWidth="1.3" />
            <text x="90" y="42" fill="#2d2416" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[0].stage}</text>
            <text x="90" y="58" fill="rgba(45,36,22,0.75)" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[0].count.toLocaleString()}</text>
          </g>
        )}

        {stages[1] && (
          <g transform="translate(0, 4)">
            <path d="M 36 74 L 144 74 L 126 124 L 54 124 Z" fill={colors[1]!.fill} fillOpacity="0.85" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
            <ellipse cx="90" cy="74" rx="54" ry="7" fill={colors[1]!.rim} stroke="#2d2416" strokeWidth="1.3" />
            <text x="90" y="96" fill="#2d2416" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[1].stage}</text>
            <text x="90" y="112" fill="rgba(45,36,22,0.75)" fontSize="13" fontWeight="800" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[1].count.toLocaleString()}</text>
          </g>
        )}

        {stages[2] && (
          <g transform="translate(0, 8)">
            <path d="M 56 128 L 124 128 L 110 178 L 70 178 Z" fill={colors[2]!.fill} fillOpacity="0.85" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
            <ellipse cx="90" cy="128" rx="34" ry="5" fill={colors[2]!.rim} stroke="#2d2416" strokeWidth="1.3" />
            <text x="90" y="150" fill="#2d2416" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[2].stage}</text>
            <text x="90" y="166" fill="rgba(45,36,22,0.75)" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="'Nunito', sans-serif">{stages[2].count.toLocaleString()}</text>
          </g>
        )}

        {conv12 !== null && (
          <g transform="translate(154, 54)">
            <path d="M 0 0 Q 20 18 8 38" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M -2 32 L 8 38 L 17 32" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="24" y="18" fill="#2d2416" fontSize="12" fontWeight="bold" fontFamily="'Nunito', sans-serif">{conv12}%</text>
          </g>
        )}

        {conv23 !== null && (
          <g transform="translate(130, 110)">
            <path d="M 0 0 Q 18 18 6 38" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M -4 32 L 6 38 L 15 32" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <text x="22" y="18" fill="#2d2416" fontSize="12" fontWeight="bold" fontFamily="'Nunito', sans-serif">{conv23}%</text>
          </g>
        )}

        <path d="M 112 188 Q 125 192, 138 186" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 131 183 L 138 186 L 134 193" fill="none" stroke="#2d2416" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div style={{
        position: "absolute", bottom: "6px", right: "-12px",
        width: "82px", height: "82px",
        backgroundColor: dropIsHigh ? "#ffebee" : "#e8f5e9",
        border: `1px solid ${dropIsHigh ? "#ffcdd2" : "#c8e6c9"}`,
        boxShadow: "2px 3px 8px rgba(45,36,22,0.06)",
        transform: "rotate(3deg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "6px", boxSizing: "border-box", zIndex: 5,
      }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, backgroundColor: "#ffca28", clipPath: "polygon(100% 0, 0 100%, 100% 100%)", opacity: 0.15 }} />
        <span style={{ fontSize: "11px", fontWeight: 700, color: dropIsHigh ? "#c62828" : "#2e7d32", fontFamily: "'Nunito', sans-serif", textAlign: "center", lineHeight: 1.1 }}>
          Drop Off
        </span>
        <span style={{ fontSize: "18px", fontWeight: "900", color: dropIsHigh ? "#b71c1c" : "#1b5e20", fontFamily: "'Nunito', sans-serif", marginTop: "2px" }}>
          {dropOffRate}%
        </span>
      </div>
    </div>
  );
}

// ─── TOP TRAFFIC SOURCES ──────────────────────────────────────────────────────
function TrafficSources({ sources }: { sources: { source: string; count: number; percentage: number }[] }) {
  const top = sources[0];
  if (!top) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(45,36,22,0.3)", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>No source data</div>;

  return (
    <div style={{ display: "flex", flex: 1, alignItems: "center", position: "relative", marginTop: "5px" }}>
      <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-5deg)", overflow: "visible" }}>
          <defs>
            <pattern id="pencilScribble" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#5c6bc0" strokeWidth="1.2" opacity="0.4" />
              <line x1="0" y1="5" x2="10" y2="5" stroke="#5c6bc0" strokeWidth="0.8" opacity="0.2" />
            </pattern>
            <clipPath id="circleClip">
              <circle cx="60" cy="60" r="50" />
            </clipPath>
          </defs>
          <circle cx="60" cy="60" r="50" fill="#ede8f9" stroke="#2d2416" strokeWidth="1.3" />
          <rect x="10" y="10" width="100" height="100" fill="url(#pencilScribble)" clipPath="url(#circleClip)" />
          <circle cx="60" cy="60" r="51.8" fill="none" stroke="#2d2416" strokeWidth="0.6" strokeDasharray="35 3" opacity="0.75" />
          <text x="60" y="66" fill="#1a150e" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="'Nunito', sans-serif" style={{ transform: "rotate(5deg)", transformOrigin: "60px 66px" }}>
            {top.percentage}%
          </text>
        </svg>
      </div>

      <div style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "2px", alignSelf: "flex-start", paddingTop: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "bold", color: "#2d2416" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#5c6bc0", border: "1.2px solid #2d2416", position: "relative", display: "inline-block" }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#fff", position: "absolute", top: "2px", left: "2px", opacity: 0.8 }} />
          </div>
          <span>{top.source}</span>
        </div>
        <div style={{ fontSize: "13px", color: "rgba(45,36,22,0.8)", fontWeight: "bold", paddingLeft: "20px", marginTop: "2px" }}>
          {top.percentage}% ({top.count.toLocaleString()})
        </div>
        <div style={{ position: "absolute", bottom: "-15px", right: "10px", width: "140px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="130" height="40" viewBox="0 0 130 40" style={{ overflow: "visible" }}>
            <path d="M -15 32 Q 25 35, 55 18" fill="none" stroke="#2d2416" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
            <g transform="translate(60, 6) rotate(-10) scale(0.85)">
              <path d="M 0 15 L 35 0 L 25 22 L 12 18 Z" fill="#ffffff" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M 0 15 L 25 22" stroke="#2d2416" strokeWidth="1.3" />
              <path d="M 12 18 L 12 25 L 18 20" fill="#e1dbcf" stroke="#2d2416" strokeWidth="1.2" strokeLinejoin="round" />
            </g>
          </svg>
          <div style={{ position: "relative", marginBottom: "30px", width: "max-content", textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(45,36,22,0.75)", lineHeight: 1.2 }}>
              Most users arrived<br />through shared links.
            </span>
            <svg width="115" height="6" viewBox="0 0 115 6" style={{ position: "absolute", bottom: "-5px", left: "50%", transform: "translateX(-50%)" }}>
              <path d="M 2 2 C 30 4, 75 1.5, 113 3 M 12 4 C 45 5, 80 3, 105 4" stroke="#5c6bc0" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DEVICE BREAKDOWN ─────────────────────────────────────────────────────────
function DeviceBreakdown({ breakdown }: { breakdown: { mobile: number; desktop: number; tablet: number; other: number } }) {
  const total = breakdown.mobile + breakdown.desktop + breakdown.tablet + breakdown.other || 1;
  const pct = (n: number) => Math.round((n / total) * 100);

  const devices = [
    {
      label: "Mobile", count: breakdown.mobile, pct: pct(breakdown.mobile),
      icon: (
        <svg width="24" height="38" viewBox="0 0 24 38" fill="none">
          <path d="M4 2 Q12 1.5, 20 2 Q22.5 8, 22 19 Q22.5 30, 20 36 Q12 36.5, 4 36 Q1.5 30, 2 19 Q1.5 8, 4 2 Z" fill="#f3e5f5" fillOpacity="0.7" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M4 5 L20 5 L20 30 L4 30 Z" fill="#ffffff" stroke="#2d2416" strokeWidth="1" />
          <circle cx="12" cy="33" r="1.5" fill="none" stroke="#2d2416" strokeWidth="1" />
        </svg>
      ),
    },
    {
      label: "Desktop", count: breakdown.desktop, pct: pct(breakdown.desktop),
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M3 4 Q18 3, 33 4 Q34.5 12, 34 22 Q18 22.5, 2 22 Q1.5 12, 3 4 Z" fill="#e1f5fe" fillOpacity="0.7" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M5 6 L31 6 L31 19 L5 19 Z" fill="#ffffff" stroke="#2d2416" strokeWidth="1" />
          <path d="M14 22 L12 28 Q18 29, 24 28 L22 22 Z" fill="#e1f5fe" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Tablet", count: breakdown.tablet, pct: pct(breakdown.tablet),
      icon: (
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
          <path d="M3 2 Q14 1.5, 25 2 Q26.5 9, 26 17 Q26.5 25, 25 32 Q14 32.5, 3 32 Q1.5 25, 2 17 Q1.5 9, 3 2 Z" fill="#fff3e0" fillOpacity="0.7" stroke="#2d2416" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M5 4 L23 4 L23 28 L5 28 Z" fill="#ffffff" stroke="#2d2416" strokeWidth="1" />
          <circle cx="14" cy="30" r="1.2" fill="none" stroke="#2d2416" strokeWidth="1" />
        </svg>
      ),
    },
    {
      label: "Other", count: breakdown.other, pct: pct(breakdown.other),
      icon: (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="15" fill="#e8f5e9" fillOpacity="0.7" stroke="#2d2416" strokeWidth="1.3" />
          <circle cx="17" cy="17" r="16.5" fill="none" stroke="#2d2416" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="11" cy="17" r="1.5" fill="#2d2416" />
          <circle cx="17" cy="17" r="1.5" fill="#2d2416" />
          <circle cx="23" cy="17" r="1.5" fill="#2d2416" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "100px", width: "100%" }}>
        {devices.map((d, i) => (
          <React.Fragment key={d.label}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {d.icon}
              </div>
              <span style={{ fontSize: "20px", fontWeight: "900", color: "#1a150e", marginTop: "8px", lineHeight: 1 }}>{d.count}</span>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#2d2416", marginTop: "4px" }}>{d.label}</span>
              <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: "bold", marginTop: "1px" }}>{d.pct}%</span>
            </div>
            {i < devices.length - 1 && <div style={{ width: "1px", height: "70px", backgroundColor: "rgba(45,36,22,0.15)" }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginTop: "16px", border: "1px dashed rgba(45,36,22,0.2)", borderRadius: "8px", padding: "10px 14px", backgroundColor: "rgba(253,246,237,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "12px", color: "#2d2416", margin: 0, fontWeight: 600, maxWidth: "90%", lineHeight: 1.4 }}>
          Analytics collector couldn't identify device types.<br />
          {breakdown.other} visits classified as "Other".
        </p>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(45,36,22,0.6)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    </>
  );
}

interface SketchBarChartProps {
  data: { day: string; count: number }[];
}

function SketchBarChart({ data }: SketchBarChartProps) {
  if (!data || !data.length) return null;

  const maxV = Math.max(...data.map((d) => d.count), 10);
  const w = 400;
  const h = 140;
  const pL = 32;
  const pB = 22;
  const pT = 16;
  const pR = 10;

  const cW = w - pL - pR;
  const cH = h - pB - pT;
  
  const bW = (cW / data.length) * 0.52;
  const toX = (i: number) => pL + ((i + 0.5) / data.length) * cW;
  const toY = (v: number) => pT + cH - (v / maxV) * cH;

  const yTicks = [0, Math.round(maxV / 2), maxV];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <pattern id="barPencilScribble" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#5c6bc0" strokeWidth="1.2" opacity="0.45" />
        </pattern>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pL} y1={toY(v)} x2={w - pR} y2={toY(v)} stroke={v === 0 ? "rgba(45, 36, 22, 0.18)" : "rgba(45, 36, 22, 0.04)"} strokeWidth={v === 0 ? "1.2" : "1"} strokeDasharray={v === 0 ? "none" : "3 3"} />
          <text x={pL - 6} y={toY(v) + 4} textAnchor="end" fontSize="9" fontWeight="bold" fill="rgba(45,36,22,0.5)" fontFamily="'Nunito', sans-serif">{v}</text>
        </g>
      ))}

      <line x1={pL} y1={pT - 4} x2={pL} y2={h - pB + 3} stroke="rgba(45,36,22,0.2)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1={pL - 3} y1={h - pB} x2={w - pR} y2={h - pB} stroke="rgba(45,36,22,0.2)" strokeWidth="1.2" strokeLinecap="round" />

      {data.map((d, i) => {
        const x = toX(i);
        const y = toY(d.count);
        const bh = (h - pB) - y;

        return (
          <g key={i}>
            <text x={x} y={y - 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#5c6bc0" fontFamily="'Nunito', sans-serif">{d.count}</text>
            <rect x={x - bW / 2} y={y} width={bW} height={Math.max(bh, 2)} fill="url(#barPencilScribble)" stroke="#2d2416" strokeWidth="1.3" rx="3" />
            <text x={x} y={h - 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="rgba(45, 36, 22, 0.55)" fontFamily="'Nunito', sans-serif">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
function Insights({ data, prevPeriod, topSources, bestDay, avgMin, avgSec, dropOffRate, completionRate, responsesGrowthPct, viewsGrowthPct }: {
  data: { totalResponses: number; totalViews: number; completionRate: number };
  prevPeriod: { totalResponses: number; totalViews: number; completionRate: number; avgTimeToCompleteMs: number };
  topSources: { source: string; count: number; percentage: number }[];
  bestDay: string;
  avgMin: number; avgSec: number;
  dropOffRate: number;
  completionRate: number;
  responsesGrowthPct: number;
  viewsGrowthPct: number;
}) {
  const topSource = topSources[0];
  const bullets: React.ReactNode[] = [];

  if (completionRate >= 70) {
    bullets.push(<>Your form has a <span style={{ fontWeight: 800, color: "#634cc9" }}>{completionRate}%</span> completion rate — excellent! 🎉</>);
  } else if (completionRate >= 50) {
    bullets.push(<>Your form has a <span style={{ fontWeight: 800, color: "#634cc9" }}>{completionRate}%</span> completion rate — decent, room to grow.</>);
  } else {
    bullets.push(<>Completion rate is low at <span style={{ fontWeight: 800, color: "#ef6c00" }}>{completionRate}%</span>. Consider shortening the form.</>);
  }

  if (responsesGrowthPct > 0) {
    bullets.push(<>Responses are up <span style={{ fontWeight: 800, color: "#2e7d32" }}>↑ {responsesGrowthPct}%</span> vs the previous period.</>);
  } else if (responsesGrowthPct < 0) {
    bullets.push(<>Responses dropped <span style={{ fontWeight: 800, color: "#ef6c00" }}>↓ {Math.abs(responsesGrowthPct)}%</span> vs the previous period.</>);
  } else {
    bullets.push(<>Responses are steady compared to the previous period.</>);
  }

  if (viewsGrowthPct > 0) {
    bullets.push(<>Views are up <span style={{ fontWeight: 800, color: "#0288d1" }}>↑ {viewsGrowthPct}%</span> — your form is reaching more people.</>);
  } else if (viewsGrowthPct < 0) {
    bullets.push(<>Views are down <span style={{ fontWeight: 800, color: "#ef6c00" }}>↓ {Math.abs(viewsGrowthPct)}%</span>. Try sharing the form more widely.</>);
  }

  if (topSource) {
    bullets.push(<>Most responses come through <span style={{ fontWeight: 800 }}>{topSource.source.toLowerCase()}</span> ({topSource.percentage}%).</>);
  }

  bullets.push(<><span style={{ fontWeight: 800 }}>{bestDay}</span> is your highest response day of the week.</>);
  bullets.push(<>Users take about <span style={{ fontWeight: 800, color: "#ef6c00" }}>{avgMin}m {avgSec}s</span> to complete this form.</>);

  if (dropOffRate > 60) {
    bullets.push(<>High drop-off (<span style={{ fontWeight: 800, color: "#b71c1c" }}>{dropOffRate}%</span>). Review long or complex questions.</>);
  } else if (dropOffRate > 40) {
    bullets.push(<>Drop-off rate is <span style={{ fontWeight: 800, color: "#ef6c00" }}>{dropOffRate}%</span>. There's room to improve retention.</>);
  } else {
    bullets.push(<>Low drop-off (<span style={{ fontWeight: 800, color: "#2e7d32" }}>{dropOffRate}%</span>) — users are sticking through. 🎉</>);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ color: "#ef6c00", fontSize: "12px", marginTop: "2px" }}>★</span>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#2d2416", margin: 0, lineHeight: 1.3, textAlign: "left", fontFamily: "'Nunito', sans-serif" }}>{b}</p>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const [timePeriod, setTimePeriod] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [scale, setScale] = useState(0.8);

  // Dynamic window monitor scaling logic mapping to original screen sizes 
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1525; // Original screen width reference baseline
      const currentWidth = window.innerWidth;
      // Calculate dynamic matrix transform against the default 0.8 template design scale
      const calculatedScale = (currentWidth / baseWidth) * 0.8;
      setScale(Math.max(calculatedScale, 0.45)); // Absolute limit containment boundaries
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [dateRange] = useState(() => {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  });

  const dateRangeLabel = useMemo(() => {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(start)} - ${fmt(end)}`;
  }, []);

  const { data: formDetails, isLoading: formLoading } = useFormDetail(formId);
  const { data: analyticsPayload, isLoading: statsLoading, isError, error } = useFormStats(formId, dateRange.startDate, dateRange.endDate);

  const isLoading = formLoading || statsLoading;

  const sparkData = useMemo(
    () => (analyticsPayload?.responsesOverTime ?? []).map((p: { count: number }) => p.count),
    [analyticsPayload]
  );

  const kpiData = useMemo(() => {
    if (!analyticsPayload) return null;
    const d = analyticsPayload;
    const prev = d.previousPeriod;

    // FIX: when both curr and prev are 0 the growth is 0%, not 100%
    // Previously calcPct(0, 0) returned 100 (because prev===0 branch returned 100)
    const calcPct = (curr: number, p: number) => {
      if (curr === 0 && p === 0) return 0;   // no change — nothing to compare
      if (p === 0) return curr > 0 ? 100 : 0; // new data appeared
      return Math.round(((curr - p) / p) * 100);
    };

    const avgMin = Math.floor(d.avgTimeToCompleteMs / 60000);
    const avgSec = Math.floor((d.avgTimeToCompleteMs % 60000) / 1000);
    const prevAvgMin = Math.floor(prev.avgTimeToCompleteMs / 60000);
    const prevAvgSec = Math.floor((prev.avgTimeToCompleteMs % 60000) / 1000);
    const timePct = prev.avgTimeToCompleteMs ? Math.round(((d.avgTimeToCompleteMs - prev.avgTimeToCompleteMs) / prev.avgTimeToCompleteMs) * 100) : 0;

    const respPct = calcPct(d.totalResponses, prev.totalResponses);
    const viewsPct = calcPct(d.totalViews, prev.totalViews);
    const rateDiff = d.completionRate - prev.completionRate;

    return {
      totalResponses: {
        val: d.totalResponses.toString(),
        diffDisplay: `${Math.abs(respPct)}%`,
        up: d.totalResponses >= prev.totalResponses,
        prevLabel: `vs previous period (${prev.totalResponses})`,
      },
      totalViews: {
        val: d.totalViews.toLocaleString(),
        diffDisplay: `${Math.abs(viewsPct)}%`,
        up: d.totalViews >= prev.totalViews,
        prevLabel: `vs previous period (${prev.totalViews})`,
      },
      completionRate: {
        val: `${d.completionRate}%`,
        diffDisplay: rateDiff === 0 ? "0%" : `${Math.abs(rateDiff)}%`,
        up: rateDiff >= 0,
        prevLabel: `vs previous period (${prev.completionRate}%)`,
      },
      totalViewsRaw: d.totalViews,
      totalResponsesRaw: d.totalResponses,
      avgTime: {
        val: `${avgMin}m ${avgSec}s`,
        diffDisplay: `${Math.abs(timePct)}%`,
        up: timePct <= 0,
        prevLabel: `vs previous period (${prevAvgMin}m ${prevAvgSec}s)`,
      },
      respPct,
      viewsPct,
      avgMin,
      avgSec,
    };
  }, [analyticsPayload]);

  const bestDay = useMemo(() => {
    if (!analyticsPayload?.responsesByDayOfWeek?.length) return "Saturday";
    return [...analyticsPayload.responsesByDayOfWeek]
      .sort((a: { count: number }, b: { count: number }) => b.count - a.count)[0]?.day ?? "Saturday";
  }, [analyticsPayload]);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* FIXED BASE ROOT CONTAINER */}
      <div style={{ width: "100vw", height: "100vh", backgroundImage: "url('/analyitcs/analyticsBG.png')", backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat", position: "fixed", top: 0, left: 0, overflow: "hidden", boxSizing: "border-box", fontFamily: "'Nunito', sans-serif" }}>
        
        {/* TRANSFORMS LAYOUT VIEWBOX FRAME (Dynamically Responsive to Viewport Sizes) */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "125vw", height: "125vh", display: "flex", transform: `scale(${scale})`, transformOrigin: "top left", boxSizing: "border-box", overflow: "hidden" }}>

          {/* SIDEBAR */}
          <div style={{ width: "240px", height: "100%", paddingLeft: "65px", paddingTop: "24px", display: "flex", flexDirection: "column", boxSizing: "border-box", flexShrink: 0 }}>
            <Sidebar activeTab="Analytics" />
          </div>

          {/* MAIN FRAME */}
          <div className="a-main" style={{ flex: 1, height: "100%", padding: "24px 50px 24px 160px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>

            {/* ── HEADER ── */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%", marginBottom: "58px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div onClick={() => window.history.back()} style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(45,36,22,0.6)", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                  <ArrowLeft style={{ width: "14px", height: "14px" }} /> Back to Forms
                </div>
                {/* Date range stamp */}
                <div style={{ position: "relative", width: "220px", height: "30px", display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", border: "1px solid rgba(45,36,22,0.15)", borderRadius: "8px", backgroundColor: "#fff", fontSize: "13px", fontWeight: "bold", color: "#2d2416", fontFamily: "'Nunito', sans-serif" }}>
                  <Calendar style={{ width: "14px", height: "14px", color: "rgba(45,36,22,0.4)" }} />
                  {dateRangeLabel}
                  {/* Rope climbing boy */}
                  <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "100%", overflow: "visible" }}>
                    <div style={{ position: "absolute", top: "42px", right: "-120px", width: "370px", height: "250px", pointerEvents: "none", zIndex: 15 }}>
                      <Image src="/analyitcs/boyRop(2).png" alt="Scribble character climbing rope doodle" fill priority style={{ objectFit: "contain", transformOrigin: "top right" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", position: "relative", width: "100%", marginTop: "4px", minHeight: "85px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0, color: "#1a150e", fontFamily: "'Caveat', cursive", letterSpacing: "-0.01em" }}>
                      {formDetails?.title ?? (isLoading ? "Loading..." : "Form Analytics")}
                    </h1>
                  </div>
                  <div style={{ position: "relative", width: "max-content", marginTop: "4px" }}>
                    <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "rgba(45,36,22,0.7)", fontFamily: "'Caveat', cursive" }}>Analytics Overview</h2>
                    <svg width="145" height="8" viewBox="0 0 145 8" fill="none" style={{ position: "absolute", bottom: "-6px", left: 0 }}>
                      <path d="M2 3 C35 1.5, 72 4.5, 143 2 Q90 5.5, 15 6.5" stroke="#634cc9" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
                    </svg>
                  </div>
                </div>
                {/* Center boy */}
                <div className="a-header-boy" style={{ position: "absolute", left: "57%", top: "70%", transform: "translate(-50%, -55%)", width: "360px", height: "450px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <Image src="/analyitcs/Boy.png" alt="Awesome insights! Keep it up!" fill priority style={{ objectFit: "contain" }} />
                </div>
              </div>
            </div>

            {/* ── RENDER CONDITION CONTROLLER BLOCK ── */}
            {isLoading ? (
              <>
                <div className="a-grid-top" style={{ display: "grid", gridTemplateColumns: "repeat(4, 300px)", gap: "38px", marginBottom: "16px" }}>
                  {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} height={120} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "750px 240px 260px", gap: "38px", marginBottom: "16px" }}>
                  {[0, 1, 2].map(i => <SkeletonCard key={i} height={260} />)}
                </div>
              </>
            ) : isError ? (
              <ErrorState message={(error as Error)?.message ?? "Unknown error"} />
            ) : kpiData && analyticsPayload ? (
              // Check if there is truly NO data at all (not just zero views/responses)
              // A form can have device data, day-of-week data, or source data even with 0 tracked views
              (() => {
                const hasAnyData = 
                  kpiData.totalResponsesRaw > 0 ||
                  kpiData.totalViewsRaw > 0 ||
                  (analyticsPayload.responsesOverTime ?? []).length > 0 ||
                  (analyticsPayload.responsesByDayOfWeek ?? []).some((d: { count: number }) => d.count > 0) ||
                  (analyticsPayload.completionFunnel ?? []).some((s: { count: number }) => s.count > 0) ||
                  Object.values(analyticsPayload.deviceBreakdown ?? {}).some((v) => (v as number) > 0) ||
                  (analyticsPayload.topSources ?? []).some((s: { count: number }) => s.count > 0) ||
                  (analyticsPayload.fieldDropOff ?? []).length > 0;

                if (!hasAnyData) return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", border: "2px dashed rgba(45,36,22,0.15)", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.4)", width: "1330px", padding: "40px" }}>
                    <div style={{ width: "120px", height: "120px", position: "relative", marginBottom: "12px", opacity: 0.7 }}>
                      <Image src="/analyitcs/Boy.png" alt="Empty pad mascot doodle" fill style={{ objectFit: "contain" }} />
                    </div>
                    <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "bold", color: "#2d2416", margin: 0 }}>This page is clean ink! 🪶</h3>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", color: "rgba(45,36,22,0.5)", margin: "4px 0 0 0", textAlign: "center" }}>No views or responses tracked yet. Give your form link a share to gather analytics!</p>
                  </div>
                );

                return (
                <>
                <div className="a-grid-top" style={{ display: "grid", gridTemplateColumns: "repeat(4, 300px)", gap: "38px", marginBottom: "16px", width: "100%", boxSizing: "border-box" }}>
                  <KPICard
                    label="Total Responses" value={kpiData.totalResponses.val}
                    diffDisplay={kpiData.totalResponses.diffDisplay} up={kpiData.totalResponses.up}
                    prevLabel={kpiData.totalResponses.prevLabel}
                    iconColor="#7b1fa2" iconBg="#f3e5f5"
                    iconPath={<><path d="M22 13h-4l-3 4H9l-3-4H2" /><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></>}
                    sparkData={sparkData} sparkColor="#7b1fa2"
                  />
                  <KPICard
                    label="Total Views" value={kpiData.totalViews.val}
                    diffDisplay={kpiData.totalViews.diffDisplay} up={kpiData.totalViews.up}
                    prevLabel={kpiData.totalViews.prevLabel}
                    iconColor="#0288d1" iconBg="#e1f5fe"
                    iconPath={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                    sparkData={sparkData} sparkColor="#0288d1"
                  />
                  <KPICard
                    label="Completion Rate" value={kpiData.completionRate.val}
                    diffDisplay={kpiData.completionRate.diffDisplay} up={kpiData.completionRate.up}
                    prevLabel={kpiData.completionRate.prevLabel}
                    iconColor="#2e7d32" iconBg="#e8f5e9"
                    iconPath={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>}
                    sparkData={sparkData} sparkColor="#2e7d32"
                  />
                  <KPICard
                    label="Avg. Time to Complete" value={kpiData.avgTime.val}
                    diffDisplay={kpiData.avgTime.diffDisplay} up={kpiData.avgTime.up}
                    prevLabel={kpiData.avgTime.prevLabel}
                    iconColor="#ef6c00" iconBg="#fff3e0"
                    iconPath={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
                    sparkData={sparkData} sparkColor="#ef6c00"
                    wide
                  />
                </div>

                
                <div className="a-grid-mid" style={{ display: "grid", gridTemplateColumns: "750px 240px 260px", gap: "38px", marginBottom: "16px", width: "100%" }}>
                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "12px", padding: "14px 20px", display: "flex", flexDirection: "column", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#2d2416", margin: 0, fontFamily: "'Nunito', sans-serif" }}>Responses Over Time 🌿</h3>
                      </div>
                      <div style={{ display: "flex", border: "1px solid rgba(45,36,22,0.15)", padding: "3px 4px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.5)", gap: "2px" }}>
                        {(["Daily", "Weekly", "Monthly"] as const).map((tab) => {
                          const active = timePeriod === tab;
                          return (
                            <button key={tab} onClick={() => setTimePeriod(tab)} style={{ padding: "4px 12px", fontSize: "12px", fontWeight: "bold", border: active ? "1px solid rgba(99,76,201,0.15)" : "1px solid transparent", background: active ? "#e1bee7" : "transparent", borderRadius: "6px", cursor: "pointer", color: active ? "#2d2416" : "rgba(45,36,22,0.5)", fontFamily: "'Nunito', sans-serif", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.04)" : "none" }}>
                              {tab}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ flex: 1, minHeight: "150px", position: "relative", marginTop: "6px" }}>
                      <LineChart data={analyticsPayload.responsesOverTime ?? []} />
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "12px", padding: "14px 20px", display: "flex", flexDirection: "column", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", position: "relative", width: "260px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "6px" }}>
                      <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", fontWeight: "bold", color: "#2d2416", margin: 0 }}>Completion Funnel</h3>
                      <span style={{ fontSize: "12px", opacity: 0.6 }}>✦</span>
                    </div>
                    <CompletionFunnel data={analyticsPayload.completionFunnel ?? []} dropOffRate={analyticsPayload.dropOffRate ?? 0} />
                  </div>

                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "12px", padding: "14px 20px", width: "280px", display: "flex", flexDirection: "column", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", position: "relative", fontFamily: "'Caveat', cursive", marginLeft: "60px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#2d2416", margin: "0 0 6px 0" }}>Top Traffic Sources</h3>
                    <TrafficSources sources={analyticsPayload.topSources ?? []} />
                  </div>
                </div>

                
                <div className="a-grid-bot" style={{ display: "grid", gridTemplateColumns: "400px 640px 400px", gap: "18px" }}>
                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "12px", padding: "14px 20px", display: "flex", flexDirection: "column", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", fontFamily: "'Nunito', sans-serif" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1a150e", margin: "0 0 12px 0", textAlign: "left" }}>Device Breakdown</h3>
                    <DeviceBreakdown breakdown={analyticsPayload.deviceBreakdown} />
                  </div>

                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "12px", padding: "14px 20px", display: "flex", flexDirection: "column", boxShadow: "0 2px 4px rgba(0,0,0,0.01)", fontFamily: "'Nunito', sans-serif" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#1a150e", margin: "0 0 12px 0", textAlign: "left" }}>Responses by Day of Week</h3>
                    <SketchBarChart data={analyticsPayload.responsesByDayOfWeek ?? []} />
                  </div>

                  <div style={{ backgroundColor: "#FFFDF8", border: "1px solid #e1dbcf", borderRadius: "4px", padding: "16px 20px", boxShadow: "3px 4px 10px rgba(45,36,22,0.06)", position: "relative", fontFamily: "'Nunito', sans-serif", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ position: "absolute", top: "-10px", left: "20px", width: "55px", height: "18px", backgroundColor: "#b3e5fc", opacity: 0.7, transform: "rotate(-3deg)", borderLeft: "1px dashed rgba(0,0,0,0.1)", borderRight: "1px dashed rgba(0,0,0,0.1)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#2d2416", margin: 0, fontFamily: "'Caveat', cursive" }}>Insights</h3>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                        <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
                      </svg>
                    </div>
                    <Insights
                      data={analyticsPayload}
                      prevPeriod={analyticsPayload.previousPeriod}
                      topSources={analyticsPayload.topSources ?? []}
                      bestDay={bestDay}
                      avgMin={kpiData?.avgMin ?? 0}
                      avgSec={kpiData?.avgSec ?? 0}
                      dropOffRate={analyticsPayload.dropOffRate ?? 0}
                      completionRate={analyticsPayload.completionRate ?? 0}
                      responsesGrowthPct={kpiData?.respPct ?? 0}
                      viewsGrowthPct={kpiData?.viewsPct ?? 0}
                    />
                    <div style={{ position: "absolute", bottom: "8px", right: "12px", opacity: 0.4, fontSize: "12px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
                );
              })()
            ) : null}

          </div>
        </div>
      </div>
    </>
  );
}