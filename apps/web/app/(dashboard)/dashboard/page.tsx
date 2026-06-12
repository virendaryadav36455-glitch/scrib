"use client";

import Image from "next/image";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Sidebar from "~/components/Sidebar";
import { useDashboardSummary } from "~/hooks/api/analytics";
import { useCreateForm, useFormList } from "~/hooks/api/forms";
import { useMe, useLogout } from "~/hooks/api/auth";
import { ScribbleButton } from "~/components/scribble/ScribbleButton";
import { PlusIcon } from "~/components/icons";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface TopForm {
  id: string;
  title: string;
  status: string;
  totalResponses: number;
  totalViews: number;
  publishedAt: string;
}

interface Form {
  id: string;
  title: string;
  status: string;
  totalResponses: number;
  totalViews: number;
  publishedAt: string | null;
  createdAt: string;
  visibility: string;
}

// ─── LOADING ─────────────────────────────────────────────────────────────────
function SketchLoading() {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fdf8f0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="26" stroke="#c4b8a8" strokeWidth="1.5" strokeDasharray="4 3" style={{ animation: "spin 3s linear infinite" }} />
          <circle cx="30" cy="30" r="16" stroke="#9b8fdf" strokeWidth="1.5" strokeDasharray="3 4" style={{ animation: "spinReverse 2s linear infinite" }} />
          <circle cx="30" cy="30" r="4" fill="#9b8fdf" opacity="0.6" />
        </svg>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "20px", color: "#2d2416", opacity: 0.7 }}>Doodling your data...</p>
        <style>{`
          @keyframes spin { from { transform-origin: 30px 30px; transform: rotate(0deg); } to { transform-origin: 30px 30px; transform: rotate(360deg); } }
          @keyframes spinReverse { from { transform-origin: 30px 30px; transform: rotate(0deg); } to { transform-origin: 30px 30px; transform: rotate(-360deg); } }
        `}</style>
      </div>
    </div>
  );
}

// ─── ERROR ────────────────────────────────────────────────────────────────────
function SketchError({ message }: { message: string }) {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fdf8f0" }}>
      <div style={{ position: "relative", border: "1.5px solid #f4c2b0", borderRadius: "12px", padding: "32px 40px", backgroundColor: "#fff9f7", transform: "rotate(-1deg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", maxWidth: "360px", boxShadow: "3px 4px 12px rgba(239,108,0,0.1)" }}>
        <div style={{ position: "absolute", top: "-10px", left: "30px", width: "50px", height: "18px", backgroundColor: "#ffe0cc", opacity: 0.8, transform: "rotate(-2deg)", borderLeft: "1px dashed rgba(0,0,0,0.1)", borderRight: "1px dashed rgba(0,0,0,0.1)" }} />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e64a19" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#2d2416", margin: 0, fontFamily: "'Caveat', cursive" }}>Something scribbled wrong!</h3>
        <p style={{ fontSize: "13px", color: "rgba(45,36,22,0.6)", margin: 0, textAlign: "center", fontFamily: "'Nunito', sans-serif", lineHeight: 1.5 }}>{message}</p>
      </div>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPICard({
  label, sublabel, value, iconSvg, decorationSvg, bg
}: {
  label: string; 
  sublabel: string; 
  value: string; 
  iconSvg: React.ReactNode; 
  decorationSvg?: React.ReactNode; 
  bg: string;
}) {
  return (
    <div style={{
      backgroundColor: bg, 
      border: "1px solid rgba(45,36,22,0.18)", 
      borderRadius: "12px",
      padding: "60px 20px", 
      display: "flex", 
      alignItems: "center",
      gap: "18px",
      position: "relative", 
      overflow: "hidden", 
      height: "105px", 
      flex: 1,
      boxSizing: "border-box",
      boxShadow: "0 2px 4px rgba(45,36,22,0.02)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: "38px", marginRight: "3px" }}>
        {iconSvg}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "rgba(45,36,22,0.7)", fontFamily: "'Nunito', sans-serif", lineHeight: 1.2 }}>
          {label}
        </span>
        <div style={{ fontSize: "28px", fontWeight: "600", color: "#1a150e", fontFamily: "'Nunito', sans-serif", lineHeight: 1.1, margin: "8px 0" }}>
          {value}
        </div>
        <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.45)", fontWeight: "700", fontFamily: "'Nunito', sans-serif", lineHeight: 1.1 }}>
          {sublabel}
        </div>
      </div>
      {decorationSvg && (
        <div style={{ position: "absolute", bottom: "8px", right: "12px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: 0.85 }}>
          {decorationSvg}
        </div>
      )}
    </div>
  );
}

// ─── RESPONSES & VIEWS DUAL LINE CHART ───────────────────────────────────────
// Shows totalResponses (purple) + totalViews (blue) per top form, sorted by publish date
function ResponseGrowthChart({ forms }: { forms: TopForm[] }) {
  const data = useMemo(() => {
    return [...forms]
      .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
      .map(f => ({
        label:     f.title.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim().slice(0, 18) || "Form",
        responses: f.totalResponses,
        views:     f.totalViews,
      }));
  }, [forms]);

  if (!data.length) return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(45,36,22,0.3)", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>
      No data available
    </div>
  );

  const W = 700, H = 240;
  const pL = 6, pR = 25, pT = 30, pB = 65;
  const cH = H - pT - pB, cW = W - pL - pR;

  const maxV = Math.max(...data.map(d => Math.max(d.responses, d.views)), 100);
  const ticks = [0, Math.round(maxV * 0.5), maxV];

  const toX  = (i: number) => pL + (i / Math.max(data.length - 1, 1)) * cW;
  const toY  = (v: number) => pT + cH - (v / maxV) * cH;

  const respPts = data.map((d, i) => ({ x: toX(i), y: toY(d.responses), val: d.responses, label: d.label }));
  const viewPts = data.map((d, i) => ({ x: toX(i), y: toY(d.views),     val: d.views }));

  const mkPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const respPath = mkPath(respPts);
  const viewPath = mkPath(viewPts);

  const lastResp = respPts[respPts.length - 1]!;
  const firstResp = respPts[0]!;
  const areaPath = `${respPath} L${lastResp.x.toFixed(1)},${(pT + cH).toFixed(1)} L${firstResp.x.toFixed(1)},${(pT + cH).toFixed(1)} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="dashboardLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#634cc9" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#634cc9" stopOpacity="0.00" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {ticks.map((v) => {
        const ty = toY(v);
        return (
          <g key={v}>
            <line x1={pL} y1={ty} x2={W - pR} y2={ty} stroke={v === 0 ? "rgba(45,36,22,0.22)" : "rgba(45,36,22,0.05)"} strokeWidth={v === 0 ? "1.5" : "0.8"} strokeDasharray={v === 0 ? "none" : "4,4"} />
            <text x={pL - 10} y={ty + 4} textAnchor="end" fontSize="10" fill="rgba(45,36,22,0.5)" fontFamily="'Nunito', sans-serif" fontWeight="700">{v}</text>
          </g>
        );
      })}
      <line x1={pL} y1={pT - 5} x2={pL} y2={H - pB + 4} stroke="rgba(45,36,22,0.22)" strokeWidth="1.2" />

      {/* Legend */}
      <circle cx={pL + 8} cy={pT - 16} r="4" fill="#634cc9" />
      <text x={pL + 16} y={pT - 12} fontSize="10" fontWeight="700" fill="rgba(45,36,22,0.7)" fontFamily="'Nunito', sans-serif">Responses</text>
      <circle cx={pL + 100} cy={pT - 16} r="4" fill="#0288d1" />
      <text x={pL + 108} y={pT - 12} fontSize="10" fontWeight="700" fill="rgba(45,36,22,0.7)" fontFamily="'Nunito', sans-serif">Views</text>

      {/* Views line (blue, dashed) */}
      <path d={viewPath} fill="none" stroke="#0288d1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" opacity="0.7" />
      {viewPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#0288d1" stroke="white" strokeWidth="1.2" />
      ))}

      {/* Responses area + line (purple) */}
      <path d={areaPath} fill="url(#dashboardLineGrad)" />
      <path d={respPath} fill="none" stroke="#634cc9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {respPts.map((p, i) => (
        <g key={i}>
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#634cc9" fontFamily="'Nunito', sans-serif" fontWeight="800">{p.val}</text>
          <circle cx={p.x} cy={p.y} r="5.5" fill="#634cc9" stroke="#2d2416" strokeWidth="1.2" />
          <circle cx={p.x - 1} cy={p.y - 1} r="1.5" fill="white" opacity="0.85" />
          <foreignObject x={p.x - 55} y={H - pB + 10} width="110" height="50">
            <div style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "rgba(45,36,22,0.65)", fontFamily: "'Nunito', sans-serif", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {p.label}
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

// ─── RESPONSES VS VIEWS PIE (per top form) ───────────────────────────────────
// Shows share of total responses per top form — useful, data-driven, no themes needed
function FormsByTypePie({ forms }: { forms: TopForm[] }) {
  const COLORS  = ["#c4b3ef", "#b3d9f7", "#b7e4c7", "#ffd6a5", "#f7b3b3", "#d4f0f0"];
  const STROKES = ["#9b8fdf",  "#6ab4e8", "#74c99a",  "#f5a623", "#e87777", "#7dcfcf"];

  // Build slices: each top form gets a slice sized by its totalResponses
  const slices = forms.map((f, i) => ({
    name:   f.title.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim().slice(0, 20) || `Form ${i + 1}`,
    count:  f.totalResponses,
    views:  f.totalViews,
    color:  COLORS[i % COLORS.length]!,
    stroke: STROKES[i % STROKES.length]!,
  }));

  const total = slices.reduce((s, c) => s + c.count, 0) || 1;
  const cx = 80, cy = 80, r = 65;
  let accAngle = -90;

  const arcs = slices.map((s) => {
    const angle = (s.count / total) * 360;
    if (angle < 0.5) return null;
    const start = accAngle;
    const end   = accAngle + angle;
    accAngle   += angle;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const sx = cx + r * Math.cos(toRad(start));
    const sy = cy + r * Math.sin(toRad(start));
    const ex = cx + r * Math.cos(toRad(end));
    const ey = cy + r * Math.sin(toRad(end));
    return (
      <path
        key={s.name}
        d={`M ${cx} ${cy} L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} Z`}
        fill={s.color} stroke="#fff" strokeWidth="2"
      />
    );
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="rgba(45,36,22,0.08)" strokeWidth="1.5" strokeDasharray="3 3" />
        {arcs}
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(45,36,22,0.06)" strokeWidth="0.8" />
        {/* Centre label */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="#2d2416" fontFamily="'Nunito', sans-serif">Responses</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="18" fontWeight="900" fill="#634cc9" fontFamily="'Nunito', sans-serif">{total.toLocaleString()}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
        {slices.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#2d2416", fontFamily: "'Nunito', sans-serif" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: s.color, border: `1.5px solid ${s.stroke}`, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>{s.name}</span>
            <span style={{ color: "rgba(45,36,22,0.5)", fontSize: "11px", flexShrink: 0 }}>
              {s.count} resp · {Math.round((s.count / total) * 100)}%
            </span>
          </div>
        ))}
        <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: 700, color: "rgba(45,36,22,0.4)", fontFamily: "'Nunito', sans-serif" }}>
          Top {slices.length} forms by responses
        </div>
      </div>
    </div>
  );
}

// ─── ALL FORMS COMPACT SCROLLABLE TABLE ─────────────────────────────────────────
function AllFormsTable({ forms }: { forms: Form[] }) {
  const [search, setSearch] = useState("");
  const filtered = forms.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ backgroundColor: "#FFFDF9", border: "1.5px solid #e1dbcf", borderRadius: "16px", padding: "16px 20px", fontFamily: "'Nunito', sans-serif", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1a150e", margin: 0 }}>All Forms</h3>
        <div style={{ position: "relative", width: "160px" }}>
          <svg style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(45,36,22,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "5px 8px 5px 26px", border: "1px solid rgba(45,36,22,0.15)", borderRadius: "6px", fontSize: "11px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: "#2d2416", backgroundColor: "rgba(255,255,255,0.7)", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", width: "100%", border: "1px solid rgba(45,36,22,0.06)", borderRadius: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#FFFDF8", zIndex: 10, borderBottom: "1.5px solid rgba(45,36,22,0.1)" }}>
            <tr>
              <th style={{ padding: "6px 8px", color: "rgba(45,36,22,0.5)", fontWeight: 800 }}>Name</th>
              <th style={{ padding: "6px 8px", color: "rgba(45,36,22,0.5)", fontWeight: 800 }}>Resp</th>
              <th style={{ padding: "6px 8px", color: "rgba(45,36,22,0.5)", fontWeight: 800 }}>Views</th>
              <th style={{ padding: "6px 8px", color: "rgba(45,36,22,0.5)", fontWeight: 800 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((form, i) => (
              <tr key={form.id} style={{ borderBottom: "1px solid rgba(45,36,22,0.05)", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(45,36,22,0.01)" }}>
                <td style={{ padding: "8px", fontWeight: 700, color: "#1a150e", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.title}</td>
                <td style={{ padding: "8px", fontWeight: 700 }}>{form.totalResponses}</td>
                <td style={{ padding: "8px", color: "rgba(45,36,22,0.6)" }}>{form.totalViews}</td>
                <td style={{ padding: "8px" }}>
                  <span style={{ padding: "2px 6px", borderRadius: "10px", fontSize: "9px", fontWeight: 800, backgroundColor: form.status === "published" ? "#e8f5e9" : "#f5f5f5", color: form.status === "published" ? "#2e7d32" : "#757575", border: `1px solid ${form.status === "published" ? "rgba(46,125,50,0.15)" : "rgba(0,0,0,0.05)"}` }}>
                    {form.status === "published" ? "Live" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "6px 0 0 0", fontSize: "10px", color: "rgba(45,36,22,0.4)", fontWeight: 600 }}>Total: {filtered.length} entries filtered</p>
    </div>
  );
}

// ─── TOP PERFORMING FORMS ─────────────────────────────────────────────────────
function TopPerformingForms({ forms }: { forms: TopForm[] }) {
  const sorted = [...forms].sort((a, b) => b.totalResponses - a.totalResponses);
  const medals = ["🥇", "🥈", "🥉"];
  const ringColors = ["#f5c842", "#d4d4d4", "#cd7f32"];

  return (
    <div style={{ backgroundColor: "#FFFDF9", border: "1px solid #e1dbcf", borderRadius: "16px", padding: "16px 20px", fontFamily: "'Nunito', sans-serif", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <span style={{ fontSize: "16px" }}>🏆</span>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a150e", margin: 0 }}>Top Performing</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {sorted.map((form, i) => (
          <div key={form.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: i < 3 ? `${ringColors[i]}22` : "rgba(45,36,22,0.05)", border: `1.5px solid ${i < 3 ? ringColors[i] : "rgba(45,36,22,0.2)"}`, fontSize: i < 3 ? "14px" : "11px", fontWeight: 800, color: "#2d2416", flexShrink: 0 }}>
              {i < 3 ? medals[i] : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#1a150e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.title}</div>
              <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: 600 }}>{form.totalResponses} resps · {form.totalViews} views</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECENT ACTIVITY TIMELINE ─────────────────────────────────────────────────
function RecentActivity({ forms }: { forms: Form[] }) {
  const published = [...forms].filter(f => f.publishedAt).sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
  const formatTime = (dateStr: string) => {
    const dt = new Date(dateStr);
    return `${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ backgroundColor: "#FFFDF9", border: "1px solid #e1dbcf", borderRadius: "16px", padding: "16px 20px", fontFamily: "'Nunito', sans-serif", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a150e", margin: 0 }}>Recent Log</h3>
      </div>
      <div style={{ position: "relative", paddingLeft: "14px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        <div style={{ position: "absolute", left: "4px", top: "6px", bottom: "6px", width: "1.5px", backgroundColor: "rgba(124,111,212,0.2)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {published.map((form) => (
            <div key={form.id} style={{ display: "flex", gap: "10px", position: "relative" }}>
              <div style={{ position: "absolute", left: "-13px", top: "4px", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#ede8f9", border: "1px solid #9b8fdf" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "rgba(45,36,22,0.4)" }}>{formatTime(form.publishedAt!)}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#2d2416", maxWidth: "210px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.title} published</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const ScribbleDashboard = () => {

// ─── THEMED ALERT TOAST TYPES ───
type ToastType = "success" | "error" | "info";
interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

  const { data: summary, isLoading: summaryLoading, isError: summaryError, error } = useDashboardSummary();
  const { data: formsData, isLoading: formsLoading, refetch } = useFormList();
  const { data: me } = useMe();
  const logout = useLogout();
  const [scale, setScale] = useState(0.8);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const createForm = useCreateForm();
  // const { data, isLoading,  } = useFormList({ search: search || undefined });

  // Internal structural theme matching toaster utility
  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Dynamic monitor matrix transform monitor system
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1525; // Locked design width mapping baseline
      const currentWidth = window.innerWidth;
      const calculatedScale = (currentWidth / baseWidth) * 0.8;
      setScale(Math.max(calculatedScale, 0.45)); // Absolute clamp bound safe threshold
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stats = useMemo(() => {
    if (!summary) return null;
    const convRate = summary.totalViews > 0 ? ((summary.totalResponses / summary.totalViews) * 100).toFixed(1) : "0.0";
    return {
      totalForms: summary.totalForms,
      totalResponses: summary.totalResponses,
      totalViews: summary.totalViews,
      convRate,
      topForms: summary.topForms ?? [],
    };
  }, [summary]);

  const forms = useMemo<Form[]>(() => {
    if (!formsData?.pages?.length) return [];
    return formsData.pages.flatMap((page: any) => page.forms ?? []);
  }, [formsData]);

  // ─── MUTATION ACTION DRIVERS ───
  const handleCreateForm = () => {
    createForm.mutate(
      { title: "Untitled Form", visibility: "public" },
      {
        onSuccess: (newForm) => {
          showToast(`"${newForm?.title || 'Form'}" scribbled successfully onto workspace!`);
          refetch();
        },
        onError: (err: any) => showToast(err?.message || "Failed to create dynamic board.", "error")
      }
    );
  };

  if (summaryLoading || formsLoading) return <SketchLoading />;
if (summaryError || !stats)
  return (
    <SketchError
      message={error?.message ?? "Failed to load dashboard. Try reloading?"}
    />
  );

  return (
    <div style={{
      width: "100vw", height: "100vh",
      backgroundImage: "url('/dashboard/BG.png')", 
      backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat",
      position: "fixed", top: 0, left: 0, overflow: "hidden", boxSizing: "border-box"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(45,36,22,0.15); border-radius: 4px; }
      `}} />

      {/* ── DYNAMICALLY SCALED VIEWBOX GRAPHIC PLANE WRAPPER ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "125vw", height: "125vh",
        display: "flex", transform: `scale(${scale})`, transformOrigin: "top left",
        boxSizing: "border-box", overflow: "hidden"
      }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: "240px", height: "100%", paddingLeft: "65px", paddingTop: "24px", display: "flex", flexDirection: "column", boxSizing: "border-box", flexShrink: 0 }}>
          <Sidebar activeTab="Dashboard" />
        </div>

        {/* ── MAIN CONTENT (FIXED FRAME WINDOW) ── */}
        <div style={{ flex: 1, height: "100%", padding: "40px 60px 40px 160px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflowX: "hidden", overflowY: "hidden" }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", marginTop: "20px", width: "100%" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#1a150e", margin: 0, fontFamily: "'Caveat', cursive", letterSpacing: "-0.01em" }}>
                Welcome back, {me?.fullName?.split(" ")[0] ?? me?.email?.split("@")[0] ?? "there"}! 👋
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(45,36,22,0.55)", margin: "4px 0 0 0", fontWeight: 700 }}>
                Here&apos;s what&apos;s happening with your forms today.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Create new form button */}
              <ScribbleButton
                  onClick={handleCreateForm}
                  disabled={createForm.isPending}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                    borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", backgroundColor: "#c7b9ff",
                    color: "#1a150e", fontSize: "18px", fontWeight: "bold", cursor: "pointer",
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.15)",
                    width : "186px",height:"40px"
                  }}
                >
                  <PlusIcon style={{ width: "16px", height: "16px",paddingRight:"12px" }} /> {createForm.isPending ? "Doodling..." : "Create New Form"}
              </ScribbleButton>

              {/* User avatar + logout dropdown */}
              <div ref={avatarRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setAvatarOpen(v => !v)}
                  style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    border: "2px solid #2d2416", backgroundColor: "#ede8f9",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: "16px", color: "#634cc9",
                    boxShadow: "2px 2px 0px #2d2416", flexShrink: 0, outline: "none",
                    position: "relative", overflow: "hidden",
                  }}
                  title={me?.fullName ?? me?.email ?? "Account"}
                >
                  {/* Initials avatar */}
                  {(me?.fullName ?? me?.email ?? "U").slice(0, 1).toUpperCase()}
                  {/* Dashed outline ring */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 42 42" fill="none">
                    <circle cx="21" cy="21" r="20" stroke="#9b8fdf" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                  </svg>
                </button>

                {/* Dropdown */}
                {avatarOpen && (
                  <div style={{
                    position: "absolute", top: "52px", right: 0,
                    width: "220px", backgroundColor: "#fffdf9",
                    border: "1.5px solid #2d2416", borderRadius: "12px",
                    boxShadow: "4px 5px 0px rgba(45,36,22,0.12)",
                    zIndex: 100, overflow: "hidden",
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                    {/* User info block */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(45,36,22,0.08)" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#1a150e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {me?.fullName ?? "User"}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                        {me?.email ?? ""}
                      </div>
                    </div>

                    {/* Logout button */}
                    <button
                      onClick={() => { setAvatarOpen(false); logout.mutate(); }}
                      disabled={logout.isPending}
                      style={{
                        width: "100%", padding: "12px 16px",
                        background: "none", border: "none", cursor: logout.isPending ? "wait" : "pointer",
                        display: "flex", alignItems: "center", gap: "10px",
                        fontSize: "13px", fontWeight: 700, color: "#c62828",
                        fontFamily: "'Nunito', sans-serif", textAlign: "left",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(198,40,40,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Logout icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {logout.isPending ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── KPI CARDS ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 300px)", gap: "28px", marginBottom: "22px", position: "relative" }}>
            
            <KPICard
              label="Total Forms"
              sublabel="Published forms"
              value={stats.totalForms.toString()}
              bg="#fdf3dc"
              iconSvg={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c07a00" strokeWidth="1.3" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              }
              decorationSvg={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c07a00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-8deg)" }}><rect x="3" y="6" width="14" height="15" rx="1.5" /><path d="M7 3h14v15" /></svg>
              }
            />

            <KPICard
              label="Total Responses"
              sublabel="All time responses"
              value={stats.totalResponses.toLocaleString()}
              bg="#ede8f9"
              iconSvg={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7c6fd4" strokeWidth="1.3" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              }
              decorationSvg={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(124, 111, 212)" strokeWidth="1.2"><path d="M2 18 Q 8 22, 12 14 T 22 10" strokeDasharray="2,2" /><path d="M18 6h5v4h-5z" fill="none" /></svg>
              }
            />

            {/* CARD 3: WITH ABSOLUTE CHARACTER OVERLAY POSITIONING ANCHOR */}
            <div style={{ position: "relative", display: "flex", flex: 1 }}>
              <div style={{ position: "absolute", bottom: "-59px", left: "50%", transform: "translateX(-50%)", width: "440px", height: "500px", zIndex: 20, pointerEvents: "none" }}>
                <Image src="/dashboard/boy.png" alt="Scribbler character sleeping" fill priority style={{ objectFit: "contain" }} />
              </div>
              <KPICard
                label="Total Views"
                sublabel="All time views"
                value={stats.totalViews.toLocaleString()}
                bg="#dff0ff"
                iconSvg={
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1a73c7" strokeWidth="1.3" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
                decorationSvg={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(26, 115, 199)" strokeWidth="1.3"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2" /></svg>
                }
              />
            </div>

            <KPICard
              label="Conversion Rate"
              sublabel="Responses / Views"
              value={`${stats.convRate}%`}
              bg="#e8f5e9"
              iconSvg={
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.3" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8"/><path d="M8 8h8v8"/></svg>
              }
              decorationSvg={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(46, 125, 50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 19 Q 12 18, 18 6" /><polyline points="13 6 18 6 18 11" /></svg>
              }
            />
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "900px 470px", gap: "38px", marginBottom: "24px", width: "1258px", boxSizing: "border-box" }}>
            
            <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(45,36,22,0.18)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", height: "300px", boxSizing: "border-box" }}>
              <div style={{ backgroundColor: "#FFFDF9", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🌿</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1a150e", margin: 0, fontFamily: "'Nunito', sans-serif" }}>Responses &amp; Views — Top Forms</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 200, fontFamily: "'Nunito', sans-serif", color: "rgba(45,36,22,0.6)", backgroundColor: "#fff", border: "1px solid rgba(45,36,22,0.15)", borderRadius: "6px", cursor: "pointer" }}>
                  <span>By Responses</span>
                </div>
              </div>
              <div style={{ flex: 1, width: "750px", position: "relative", marginLeft: "60px" }}>
                <ResponseGrowthChart forms={stats.topForms} />
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(45,36,22,0.18)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", height: "290px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <span style={{ fontSize: "16px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-pie-chart" viewBox="0 0 16 16">
  <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.793zm1 0V7.5h6.482A7 7 0 0 0 8.5 1.018M14.982 8.5H8.207l-4.79 4.79A7 7 0 0 0 14.982 8.5M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"/>
</svg>
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a150e", margin: 0,fontFamily: "'Nunito', sans-serif" }}>Response Share by Form</h3>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FormsByTypePie forms={stats.topForms} />
              </div>
            </div>

          </div>

          {/* ── BOTTOM SECTIONS LAYOUT GRID ── */}
          <div style={{ display: "grid", gridTemplateColumns: "620px 300px 300px", gap: "28px", width: "1248px", boxSizing: "border-box", marginTop: "4px" }}>
            <div style={{ backgroundColor: "#FFFDF9", display: "flex", flexDirection: "column", height: "290px" }}>
              <AllFormsTable forms={forms} />
            </div>
            <div style={{ backgroundColor: "#FFFDF9", display: "flex", flexDirection: "column", height: "290px" }}>
              <TopPerformingForms forms={stats.topForms} />
            </div>
            <div style={{ backgroundColor: "#FFFDF9", display: "flex", flexDirection: "column", height: "290px" }}>
              <RecentActivity forms={forms} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScribbleDashboard;