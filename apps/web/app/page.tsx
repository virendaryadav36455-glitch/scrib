"use client";

import React, { useState } from "react";
import { Lock, Moon, Play, Check, Paintbrush, BarChart2, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Trapezoid } from "recharts";
import { redirect } from "next/dist/server/api-utils";

// ── CUSTOM THEMED HERO ACTION BUTTON WITH INTEGRATED DOUBLE BORDER MOCKUP ──
function TexturedHeroButton({ style,children, onClick }: {style? :React.CSSProperties; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "'Caveat', cursive, sans-serif",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#ffffff",
        cursor: "pointer",
        border: "none",
        background: "transparent",
        position: "relative",
        padding: "4px 16px",
        userSelect: "none",
        transition: "transform 0.1s ease",
        outline: "none",
        ...style
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible" }} viewBox="0 0 180 50" preserveAspectRatio="none" fill="none">
        <rect x="2" y="2" width="176" height="46" rx="10" fill="#7c4dff" />
        <path d="M8 4 Q90 2 172 4 Q176 5 176 12 Q178 25 176 38 Q176 44 172 44 Q90 46 8 44 Q4 44 4 38 Q2 25 4 12 Q4 5 8 4 Z" stroke="#2d2416" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ position: "relative", zIndex: 1, textShadow: "1px 1px 0px rgba(0,0,0,0.15)" }}>{children}</span>
    </button>
  );
}

// ── CUSTOM SVG ICONS ──
const IconGraph = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="2" y="14" width="4" height="10" rx="1" fill="#2d86c7" stroke="#1a5f9a" strokeWidth="0.8"/>
    <rect x="8" y="9" width="4" height="15" rx="1" fill="#2d86c7" stroke="#1a5f9a" strokeWidth="0.8"/>
    <rect x="14" y="5" width="4" height="19" rx="1" fill="#2d86c7" stroke="#1a5f9a" strokeWidth="0.8"/>
    <rect x="20" y="11" width="4" height="13" rx="1" fill="#2d86c7" stroke="#1a5f9a" strokeWidth="0.8"/>
    <line x1="1" y1="24.5" x2="25" y2="24.5" stroke="#1a5f9a" strokeWidth="1.2" strokeLinecap="round"/>
    <polyline points="4,13 10,8 16,4 22,10" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="4" cy="13" r="1.5" fill="#ff6b6b"/>
    <circle cx="10" cy="8" r="1.5" fill="#ff6b6b"/>
    <circle cx="16" cy="4" r="1.5" fill="#ff6b6b"/>
    <circle cx="22" cy="10" r="1.5" fill="#ff6b6b"/>
  </svg>
);

const IconExport = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="3" y="3" width="16" height="20" rx="2" fill="#e8f5e9" stroke="#2d2416" strokeWidth="1"/>
    <line x1="7" y1="9" x2="15" y2="9" stroke="#2d2416" strokeWidth="1" strokeLinecap="round"/>
    <line x1="7" y1="13" x2="13" y2="13" stroke="#2d2416" strokeWidth="1" strokeLinecap="round"/>
    <line x1="7" y1="17" x2="11" y2="17" stroke="#2d2416" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="20" cy="18" r="5" fill="#4caf50" stroke="#2d7d32" strokeWidth="0.8"/>
    <line x1="20" y1="15" x2="20" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="17.5,19 20,21.5 22.5,19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconPaperPlane = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M3 13 L23 4 L16 22 L12 14 Z" fill="#7c4dff" stroke="#5a3db5" strokeWidth="0.8" strokeLinejoin="round"/>
    <path d="M12 14 L23 4" stroke="#5a3db5" strokeWidth="0.8"/>
    <path d="M12 14 L14 20" stroke="#5a3db5" strokeWidth="0.8" strokeLinecap="round"/>
  </svg>
);

const IconHeart = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M13 21 C13 21 4 15 4 9 C4 6.2 6.2 4 9 4 C10.6 4 12 4.8 13 6 C14 4.8 15.4 4 17 4 C19.8 4 22 6.2 22 9 C22 15 13 21 13 21Z" fill="#ff8fab" stroke="#c2185b" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M9 8 C8 8.5 7 10 7 11" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const IconPeopleGroup = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="9" cy="8" r="3.5" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.9"/>
    <circle cx="17" cy="8" r="3.5" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.9"/>
    <path d="M3 22 C3 17 6 15 9 15 C12 15 15 17 15 22" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.9" strokeLinecap="round"/>
    <path d="M13 17 C14 16 15.5 15 17 15 C20 15 23 17 23 22" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.9" strokeLinecap="round"/>
  </svg>
);

const IconShieldCheck = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M13 3 L22 7 L22 13 C22 18 18 22 13 23 C8 22 4 18 4 13 L4 7 Z" fill="#dbe7c4" stroke="#2d2416" strokeWidth="1" strokeLinejoin="round"/>
    <polyline points="9 13 11 15 17 10" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconLetter = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="3" y="6" width="20" height="14" rx="2" fill="#ede8f9" stroke="#2d2416" strokeWidth="1"/>
    <path d="M3 8 L13 14 L23 8" stroke="#7c4dff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconLock = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect x="6" y="12" width="14" height="10" rx="2" fill="#f5f5f5" stroke="#2d2416" strokeWidth="1"/>
    <path d="M9 12 L9 8 C9 5.8 11 4 13 4 C15 4 17 5.8 17 8 L17 12" stroke="#2d2416" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <circle cx="13" cy="17" r="1.5" fill="#7c4dff"/>
  </svg>
);

const IconZap = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path d="M15 3 L7 15 L13 15 L11 23 L19 11 L13 11 Z" fill="#fff3e0" stroke="#ef6c00" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

// ── FORM BUILDER UI (like Image 2) ──
const FormBuilderUI = () => (
  <div style={{
    width: "100%",
    backgroundColor: "#fffdf9",
    border: "1.5px solid #2d2416",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "4px 5px 0px rgba(45,36,22,0.08)",
    fontFamily: "'Nunito', sans-serif",
    display: "flex",
    flexDirection: "column",
    height:"560px"
  }}>
    {/* Title Bar */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      borderBottom: "1.2px solid rgba(45,36,22,0.15)",
      backgroundColor: "#fdf8f0"
    }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef5350", border: "1px solid #c62828" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ffca28", border: "1px solid #f9a825" }} />
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#66bb6a", border: "1px solid #388e3c" }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {[/*{"Builder", "Analytics", "Responses", "Explore", "Themes"}*/].map((t) => (
          <span key={t} style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "13px",
            fontWeight: "bold",
            padding: "3px 10px",
            borderRadius: "6px",
            backgroundColor: t === "Builder" ? "#7c4dff" : "transparent",
            color: t === "Builder" ? "#fff" : "#5a4a30",
            cursor: "pointer"
          }}>{t}</span>
        ))}
      </div>
      <div style={{ width: "60px" }} />
    </div>

    {/* Three-column layout */}
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 200px", height: "100%" }}>
      
      {/* LEFT: Add Fields */}
      <div style={{
        borderRight: "1px solid rgba(45,36,22,0.12)",
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        overflowY: "auto",
        backgroundColor: "#fffdf9"
      }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", fontWeight: 900, color: "#2d2416", marginBottom: "4px" }}>Add Fields</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "rgba(45,36,22,0.5)", marginBottom: "6px" }}>Drag and drop to add</div>
        {[
          { label: "Short Text", icon: "T" },
          { label: "Long Text", icon: "¶" },
          { label: "Email", icon: "✉" },
          { label: "Number", icon: "#" },
          { label: "Date", icon: "▦" },
          { label: "Single Select", icon: "◉" },
          { label: "Multi Select", icon: "☑" },
          { label: "Checkbox", icon: "✓" },
          { label: "Rating", icon: "★" },
          { label: "File Upload", icon: "↑" },
          { label: "Phone", icon: "☎" },
          { label: "--- Divider", icon: "—" },
        ].map(({ label, icon }) => (
          <div key={label} style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 8px",
            border: "1px solid rgba(45,36,22,0.15)",
            borderRadius: "6px",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
            color: "#2d2416",
            transition: "background 0.1s"
          }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", color: "#7c4dff", width: "14px", textAlign: "center" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* CENTER: Form canvas */}
      <div style={{
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
        backgroundColor: "#faf6f0",
        backgroundImage: "radial-gradient(circle, rgba(45,36,22,0.06) 1px, transparent 1px)",
        backgroundSize: "18px 18px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "20px", fontWeight: 900, color: "#2d2416" }}>Anime Convention Registration</div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L10 2 12 4 4 12H2Z" stroke="#7c4dff" strokeWidth="1.2" fill="#ede8f9"/></svg>
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.55)", marginTop: "-6px" }}>Tell us about yourself! Let's make this event unforgettable.</div>
        
        {/* Tape decoration */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 36, height: 10, backgroundColor: "rgba(124,77,255,0.25)", borderRadius: 3, border: "1px solid rgba(124,77,255,0.3)", zIndex: 2 }} />
        </div>

        {/* Form fields */}
        {[
          { num: 1, label: "What's your name?", type: "Short Text", placeholder: "Type your answer here..." },
          { num: 2, label: "Your email address", type: "Email", placeholder: "you@example.com" },
          { num: 3, label: "Which days will you attend?", type: "Multi Select", placeholder: null },
          { num: 4, label: "How excited are you for the event?", type: "Rating", placeholder: null },
          { num: 5, label: "Any special requests or comments?", type: "Long Text", placeholder: "Write your thoughts here..." },
        ].map((field) => (
          <div key={field.num} style={{
            backgroundColor: "#fff",
            border: "1px solid rgba(45,36,22,0.15)",
            borderRadius: "10px",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#ede8f9", border: "1px solid rgba(124,77,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat', cursive", fontSize: "11px", fontWeight: 900, color: "#7c4dff" }}>{field.num}</span>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>{field.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "rgba(45,36,22,0.4)" }}>{field.type}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="rgba(45,36,22,0.2)" strokeWidth="1"/><path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="rgba(45,36,22,0.3)" strokeWidth="0.8" strokeLinecap="round"/></svg>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2 L7 12 M2 7 L12 7" stroke="#ef5350" strokeWidth="1.5" strokeLinecap="round" transform="rotate(45 7 7)"/></svg>
              </div>
            </div>
            {field.type === "Multi Select" ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Day 1", "Day 2", "Day 3"].map(d => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: "4px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.6)" }}>
                    <div style={{ width: 12, height: 12, border: "1px solid rgba(45,36,22,0.3)", borderRadius: 2 }} />
                    {d}
                  </div>
                ))}
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "#7c4dff", cursor: "pointer" }}>+ Add option</span>
              </div>
            ) : field.type === "Rating" ? (
              <div style={{ display: "flex", gap: "4px" }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2 L10.5 7H15.5L11.5 10L13 15L9 12L5 15L6.5 10L2.5(7H7.5Z" stroke="rgba(45,36,22,0.3)" strokeWidth="1" fill="none"/></svg>
                ))}
              </div>
            ) : field.type === "Long Text" ? (
              <div style={{ height: "44px", border: "1px solid rgba(45,36,22,0.12)", borderRadius: 6, padding: "6px 10px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.3)", backgroundColor: "#fafafa" }}>{field.placeholder}</div>
            ) : (
              <div style={{ border: "1px solid rgba(45,36,22,0.12)", borderRadius: 6, padding: "6px 10px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.3)", backgroundColor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {field.placeholder}
                {field.type === "Email" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1" stroke="rgba(45,36,22,0.25)" strokeWidth="0.8"/><path d="M1 4L6 7L11 4" stroke="rgba(45,36,22,0.25)" strokeWidth="0.8"/></svg>}
                {field.type === "Short Text" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="9" cy="6" r="3" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/><path d="M8 5.5 L9 7 L10 5.5" stroke="rgba(45,36,22,0.25)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
            )}
          </div>
        ))}

        {/* Add field button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", border: "1.5px dashed rgba(124,77,255,0.35)", borderRadius: "10px", cursor: "pointer", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#7c4dff" strokeWidth="1"/><path d="M7 4 L7 10 M4 7 L10 7" stroke="#7c4dff" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 700, color: "#7c4dff" }}>Add new field here</span>
        </div>
      </div>

      {/* RIGHT: Field Settings */}
      <div style={{
        borderLeft: "1px solid rgba(45,36,22,0.12)",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto",
        backgroundColor: "#fffdf9"
      }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "14px", fontWeight: 900, color: "#2d2416" }}>Field Settings</div>
        
        <div style={{ padding: "8px 10px", backgroundColor: "#ede8f9", borderRadius: "8px", border: "1px solid rgba(124,77,255,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", color: "#7c4dff" }}>T</span>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 800, color: "#2d2416" }}>What's your name?</span>
          </div>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "#7c4dff", fontWeight: 700 }}>Short Text</span>
        </div>

        {[
          { label: "Field Label", value: "What's your name?" },
          { label: "Placeholder", value: "Type your answer here..." },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", fontWeight: 800, color: "#2d2416" }}>{label}</label>
            <div style={{ padding: "5px 8px", border: "1px solid rgba(45,36,22,0.2)", borderRadius: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.7)", backgroundColor: "#fff" }}>{value}</div>
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {["Required", "Show on summary", "Limit character"].map((opt, i) => (
            <div key={opt} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: i < 2 ? "#7c4dff" : "transparent", border: i < 2 ? "none" : "1.5px solid rgba(45,36,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i < 2 && <svg width="8" height="8" viewBox="0 0 8 8"><polyline points="1.5 4 3 5.5 6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2d2416" }}>{opt}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <label style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", fontWeight: 800, color: "#2d2416" }}>Validation</label>
          <div style={{ padding: "5px 8px", border: "1px solid rgba(45,36,22,0.2)", borderRadius: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.7)", backgroundColor: "#fff", display: "flex", justifyContent: "space-between" }}>
            No validation <span>▾</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <label style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", fontWeight: 800, color: "#2d2416" }}>Help Text</label>
          <div style={{ padding: "5px 8px", border: "1px solid rgba(45,36,22,0.2)", borderRadius: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "11px", color: "rgba(45,36,22,0.35)", backgroundColor: "#fff", minHeight: "32px" }}>Help text will appear below field</div>
        </div>

        {/* Tip box */}
        <div style={{ padding: "8px 10px", backgroundColor: "#fce5a4", borderRadius: "8px", border: "1px solid rgba(45,36,22,0.15)", position: "relative" }}>
          <div style={{ position: "absolute", top: -6, right: 8, width: 28, height: 10, backgroundColor: "rgba(124,77,255,0.3)", borderRadius: 3, border: "1px solid rgba(124,77,255,0.4)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#ef6c00" opacity="0.2"/><circle cx="6" cy="4.5" r="1" fill="#ef6c00"/><line x1="6" y1="6.5" x2="6" y2="9" stroke="#ef6c00" strokeWidth="1" strokeLinecap="round"/></svg>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 900, color: "#2d2416" }}>Tip</span>
          </div>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "#2d2416", lineHeight: 1.4 }}>Hover over a field in the form to edit it quickly!</span>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1 C5.5 3 2.5 4 3 6.5 C3.5 8.5 6 10 6 10 C6 10 8.5 8.5 9 6.5 C9.5 4 6.5 3 6 1Z" fill="#c2185b" stroke="#880e4f" strokeWidth="0.5"/></svg>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 16px",
      borderTop: "1px solid rgba(45,36,22,0.12)",
      backgroundColor: "#fdf8f0"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "rgba(45,36,22,0.5)" }}>Form ID: frm_7xJ2kL9</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="7" height="7" rx="1" stroke="rgba(45,36,22,0.3)" strokeWidth="0.8"/><rect x="3" y="3" width="7" height="7" rx="1" stroke="rgba(45,36,22,0.3)" strokeWidth="0.8" fill="#fffdf9"/></svg>
      </div>
      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px", color: "rgba(45,36,22,0.4)" }}>Last edited 2 mins ago by you</span>
      <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", backgroundColor: "#fff", border: "1px solid #2d2416", borderRadius: "6px", boxShadow: "1.5px 1.5px 0 #2d2416", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2d2416" }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 8 L4 5 L6.5 7.5 L9 2" stroke="#7c4dff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        Save as Template
      </button>
    </div>
  </div>
);

export default function ScribbleLandingPage() {
  const [isTrickedOpen, setIsTrickedOpen] = useState(false);
  // NEW STATE: Control visibility of the hackathon video demo announcement
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="custom-scrollbar" style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", overflowX: "hidden", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>

      {/* ── 2. OPEN SPACIOUS GLOBAL CONTENT LAYER ── */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "15px 65px 40px 45px", boxSizing: "border-box" }}>
        
        {/* ── HEADER STRIP ── */}
        <div style={{ 
          width: "100%", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexShrink: 0,
          padding: "0 10px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", position: "relative", cursor: "pointer", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: 900, color: "#2d2416" }}>
                ScribbleForms
              </span>
              <span style={{ fontSize: "16px", display: "inline-flex", alignItems: "center" }}>💜</span>
            </div>
            <div style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", height: "8px" }}>
              <svg width="100%" height="100%" viewBox="0 0 120 6" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                <path d="M 2 3 C 30 1, 60 4, 90 2 C 105 1, 115 3, 118 2.5 M 115 3 C 85 4.5, 55 2, 25 3.5 C 15 4, 8 3, 3 3.5" stroke="#7c4dff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div style={{ fontFamily: "'Caveat', cursive", display: "flex", alignItems: "center", gap: "24px", fontSize: "14px", fontWeight: 700, color: "#5a4a30" }}>
            {/* {["Features", "Templates", "Explore", "Pricing", "Developers"].map((link) => (
              <span key={link} style={{ cursor: "pointer", opacity: 0.85, transition: "opacity 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => e.currentTarget.style.opacity = "0.85"}>{link}</span>
            ))} */}
            {/* <span style={{ cursor: "pointer", opacity: 0.85, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              Resources <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", transform: "scaleY(0.65)", display: "inline-block", marginTop: "2px" }}>▼</span>
            </span> */}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 700 }}>
            <TexturedHeroButton onClick={() => window.location.href = '/login'}>Log in</TexturedHeroButton>
            <Moon 
              size={18} 
              style={{ cursor: "pointer", color: "#5a4a30", transition: "transform 0.1s ease" }} 
              onClick={() => setIsTrickedOpen(true)} 
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
          </div>
        </div>

        {/* ── BROAD CENTER SPAN HERO ZONE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "45% 140%", gap: "20px", alignItems: "center", width: "100%", flex: 1, minHeight: 0 }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "26px", paddingLeft: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: "62px", fontWeight: 900, color: "#2d2416", margin: 0, lineHeight: "1.1" }}>
                One form.
              </h1>
              <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: "42px", fontWeight: 900, color: "#2d2416", margin: 0, lineHeight: "1.9" }}>
                Infinite{"    "}
                <span style={{ position: "relative", display: "inline-block", padding: "0 8px" }}>
                  <span style={{ color: "#7c4dff" }}>personalities.</span>
                  <svg style={{ position: "absolute", bottom: "-10px", left: 0, width: "100%", height: "12px" }} viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
                    <path d="M2 6 C 50 3, 100 8, 198 5 M 195 6 C 140 8, 80 5, 5 7" stroke="#7c4dff" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
            </div>

            <div style={{ fontFamily: "'Caveat', cursive", display: "flex", flexDirection: "column", gap: "14px", fontSize: "18px", fontWeight: 500, color: "#2d2416" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ede8f9" }}>
                  <Paintbrush size={16} color="#7c4dff" />
                </div>
                <span>Beautiful themes.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e1f5fe" }}>
                  <BarChart2 size={16} color="#0288d1" />
                </div>
                <span>Smart insights.</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fff3e0" }}>
                  <Zap size={16} color="#ef6c00" />
                </div>
                <span>Hang on.</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "10px" }}>
              <TexturedHeroButton onClick={() => window.location.href = '/login'} style={{ padding: "15px 20px" }}>Start Building Free</TexturedHeroButton>
              {/* FIXED: Added modal state trigger click handler */}
              <button  
                onClick={() => setIsDemoModalOpen(true)}
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", background: "#ffd6db", borderRadius: "8px", padding: "12px 28px", fontFamily: "'Nunito', sans-serif", fontSize: "15px", fontWeight: 700, color: "#2d2416", border: "none", transition: "transform 0.1s ease" }} 
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"} 
                onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
              >
                <Play size={14} fill="#2d2416" /> Watch Demo
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "5px", fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 700, color: "rgba(45, 36, 22, 0.6)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Check size={16} strokeWidth={3} color="#2e7d32" /> No credit card</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Check size={16} strokeWidth={3} color="#2e7d32" /> Free forever</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Check size={16} strokeWidth={3} color="#2e7d32" /> Setup in 30 seconds</span>
            </div>
          </div>

          <div style={{ width: "100%", height: "100%", minHeight: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <img 
                src="/landing/boy.png" 
                alt="Central layout scene illustration with boy and responsive cards" 
                style={{ width: "1980px", height: "710px", objectFit: "contain", display: "block", marginLeft: "-700px", marginTop: "28px" ,zIndex:-1,pointerEvents: "none"}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. 👇 NEW SOCIAL PROOF METRICS SECTION (VISIBLE AFTER SCROLLING DOWN) ── */}
      <div 
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "60px 40px 110px 40px",
          boxSizing: "border-box",
          zIndex: 1,
          position: "relative"
        }}
      >
        <div 
          style={{ 
            position: "relative", 
            width: "980px", 
            height: "105px", 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
            padding: "0 60px"
          }}
        >
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1180 125" preserveAspectRatio="none" fill="none">
            <path d="M14 6 C400 3.5, 800 4.5, 1166 6 C1174 8, 1176 16, 1174 62 C1175 105, 1173 118, 1164 120 C800 122, 400 121, 14 119 C5 118, 4 105, 6 62 C4 16, 6 8, 14 6 Z" stroke="#2d2416" strokeWidth="1.4" strokeOpacity="0.25" />
          </svg>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative", zIndex: 1, width: "30%" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#dfcbf2", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1px 2px 0px rgba(45,36,22,0.15)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="14" height="16" rx="2" />
                <line x1="7" y1="9" x2="13" y2="9" />
                <line x1="7" y1="13" x2="11" y2="13" />
                <circle cx="7" cy="17" r="0.5" fill="#2d2416" />
                <path d="M16 14l5-5-2-2-5 5v2h2z" fill="#fffdf9" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "6px" }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", fontWeight: "500", color: "#2d2416", lineHeight: "1" }}>2M+</span>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "600", color: "#2d2416", marginTop: "6px" }}>Forms Created</span>
            </div>
          </div>

          <div style={{ height: "60px", width: "1px", borderLeft: "1px dashed rgba(45,36,22,0.25)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative", zIndex: 1, width: "30%", paddingLeft: "20px", marginLeft: "6px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#fce5a4", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1px 2px 0px rgba(45,36,22,0.15)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", fontWeight: "500", color: "#2d2416", lineHeight: "1" }}>150k+</span>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "600", color: "#2d2416", marginTop: "2px" }}>Happy Users</span>
            </div>
          </div>

          <div style={{ height: "60px", width: "1px", borderLeft: "1px dashed rgba(45,36,22,0.25)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "20px", position: "relative", zIndex: 1, width: "30%", paddingLeft: "20px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#dbe7c4", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1px 2px 0px rgba(45,36,22,0.15)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "6px" }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "30px", fontWeight: "500", color: "#2d2416", lineHeight: "1" }}>99.9%</span>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "600", color: "#2d2416", marginTop: "2px" }}>Uptime & Reliability</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT WRAPPER ── */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "60px", padding: "0 60px 80px 60px", boxSizing: "border-box" }}>

        {/* ── SCROLL SECTION 2: EVERYTHING YOU NEED IN ONE WORKSPACE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "48px", width: "100%", alignItems: "start" }}>
          
          {/* Left Feature Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#2d2416" }}>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "42px", fontWeight: 900, margin: 0, lineHeight: "1.15" }}>
              Everything you need,<br />in one simple workspace
              {/* Leaf SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: "inline-block", marginLeft: "6px", verticalAlign: "middle" }}>
                <path d="M14 4 C10 4, 5 8, 5 14 C5 14 9 23 14 24 C19 23 23 19 23 14 C23 8 18 4 14 4Z" fill="#a5d6a7" stroke="#388e3c" strokeWidth="1"/>
                <path d="M14 4 L14 24" stroke="#388e3c" strokeWidth="1" strokeLinecap="round"/>
                <path d="M14 14 C11 11 7 10 5 14" stroke="#388e3c" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
              </svg>
            </h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 600, color: "rgba(45,36,22,0.7)", lineHeight: "1.6", margin: 0 }}>
              Create, customize and share forms that get responses. All the tools you need, all in one place.
            </p>
            
            {/* Paper plane deco */}
            <div style={{ position: "relative", height: "40px" }}>
              <svg width="50" height="40" viewBox="0 0 50 40" fill="none" style={{ position: "absolute", right: 20, top: 0 }}>
                <path d="M5 30 L45 5 L35 38 L25 22 Z" fill="#ede8f9" stroke="#7c4dff" strokeWidth="1" strokeLinejoin="round"/>
                <path d="M25 22 L45 5" stroke="#7c4dff" strokeWidth="0.8"/>
                <path d="M25 22 L27 32" stroke="#7c4dff" strokeWidth="0.8" strokeLinecap="round"/>
                {/* Dotted trail */}
                <circle cx="10" cy="28" r="1" fill="#7c4dff" opacity="0.4"/>
                <circle cx="6" cy="32" r="0.8" fill="#7c4dff" opacity="0.3"/>
                <circle cx="3" cy="36" r="0.6" fill="#7c4dff" opacity="0.2"/>
              </svg>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
              {["Drag & drop builder", "10+ field types", "Conditional logic", "Custom themes", "Real-time preview"].map((feat) => (
                <div key={feat} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2e7d32" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#e8f5e9"/><polyline points="4 8 7 11 12 5" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                  <span style={{ color: "#2d2416" }}>{feat}</span>
                </div>
              ))}
            </div>

            <TexturedHeroButton onClick={() => window.location.href = '/login'} style={{ width: "fit-content", padding: "12px 36px", marginTop: "10px", fontSize: "16px" }}>
              Try the Builder
              {/* Arrow */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </TexturedHeroButton>
          </div>

          {/* Right: Form Builder UI */}
          <FormBuilderUI />
        </div>

        {/* ── FEATURE CARDS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "14px", width: "100%" }}>
          {[
            { title: "Collect Responses", desc: "Share your form and start collecting responses instantly.", bg: "#f5f2ff", Icon: IconLetter },
            { title: "Analyze Insights", desc: "Beautiful analytics to help you understand your audience.", bg: "#edf7ff", Icon: IconGraph },
            { title: "Export Data", desc: "Export responses in CSV or JSON format anytime.", bg: "#f1fbf0", Icon: IconExport },
            { title: "Automate Workflows", desc: "Send emails, trigger webhooks and automate everything.", bg: "#fffaf0", Icon: IconZap },
            { title: "Share Anywhere", desc: "Embed, share link or add to your website.", bg: "#fff2f5", Icon: IconPaperPlane },
            { title: "Secure & Private", desc: "Password protect forms and keep data 100% safe.", bg: "#f5f5f5", Icon: IconLock }
          ].map((card, idx) => (
            <div key={idx} style={{ position: "relative", backgroundColor: card.bg, padding: "18px 14px", height: "170px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "8px", borderRadius: "12px", transition: "transform 0.15s", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 180 170" preserveAspectRatio="none" fill="none">
                <rect x="1" y="1" width="178" height="168" rx="12" stroke="#2d2416" strokeWidth="1.2" strokeOpacity="0.2" />
              </svg>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#fff", border: "1px solid rgba(45,36,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1.5px 1.5px 0px rgba(45,36,22,0.12)", position: "relative", zIndex: 1 }}>
                <card.Icon />
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: 800, color: "#2d2416", position: "relative", zIndex: 1, marginTop: "4px" }}>{card.title}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(45,36,22,0.65)", lineHeight: "14px", position: "relative", zIndex: 1 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION 4: JOIN CREATORS FOOTER BANNER ── */}
        <div style={{ position: "relative", width: "100%", minHeight: "150px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box", padding: "30px 50px" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1320 150" preserveAspectRatio="none" fill="none">
            <path d="M4 6 C400 3, 900 4, 1316 3 C1318.5 25, 1317.5 75, 1315.5 144 C950 145.5, 450 144.5, 5 145 C1.5 100, 2 50, 4 6 Z" stroke="#2d2416" strokeWidth="1.2" fill="#fffdf9" strokeOpacity="0.3" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "380px", position: "relative", zIndex: 1 }}>
            {/* Sparkle SVGs */}
            <div style={{ position: "absolute", top: -10, left: -20 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1 L9 6 L14 7 L9 8 L8 13 L7 8 L2 7 L7 6 Z" fill="#7c4dff" opacity="0.3"/></svg>
            </div>
            <div style={{ position: "absolute", top: 20, right: 20 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1 L7 4.5 L10.5 5.5 L7 6.5 L6 10 L5 6.5 L1.5 5.5 L5 4.5 Z" fill="#ef6c00" opacity="0.3"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "30px", fontWeight: 900, color: "#2d2416", margin: 0, lineHeight: "1.1" }}>
              Join thousands of creators and <span style={{ color: "#7c4dff" }}>growing</span> communities
            </h3>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 700, color: "rgba(45,36,22,0.55)", margin: 0, lineHeight: "1.4" }}>
              From startups to educators, creators to non-profits — everyone loves building with ScribbleForms.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "40px", position: "relative", zIndex: 1 }}>
            {[
              { val: "150K+", sub: "Active Users", Icon: () => (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 6 C13 4 11 3 9 4 C7 5 7 8 9 9 C11 10 13 9 14 6Z" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/>
                  <path d="M14 6 L14 10 L11 9" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                  <rect x="10" y="10" width="8" height="10" rx="1" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/>
                  <path d="M10 14 L14 12 L18 14" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                </svg>
              )},
              { val: "2M+", sub: "Forms Created", Icon: () => (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3 L26 9 L20 26 L8 26 L2 9 Z" fill="#c8e6c9" stroke="#2d2416" strokeWidth="0.8"/>
                  <circle cx="14" cy="12" r="3" fill="#ede8f9" stroke="#7c4dff" strokeWidth="0.8"/>
                  <path d="M14 3 L14 6" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                  <path d="M24 8 L22 10" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                  <path d="M24 20 L22 18" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                </svg>
              )},
              { val: "50K+", sub: "Communities", Icon: () => (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="10" cy="10" r="4" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/>
                  <circle cx="18" cy="10" r="4" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/>
                  <circle cx="14" cy="18" r="4" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/>
                  <path d="M6 22 C6 19 8 17 10 17" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                  <path d="M22 22 C22 19 20 17 18 17" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                </svg>
              )},
              { val: "99.9%", sub: "Uptime", Icon: () => (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 3 C8 5 4 10 4 16 C4 21 8 25 14 25 C20 25 24 21 24 16 C24 10 20 5 14 3Z" fill="#ffd6e7" stroke="#c2185b" strokeWidth="0.8"/>
                  <path d="M14 7 L14 16" stroke="#c2185b" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14" cy="16" r="1.5" fill="#c2185b"/>
                </svg>
              )},
            ].map((metric, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minWidth: "90px" }}>
                <div style={{ marginBottom: "6px" }}><metric.Icon /></div>
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "22px", fontWeight: 900, color: "#2d2416", lineHeight: "1" }}>{metric.val}</span>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", fontWeight: 700, color: "rgba(45,36,22,0.6)", marginTop: "3px" }}>{metric.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCROLL SECTION 5: COMMUNITY FORMS & BEAUTIFUL THEMES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%" }}>
          
          {/* LEFT: EXPLORE COMMUNITY FORMS */}
          <div style={{ position: "relative", backgroundColor: "#fffdf9", border: "1.5px solid rgba(45,36,22,0.18)", borderRadius: "16px", padding: "28px 24px 24px", boxSizing: "border-box", boxShadow: "4px 5px 0px rgba(45,36,22,0.06)", display: "flex", flexDirection: "column", gap: "18px", overflow: "hidden" }}>
            {/* Corner decorations */}
            <div style={{ position: "absolute", top: -2, right: -2 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M40 0 L40 40 L0 0Z" fill="#ede8f9" opacity="0.4"/>
              </svg>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 900, margin: 0, color: "#2d2416" }}>Explore community forms</h3>
                {/* Leaf */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 3 C8 3 4 6 4 11 C4 15 7 18 11 19 C15 18 18 15 18 11 C18 6 14 3 11 3Z" fill="#a5d6a7" stroke="#388e3c" strokeWidth="0.8"/>
                  <line x1="11" y1="3" x2="11" y2="19" stroke="#388e3c" strokeWidth="0.7"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(45,36,22,0.6)", margin: 0 }}>Discover amazing forms created by the community.</p>
            </div>

            {/* Explore Forms button */}
            <button style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", backgroundColor: "#7c4dff", color: "white", fontFamily: "'Caveat', cursive", fontSize: "16px", fontWeight: 700, border: "1.2px solid #5a3db5", borderRadius: "8px", boxShadow: "2px 2px 0 #5a3db5", cursor: "pointer" }}>
              Explore Forms
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Paper plane decoration */}
            <div style={{ position: "absolute", bottom: 24, left: 24 }}>
              <svg width="36" height="30" viewBox="0 0 36 30" fill="none">
                <path d="M2 22 L32 4 L25 28 L16 16 Z" fill="none" stroke="rgba(45,36,22,0.15)" strokeWidth="1" strokeLinejoin="round"/>
                <circle cx="4" cy="24" r="1" fill="rgba(45,36,22,0.1)"/>
                <circle cx="2" cy="28" r="0.8" fill="rgba(45,36,22,0.08)"/>
              </svg>
            </div>

            {/* Polaroid Cards */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", paddingTop: "8px" }}>
              {[
                { title: "Anime Fan Survey", resp: "341 responses", rating: "4.8", color: "#ede8f9", iconBg: "#c9b8f0",
                  Icon: () => <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="14" r="8" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8"/><path d="M13 12 C13 10 15 8 18 8 C21 8 23 10 23 12 C23 16 18 20 18 20 C18 20 13 16 13 12Z" fill="#ffb3c1" stroke="#c2185b" strokeWidth="0.5" opacity="0.6"/><circle cx="15" cy="13" r="1.5" fill="#2d2416"/><circle cx="21" cy="13" r="1.5" fill="#2d2416"/><path d="M15.5 17 Q18 19 20.5 17" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/></svg>,
                  rot: "-3deg" },
                { title: "Startup Onboarding", resp: "363 responses", rating: "4.9", color: "#e8f5e9", iconBg: "#a5d6a7",
                  Icon: () => <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M18 4 L28 14 L22 32 L14 32 L8 14 Z" fill="#c8e6c9" stroke="#2d2416" strokeWidth="0.8"/><circle cx="18" cy="16" r="4" fill="#fff" stroke="#7c4dff" strokeWidth="0.8"/><path d="M18 4 L18 8" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/><path d="M26 12 L23 14" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/></svg>,
                  rot: "1.5deg" },
                { title: "Gaming Tournament", resp: "277 responses", rating: "4.7", color: "#fff3e0", iconBg: "#ffcc80",
                  Icon: () => <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="6" y="10" width="24" height="16" rx="4" fill="#fff3e0" stroke="#2d2416" strokeWidth="0.8"/><line x1="18" y1="10" x2="18" y2="26" stroke="#2d2416" strokeWidth="0.6" opacity="0.3"/><circle cx="12" cy="18" r="3" fill="#ef5350" opacity="0.6"/><circle cx="24" cy="18" r="2" fill="#2d2416" opacity="0.4"/><line x1="22" y1="18" x2="26" y2="18" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/><line x1="24" y1="16" x2="24" y2="20" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/></svg>,
                  rot: "-1.5deg" },
              ].map((card, i) => (
                <div key={i} style={{
                  width: "118px",
                  backgroundColor: "#fff",
                  border: "1.2px solid rgba(45,36,22,0.15)",
                  borderRadius: "10px",
                  padding: "12px 10px 10px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transform: `rotate(${card.rot})`,
                  boxShadow: "2px 3px 0px rgba(45,36,22,0.08)",
                  gap: "6px"
                }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "8px", backgroundColor: card.color, border: `1px solid rgba(45,36,22,0.1)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <card.Icon />
                  </div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 800, color: "#2d2416", lineHeight: "1.2" }}>{card.title}</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "9px", color: "rgba(45,36,22,0.5)", fontWeight: 700 }}>{card.resp}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1 L6 4 L9 4 L6.5 6 L7.5 9 L5 7 L2.5 9 L3.5 6 L1 4 L4 4 Z" fill="#ef6c00"/></svg>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "bold", color: "#ef6c00" }}>{card.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: BEAUTIFUL THEMES */}
          <div style={{ position: "relative", backgroundColor: "#fef9ee", border: "1.5px solid rgba(45,36,22,0.18)", borderRadius: "16px", padding: "28px 24px 24px", boxSizing: "border-box", boxShadow: "4px 5px 0px rgba(45,36,22,0.06)", display: "flex", flexDirection: "column", gap: "18px", overflow: "hidden" }}>
            {/* Clip decoration top right */}
            <div style={{ position: "absolute", top: -4, right: 30 }}>
              <svg width="18" height="32" viewBox="0 0 18 32" fill="none">
                <rect x="4" y="0" width="10" height="28" rx="5" stroke="#888" strokeWidth="1.5" fill="rgba(180,180,180,0.2)"/>
                <rect x="6" y="3" width="6" height="20" rx="3" stroke="#aaa" strokeWidth="1" fill="rgba(220,220,220,0.2)"/>
              </svg>
            </div>
            {/* Folded corner top left */}
            <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: "28px solid rgba(45,36,22,0.06)", borderRight: "28px solid transparent" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 900, margin: 0, color: "#2d2416" }}>Beautiful themes for every vibe</h3>
                {/* Pencil SVG */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="4" y="4" width="14" height="14" rx="2" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.8" transform="rotate(45 11 11)"/>
                  <line x1="8" y1="14" x2="14" y2="8" stroke="#2d2416" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(45,36,22,0.6)", margin: 0 }}>Choose from stunning themes or create your own.</p>
            </div>

            <button style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "6px", padding: "9px 20px", backgroundColor: "#fef9ee", color: "#2d2416", fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 700, border: "1.2px solid #2d2416", borderRadius: "8px", boxShadow: "2px 2px 0 #2d2416", cursor: "pointer" }}>
              Browse Themes
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            
            <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", paddingTop: "56px" }}>
              {[
                { name: "Cyber Punk", bg: "#0d0d1a", accent: "#ff007f",
                  preview: () => <><rect x="4" y="6" width="32" height="4" rx="1" fill="#ff007f" opacity="0.8"/><rect x="4" y="13" width="22" height="3" rx="1" fill="#00e5ff" opacity="0.6"/><rect x="4" y="19" width="16" height="3" rx="1" fill="#7c4dff" opacity="0.5"/><line x1="0" y1="28" x2="40" y2="28" stroke="#ff007f" strokeWidth="0.5" opacity="0.3"/></> },
                { name: "Notebook", bg: "#fafaf5", accent: "#c8b8a0",
                  preview: () => <><line x1="2" y1="8" x2="38" y2="8" stroke="#d4c9b5" strokeWidth="0.8"/><line x1="2" y1="14" x2="38" y2="14" stroke="#d4c9b5" strokeWidth="0.8"/><line x1="2" y1="20" x2="38" y2="20" stroke="#d4c9b5" strokeWidth="0.8"/><line x1="2" y1="26" x2="38" y2="26" stroke="#d4c9b5" strokeWidth="0.8"/><line x1="8" y1="0" x2="8" y2="32" stroke="#ffb3c1" strokeWidth="0.8" opacity="0.5"/><rect x="12" y="6" width="20" height="3" rx="1" fill="#7c4dff" opacity="0.3"/><rect x="12" y="12" width="14" height="2" rx="1" fill="rgba(45,36,22,0.2)"/></> },
                { name: "Pastel", bg: "#f5f0ff", accent: "#b095e6",
                  preview: () => <><rect x="4" y="4" width="32" height="6" rx="3" fill="#c9b8f0" opacity="0.5"/><rect x="4" y="13" width="24" height="4" rx="2" fill="#ffb3c1" opacity="0.4"/><rect x="4" y="20" width="18" height="4" rx="2" fill="#a5d6a7" opacity="0.4"/><circle cx="6" cy="7" r="2" fill="#7c4dff" opacity="0.4"/></> },
                { name: "Minimal", bg: "#fafafa", accent: "#e0e0e0",
                  preview: () => <><rect x="4" y="6" width="28" height="2" rx="1" fill="rgba(45,36,22,0.4)"/><rect x="4" y="12" width="20" height="1.5" rx="0.75" fill="rgba(45,36,22,0.2)"/><rect x="4" y="17" width="14" height="1.5" rx="0.75" fill="rgba(45,36,22,0.15)"/><rect x="4" y="22" width="32" height="5" rx="2" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8" fill="none"/></> },
                { name: "Sketch", bg: "#fffdf9", accent: "#2d2416",
                  preview: () => <><path d="M4 8 C10 7 25 9 36 8" stroke="#2d2416" strokeWidth="1.2" strokeLinecap="round" fill="none"/><path d="M4 14 C12 13 20 15 30 14" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/><path d="M4 20 C8 19 18 21 26 20" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/><rect x="3" y="24" width="34" height="6" rx="2" stroke="#7c4dff" strokeWidth="1" fill="rgba(124,77,255,0.1)"/></> },
              ].map((theme, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <div style={{ width: "68px", height: "50px", backgroundColor: theme.bg, border: `1.5px solid ${theme.accent}`, borderRadius: "8px", boxSizing: "border-box", overflow: "hidden" }}>
                    <svg width="68" height="50" viewBox="0 0 40 32" fill="none">
                      {theme.preview()}
                    </svg>
                  </div>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 700, color: "#5a4a30" }}>{theme.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SCROLL SECTION 6: AUTOMATION PIPELINE ── */}
        <div style={{ position: "relative", width: "100%", backgroundColor: "#f5f0ff", border: "1.5px solid rgba(45,36,22,0.15)", borderRadius: "16px", padding: "28px 36px", boxSizing: "border-box", boxShadow: "4px 5px 0px rgba(45,36,22,0.06)", display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden" }}>
          {/* Background sparkles */}
          <div style={{ position: "absolute", top: 16, right: 40 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2 L11.5 8 L17 9.5 L11.5 11 L10 17 L8.5 11 L3 9.5 L8.5 8 Z" fill="#7c4dff" opacity="0.15"/>
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 20, right: 20 }}>
            <svg width="50" height="40" viewBox="0 0 50 40" fill="none">
              <path d="M5 35 L45 8 L38 42 L28 26 Z" fill="none" stroke="rgba(45,36,22,0.08)" strokeWidth="1.2" strokeLinejoin="round"/>
              <circle cx="8" cy="37" r="1.2" fill="rgba(45,36,22,0.08)"/>
              <circle cx="5" cy="42" r="1" fill="rgba(45,36,22,0.06)"/>
            </svg>
          </div>
          <div style={{ position: "absolute", top: 16, left: 36 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" fill="none" stroke="rgba(124,77,255,0.15)" strokeWidth="1"/>
              <path d="M14 4 L14 10 M14 18 L14 24 M4 14 L10 14 M18 14 L24 14" stroke="rgba(124,77,255,0.2)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Gear SVG */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="5" fill="#ede8f9" stroke="#7c4dff" strokeWidth="1.2"/>
                <circle cx="14" cy="14" r="2" fill="#7c4dff"/>
                <path d="M14 3 L14 7 M14 21 L14 25 M3 14 L7 14 M21 14 L25 14 M6.1 6.1 L8.9 8.9 M19.1 19.1 L21.9 21.9 M21.9 6.1 L19.1 8.9 M8.9 19.1 L6.1 21.9" stroke="#7c4dff" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "30px", fontWeight: 900, margin: 0, color: "#2d2416" }}>Automation that works for you</h3>
            </div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 600, color: "rgba(45,36,22,0.6)", margin: 0, paddingLeft: "38px" }}>We handle the boring stuff so you can focus on what matters.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <TexturedHeroButton style={{ padding: "10px 24px", fontSize: "15px", flexShrink: 0 }}>
              Explore Automations
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7 L12 7 M8 3 L12 7 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </TexturedHeroButton>

            {/* Pipeline steps */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, justifyContent: "space-around" }}>
              {[
                { label: "Form Submitted", Icon: () => (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 18 L3 8 C3 7 3.8 6 5 6 L14 6 L21 11 L21 18 C21 19.1 20 20 19 20 L5 20 C3.9 20 3 19.1 3 18Z" fill="#e8f5e9" stroke="#2d2416" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M14 6 L14 12 L21 12" fill="#c8e6c9" stroke="#2d2416" strokeWidth="0.8"/>
                    <line x1="7" y1="14" x2="14" y2="14" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                    <line x1="7" y1="17" x2="11" y2="17" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round"/>
                  </svg>
                )},
                { label: "Process Data", Icon: () => (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="3" fill="#e8f5e9" stroke="#2d2416" strokeWidth="1"/>
                    <path d="M8 8 L12 4 L16 8" stroke="#4caf50" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M8 16 L12 20 L16 16" stroke="#4caf50" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="9" cy="12" r="1.5" fill="#7c4dff" opacity="0.6"/>
                    <circle cx="12" cy="12" r="1.5" fill="#7c4dff"/>
                    <circle cx="15" cy="12" r="1.5" fill="#7c4dff" opacity="0.6"/>
                  </svg>
                )},
                { label: "Send Email", Icon: () => (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="13" rx="2" fill="#e3f2fd" stroke="#2d2416" strokeWidth="1"/>
                    <path d="M3 8 L12 14 L21 8" stroke="#2196f3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )},
                { label: "Trigger Webhook", Icon: () => (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#fff3e0" stroke="#2d2416" strokeWidth="1"/>
                    <circle cx="8" cy="12" r="2" fill="#ef6c00"/>
                    <circle cx="16" cy="12" r="2" fill="#ef6c00"/>
                    <path d="M10 12 C10 9 14 9 14 12" stroke="#ef6c00" strokeWidth="1" strokeLinecap="round" fill="none"/>
                    <path d="M7 8 C4 8 3 11 4 13" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                    <path d="M17 8 C20 8 21 11 20 13" stroke="#2d2416" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                  </svg>
                )},
                { label: "Update Analytics", Icon: () => (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#f3e5f5" stroke="#2d2416" strokeWidth="1"/>
                    <rect x="7" y="14" width="2.5" height="5" rx="0.5" fill="#7c4dff"/>
                    <rect x="10.8" y="11" width="2.5" height="8" rx="0.5" fill="#7c4dff" opacity="0.7"/>
                    <rect x="14.5" y="8" width="2.5" height="11" rx="0.5" fill="#7c4dff" opacity="0.5"/>
                    <polyline points="8 13 11.5 10 15 7" stroke="#ef6c00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )},
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "12px", border: "1.2px solid rgba(45,36,22,0.15)", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "2px 2px 0px rgba(45,36,22,0.08)" }}>
                      <step.Icon />
                    </div>
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontWeight: 700, color: "#2d2416", maxWidth: "70px", lineHeight: "1.2" }}>{step.label}</span>
                  </div>
                  {idx < 4 && (
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                      <path d="M2 10 C6 9, 10 11, 14 10 C18 9, 20 10, 22 10" stroke="rgba(45,36,22,0.25)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                      <path d="M18 6 L22 10 L18 14" stroke="rgba(45,36,22,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── SCROLL SECTION 7: TESTIMONIALS ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "28px" }}>
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", fontWeight: 900, color: "#2d2416", margin: 0 }}>
              Loved by our users{" "}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <path d="M12 20 C12 20 4 14 4 8.5 C4 6 6 4 8.5 4 C10 4 11.3 4.7 12 5.8 C12.7 4.7 14 4 15.5 4 C18 4 20 6 20 8.5 C20 14 12 20 12 20Z" fill="#b39ddb" stroke="#7c4dff" strokeWidth="0.8"/>
              </svg>
            </h2>
            <div style={{ position: "absolute", bottom: "-6px", left: "20%", width: "60%" }}>
              <svg width="100%" height="5" viewBox="0 0 100 5" preserveAspectRatio="none">
                <path d="M0 3 Q30 1 60 3.5 Q80 5 100 2.5" stroke="#7c4dff" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
            <button style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #2d2416", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "2px 2px 0px #2d2416", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3 L5 7 L9 11" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", flex: 1 }}>
              {[
                { name: "Priya Sharma", role: "Product Designer", quote: "ScribbleForms made it super easy to collect feedback from our community. The analytics are absolutely beautiful!", bg: "#f5f0ff", borderAccent: "rgba(124,77,255,0.2)",
                  Avatar: () => (
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="20" fill="#ede8f9" stroke="rgba(45,36,22,0.15)" strokeWidth="1"/>
                      <circle cx="21" cy="16" r="7" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <path d="M7 38 C7 29 14 24 21 24 C28 24 35 29 35 38" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <path d="M15 14 C16 11 19 10 21 10 C23 10 26 11 27 14" stroke="#c2185b" strokeWidth="0.8" fill="none" opacity="0.4"/>
                    </svg>
                  ),
                  deco: () => (
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" style={{ position: "absolute", bottom: 14, right: 16 }}>
                      <path d="M8 2 C8 2 12 4 13 8 C12 8 10 7 9 6 C9 9 7 12 4 13 C4 13 3 9 5 6 C3 7 1 8 0 8 C1 4 5 2 8 2Z" fill="#a5d6a7" opacity="0.5"/>
                    </svg>
                  )
                },
                { name: "Arjun Patel", role: "Indie Developer", quote: "The best form builder I've used. The community templates and themes are a game changer.", bg: "#f1fbf0", borderAccent: "rgba(76,175,80,0.2)",
                  Avatar: () => (
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="20" fill="#e8f5e9" stroke="rgba(45,36,22,0.15)" strokeWidth="1"/>
                      <circle cx="21" cy="15" r="7" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <path d="M7 38 C7 29 14 24 21 24 C28 24 35 29 35 38" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <rect x="15" y="9" width="12" height="5" rx="2" fill="#5d4037" opacity="0.2"/>
                    </svg>
                  ),
                  deco: () => (
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" style={{ position: "absolute", bottom: 14, right: 16 }}>
                      <path d="M9 1 C9 1 15 4 16 9 C14 9 11 8 10 7 C10 11 8 14 4 15 C4 15 2 11 4 7 C2 8 0 9 -1 9 C0 4 6 1 9 1Z" fill="#c8e6c9" opacity="0.6"/>
                    </svg>
                  )
                },
                { name: "Meera Nair", role: "CTO, DevTools", quote: "We use the API and webhooks extensively. Solid platform, great docs, and amazing team!", bg: "#fffaf0", borderAccent: "rgba(239,108,0,0.15)",
                  Avatar: () => (
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <circle cx="21" cy="21" r="20" fill="#fff3e0" stroke="rgba(45,36,22,0.15)" strokeWidth="1"/>
                      <circle cx="21" cy="15" r="7" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <path d="M7 38 C7 29 14 24 21 24 C28 24 35 29 35 38" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                      <path d="M15 11 C17 9 21 9 25 11" stroke="#2d2416" strokeWidth="0.8" fill="none" opacity="0.25"/>
                    </svg>
                  ),
                  deco: () => (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", bottom: 14, right: 16 }}>
                      <path d="M7 1 L8.5 5 L12.5 5.5 L9.5 8.5 L10.5 12.5 L7 10.5 L3.5 12.5 L4.5 8.5 L1.5 5.5 L5.5 5 Z" fill="#ef6c00" opacity="0.2"/>
                    </svg>
                  )
                },
              ].map((user, idx) => (
                <div key={idx} style={{ position: "relative", backgroundColor: user.bg, padding: "22px 18px", display: "flex", gap: "14px", alignItems: "flex-start", borderRadius: "14px", minHeight: "140px", boxSizing: "border-box", border: `1.5px solid ${user.borderAccent}` }}>
                  {/* Stars */}
                  <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: "2px" }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M4.5 1 L5.2 3 L7.5 3 L5.8 4.5 L6.5 7 L4.5 5.5 L2.5 7 L3.2 4.5 L1.5 3 L3.8 3 Z" fill="#ef6c00"/>
                      </svg>
                    ))}
                  </div>
                  
                  {/* Avatar */}
                  <div style={{ flexShrink: 0, borderRadius: "50%", overflow: "hidden", border: "1.2px solid rgba(45,36,22,0.15)", boxShadow: "1px 2px 0 rgba(0,0,0,0.06)" }}>
                    <user.Avatar />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    {/* Opening quote mark */}
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ opacity: 0.2 }}>
                      <path d="M0 14 L0 6 C0 2.7 2.7 0 6 0 L6 4 C4.3 4 3 5.3 3 7 L3 14 Z" fill="#2d2416"/>
                      <path d="M9 14 L9 6 C9 2.7 11.7 0 15 0 L15 4 C13.3 4 12 5.3 12 7 L12 14 Z" fill="#2d2416"/>
                    </svg>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontStyle: "italic", fontSize: "12px", fontWeight: 600, color: "#2d2416", margin: "0", lineHeight: "1.5" }}>{user.quote}</p>
                    <div>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 800, color: "#2d2416", display: "block" }}>— {user.name}</span>
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 700, color: "rgba(45,36,22,0.5)" }}>{user.role}</span>
                    </div>
                  </div>

                  {/* Decorative element */}
                  <div style={{ position: "absolute", bottom: 14, right: 16 }}>
                    <user.deco />
                  </div>
                </div>
              ))}
            </div>

            {/* Right nav */}
            <button style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #2d2416", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "2px 2px 0px #2d2416", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3 L9 7 L5 11" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "20px" }}>

          {/* Cat shelf */}
          <div style={{ width: "100%", height: "50px", borderBottom: "1.5px solid rgba(45,36,22,0.18)", position: "relative", marginBottom: "44px", display: "flex", alignItems: "flex-end" }}>
            {/* Cat SVG (peeking over shelf) */}
            <div style={{ position: "absolute", left: 0, bottom: 0 }}>
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                {/* Body peeking */}
                <ellipse cx="50" cy="55" rx="30" ry="12" fill="#f5f5f5"/>
                {/* Head */}
                <ellipse cx="50" cy="38" rx="20" ry="18" fill="#f5f5f5" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                {/* Ears */}
                <path d="M34 28 L30 14 L42 24Z" fill="#f5f5f5" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                <path d="M66 28 L70 14 L58 24Z" fill="#f5f5f5" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                <path d="M35 27 L32 18 L41 24Z" fill="#ffb3c1" opacity="0.5"/>
                <path d="M65 27 L68 18 L59 24Z" fill="#ffb3c1" opacity="0.5"/>
                {/* Face patches */}
                <path d="M34 32 C36 28 40 26 44 28 C40 32 36 36 34 32Z" fill="#333" opacity="0.7"/>
                <path d="M64 34 C62 30 58 28 55 30 C58 34 62 38 64 34Z" fill="#333" opacity="0.5"/>
                {/* Eyes */}
                <ellipse cx="43" cy="36" rx="3.5" ry="4" fill="#333"/>
                <ellipse cx="57" cy="36" rx="3.5" ry="4" fill="#333"/>
                <circle cx="42" cy="35" r="1" fill="white"/>
                <circle cx="56" cy="35" r="1" fill="white"/>
                {/* Nose */}
                <path d="M48 41 L50 39 L52 41 L50 43Z" fill="#ffb3c1"/>
                {/* Mouth */}
                <path d="M47 43 Q50 46 53 43" stroke="rgba(45,36,22,0.4)" strokeWidth="0.8" fill="none"/>
                {/* Paws on shelf */}
                <ellipse cx="36" cy="58" rx="7" ry="4" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                <ellipse cx="64" cy="58" rx="7" ry="4" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                {/* Tail */}
                <path d="M80 55 C90 50 100 48 105 52 C100 55 90 57 80 55Z" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                <path d="M80 54 C84 48 88 44 92 46" stroke="rgba(45,36,22,0.08)" strokeWidth="4" strokeLinecap="round" fill="none"/>
              </svg>
            </div>

            {/* Speech bubble */}
            <div style={{
              position: "absolute",
              left: "118px",
              bottom: "12px",
              backgroundColor: "#fff",
              border: "1.5px solid rgba(45,36,22,0.2)",
              borderRadius: "12px",
              padding: "8px 14px",
              fontFamily: "'Caveat', cursive",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#2d2416",
              boxShadow: "1px 1px 0 rgba(45,36,22,0.08)"
            }}>
              Thanks for scrolling this far!{" "}
              {/* Heart */}
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
                <path d="M6 9 C6 9 1 5.5 1 3 C1 1.5 2.5 0.5 4 1 C4.8 1.3 5.5 1.8 6 2.5 C6.5 1.8 7.2 1.3 8 1 C9.5 0.5 11 1.5 11 3 C11 5.5 6 9 6 9Z" fill="#b39ddb"/>
              </svg>
              {/* Bubble tail */}
              <div style={{ position: "absolute", left: -8, bottom: 10, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "9px solid rgba(45,36,22,0.2)" }} />
              <div style={{ position: "absolute", left: -6, bottom: 10, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "9px solid #fff" }} />
            </div>

            {/* Paw prints */}
            {[180, 210, 240].map((x, i) => (
              <svg key={i} width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ position: "absolute", left: x, bottom: -6 }}>
                <ellipse cx="7" cy="8" rx="3.5" ry="2.5" fill="rgba(45,36,22,0.1)"/>
                <circle cx="3" cy="4" r="1.2" fill="rgba(45,36,22,0.1)"/>
                <circle cx="6" cy="2.5" r="1.2" fill="rgba(45,36,22,0.1)"/>
                <circle cx="9" cy="2" r="1.2" fill="rgba(45,36,22,0.1)"/>
                <circle cx="12" cy="3.5" r="1.2" fill="rgba(45,36,22,0.1)"/>
              </svg>
            ))}

            {/* Right side plant & heart */}
            <div style={{ position: "absolute", right: 40, bottom: 0, display: "flex", alignItems: "flex-end", gap: "12px" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2 C8 2 11 5 11 8 C11 8 9 7 8 5 C8 5 7 8 5 8 C5 5 8 2 8 2Z" fill="#a5d6a7" stroke="#388e3c" strokeWidth="0.6"/>
                <path d="M8 8 L8 14" stroke="#4caf50" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
              {/* Pot plant */}
              <svg width="38" height="48" viewBox="0 0 38 48" fill="none">
                <path d="M6 24 C6 16 12 8 19 6 C26 8 32 16 32 24" fill="#a5d6a7" opacity="0.4"/>
                <path d="M19 6 C19 6 14 14 19 24" stroke="#388e3c" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
                <path d="M19 12 C19 12 24 16 24 22" stroke="#388e3c" strokeWidth="0.6" strokeLinecap="round" fill="none"/>
                <path d="M19 14 C19 14 14 18 14 22" stroke="#388e3c" strokeWidth="0.6" strokeLinecap="round" fill="none"/>
                <Trapezoid/>
                <path d="M13 28 L25 28 L27 42 L11 42 Z" fill="#c8a46a" stroke="#a0784a" strokeWidth="0.8"/>
                <path d="M11 28 L27 28 L27 32 L11 32 Z" fill="#a0784a" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Main footer links grid */}
          <div style={{ display: "grid", gridTemplateColumns: "260px repeat(5, 1fr)", gap: "20px", width: "100%", boxSizing: "border-box", paddingBottom: "36px" }}>
            
            {/* Branding */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                  <path d="M9 14 C9 14 2 9 2 5 C2 2.8 3.8 1 6 1 C7.3 1 8.4 1.6 9 2.6 C9.6 1.6 10.7 1 12 1 C14.2 1 16 2.8 16 5 C16 9 9 14 9 14Z" fill="#b39ddb"/>
                </svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "26px", fontWeight: 900, color: "#2d2416" }}>ScribbleForms</span>
                {/* Underline */}
                <svg style={{ position: "absolute", bottom: -4, left: 24, width: "calc(100% - 24px)", height: 4 }} viewBox="0 0 150 4" preserveAspectRatio="none">
                  <path d="M0 2 C40 1 90 3 150 2" stroke="#7c4dff" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.65)", lineHeight: "1.6", margin: 0, maxWidth: "220px" }}>
                Create beautiful forms, collect responses, and grow with better insights. All from one playful workspace.
              </p>
              {/* Boy illustration placeholder */}
              <div style={{ width: "130px", height: "90px", position: "relative", marginTop: "8px" }}>
                <svg width="130" height="90" viewBox="0 0 130 90" fill="none">
                  {/* Simple boy at laptop illustration */}
                  <ellipse cx="55" cy="80" rx="28" ry="6" fill="rgba(45,36,22,0.06)"/>
                  {/* Chair */}
                  <rect x="35" y="60" width="40" height="4" rx="2" fill="#c8b89a" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                  <rect x="42" y="64" width="4" height="16" rx="2" fill="#c8b89a" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                  <rect x="64" y="64" width="4" height="16" rx="2" fill="#c8b89a" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                  {/* Table */}
                  <rect x="15" y="52" width="80" height="4" rx="2" fill="#d4b896" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                  <rect x="18" y="56" width="4" height="20" rx="2" fill="#c8a46a" stroke="rgba(45,36,22,0.1)" strokeWidth="0.6"/>
                  <rect x="88" y="56" width="4" height="20" rx="2" fill="#c8a46a" stroke="rgba(45,36,22,0.1)" strokeWidth="0.6"/>
                  {/* Laptop */}
                  <rect x="28" y="36" width="50" height="32" rx="3" fill="#e8e0d0" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                  <rect x="31" y="39" width="44" height="24" rx="2" fill="#7c4dff" opacity="0.7"/>
                  <rect x="24" y="52" width="58" height="3" rx="1.5" fill="#d4b896" stroke="rgba(45,36,22,0.15)" strokeWidth="0.5"/>
                  {/* Screen content */}
                  <rect x="34" y="42" width="20" height="3" rx="1" fill="white" opacity="0.6"/>
                  <rect x="34" y="47" width="14" height="2" rx="1" fill="white" opacity="0.4"/>
                  <rect x="34" y="51" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
                  {/* Boy body */}
                  <rect x="46" y="22" width="18" height="22" rx="6" fill="#fce5a4" stroke="rgba(45,36,22,0.15)" strokeWidth="0.8"/>
                  {/* Head */}
                  <ellipse cx="55" cy="16" rx="10" ry="10" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/>
                  {/* Hair */}
                  <path d="M45 12 C46 6 54 3 62 8 C62 8 60 6 55 6 C50 6 46 10 45 12Z" fill="#3d2b1f"/>
                  {/* Eyes */}
                  <circle cx="51" cy="16" r="1.5" fill="#333"/>
                  <circle cx="59" cy="16" r="1.5" fill="#333"/>
                  <circle cx="51.5" cy="15.5" r="0.5" fill="white"/>
                  <circle cx="59.5" cy="15.5" r="0.5" fill="white"/>
                  {/* Smile */}
                  <path d="M51 19 Q55 22 59 19" stroke="#c2185b" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6"/>
                  {/* Hoodie */}
                  <rect x="46" y="30" width="18" height="14" rx="4" fill="#e8e0d0" stroke="rgba(45,36,22,0.12)" strokeWidth="0.8"/>
                  <rect x="52" y="30" width="6" height="8" rx="1" fill="rgba(45,36,22,0.06)"/>
                  {/* Arms */}
                  <path d="M46 32 L36 44" stroke="#fce5a4" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M64 32 L74 44" stroke="#e8e0d0" strokeWidth="6" strokeLinecap="round"/>
                  {/* Cup */}
                  <rect x="20" y="45" width="10" height="7" rx="1" fill="#fce5a4" stroke="rgba(45,36,22,0.2)" strokeWidth="0.6"/>
                  <path d="M24 45 C24 43 26 42 28 43" stroke="rgba(45,36,22,0.15)" strokeWidth="0.6" fill="none"/>
                  {/* Heart on hoodie */}
                  <path d="M55 34 C55 33 56 32.5 56.5 33 C57 33.5 55 35.5 55 35.5 C55 35.5 53 33.5 53.5 33 C54 32.5 55 33 55 34Z" fill="#b39ddb" opacity="0.6"/>
                  {/* Plant */}
                  <path d="M90 44 C90 44 86 40 88 36 C90 33 94 34 93 38" stroke="#388e3c" strokeWidth="0.8" fill="#a5d6a7" strokeLinecap="round"/>
                  <path d="M90 44 C90 44 94 41 95 37 C96 34 92 33 91 37" stroke="#388e3c" strokeWidth="0.8" fill="#a5d6a7" strokeLinecap="round" opacity="0.7"/>
                  <rect x="88" y="44" width="6" height="7" rx="1" fill="#c8a46a" stroke="#a0784a" strokeWidth="0.6"/>
                  {/* Sparkles */}
                  <path d="M80 20 L81 23 L84 24 L81 25 L80 28 L79 25 L76 24 L79 23 Z" fill="#7c4dff" opacity="0.2"/>
                  <path d="M100 30 L100.8 32 L102.5 32.5 L100.8 33 L100 35 L99.2 33 L97.5 32.5 L99.2 32 Z" fill="#ef6c00" opacity="0.2"/>
                </svg>
              </div>
            </div>

            {/* Product */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1 L9.5 5.5 L14 6 L10.5 9.5 L11.5 14 L8 11.5 L4.5 14 L5.5 9.5 L2 6 L6.5 5.5 Z" fill="#ef6c00" stroke="#bf360c" strokeWidth="0.5"/></svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 900, color: "#2d2416" }}>Product</span>
              </div>
              {["Features", "Templates", "Explore Forms", "Themes", "Integrations", "Changelog"].map(link => (
                <span key={link} style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.7)", cursor: "pointer", transition: "color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c4dff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(45,36,22,0.7)"}>{link}</span>
              ))}
            </div>

            {/* Use Cases */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12 L8 3 L12 6 L8 15 Z" fill="#c8e6c9" stroke="#388e3c" strokeWidth="0.6"/><path d="M12 6 L16 4 L15 8 Z" fill="#a5d6a7" stroke="#388e3c" strokeWidth="0.6"/></svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 900, color: "#2d2416" }}>Use Cases</span>
              </div>
              {["Surveys & Feedback", "Event Registration", "Lead Generation", "Quizzes & Tests", "Customer Feedback", "More Examples"].map(link => (
                <span key={link} style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.7)", cursor: "pointer", transition: "color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c4dff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(45,36,22,0.7)"}>{link}</span>
              ))}
            </div>

            {/* Resources */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.7"/><line x1="5" y1="5" x2="11" y2="5" stroke="rgba(45,36,22,0.4)" strokeWidth="0.8" strokeLinecap="round"/><line x1="5" y1="8" x2="11" y2="8" stroke="rgba(45,36,22,0.4)" strokeWidth="0.8" strokeLinecap="round"/><line x1="5" y1="11" x2="9" y2="11" stroke="rgba(45,36,22,0.4)" strokeWidth="0.8" strokeLinecap="round"/></svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 900, color: "#2d2416" }}>Resources</span>
              </div>
              {["Help Center", "Guides & Tutorials", "Blog", "Best Practices", "What's New", "API Documentation"].map(link => (
                <span key={link} style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.7)", cursor: "pointer", transition: "color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c4dff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(45,36,22,0.7)"}>{link}</span>
              ))}
            </div>

            {/* Company */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="3" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.7"/><circle cx="11" cy="6" r="3" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.7"/><path d="M1 15 C1 11 3.5 9 6 9 C8.5 9 11 11 11 15" fill="#fce5a4" stroke="#2d2416" strokeWidth="0.7" strokeLinecap="round"/><path d="M9 10.5 C10 9.5 11.5 9 13 9 C15 9 16 11 16 13" fill="none" stroke="#2d2416" strokeWidth="0.7" strokeLinecap="round"/></svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 900, color: "#2d2416" }}>Company</span>
              </div>
              {["About Us", "Careers", "Pricing", "Contact Us", "Affiliates", "Partners"].map(link => (
                <span key={link} style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.7)", cursor: "pointer", transition: "color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c4dff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(45,36,22,0.7)"}>{link}</span>
              ))}
            </div>

            {/* Legal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1 L15 4.5 L15 8.5 C15 12 11.5 14.5 8 15.5 C4.5 14.5 1 12 1 8.5 L1 4.5 Z" fill="#dbe7c4" stroke="#2d2416" strokeWidth="0.7"/><polyline points="5 8.5 7 10.5 11 6.5" stroke="#2e7d32" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "17px", fontWeight: 900, color: "#2d2416" }}>Legal</span>
              </div>
              {["Privacy Policy", "Terms of Service", "Security", "GDPR", "Data Processing Agreement"].map(link => (
                <span key={link} style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(45,36,22,0.7)", cursor: "pointer", transition: "color 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#7c4dff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(45,36,22,0.7)"}>{link}</span>
              ))}
            </div>
          </div>

          {/* Newsletter strip */}
          <div style={{ position: "relative", width: "100%", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", boxSizing: "border-box", marginBottom: "28px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1320 56" preserveAspectRatio="none" fill="none">
              <rect x="1" y="1" width="1318" height="54" rx="10" stroke="#2d2416" strokeWidth="1.2" strokeDasharray="5 4" fill="rgba(255,253,249,0.5)" />
            </svg>
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" style={{ zIndex: 1 }}>
              <path d="M2 14 L18 4 L14 18 L9 12 Z" fill="#7c4dff" stroke="#5a3db5" strokeWidth="0.5" strokeLinejoin="round"/>
              <path d="M9 12 L18 4" stroke="#5a3db5" strokeWidth="0.5"/>
            </svg>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: 700, color: "#2d2416", zIndex: 1 }}>
              Join 10,000+ creators who build better forms every day.
            </span>
            <Button onClick={() => alert('hello')} style={{fontFamily: "'Caveat', cursive", fontSize: "18px", fontWeight: "bold", color: "#7c4dff", cursor: "pointer", zIndex: 9999, borderBottom: "1.5px solid #7c4dff", marginLeft: "8px" }}>
              Start Building Free →
            </Button>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ zIndex: 1 }}>
              <path d="M7 1 L8.5 5 L13 5.5 L9.5 8.5 L10.5 13 L7 10.5 L3.5 13 L4.5 8.5 L1 5.5 L5.5 5 Z" fill="#ef6c00" opacity="0.5"/>
            </svg>
          </div>

          {/* Bottom legal strip */}
          <div style={{ width: "100%", borderTop: "1.2px solid rgba(45,36,22,0.12)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 700, color: "rgba(45,36,22,0.6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span>© 2024 ScribbleForms. All rights reserved.</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", color: "#2d2416" }}>Made with</span>
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                  <path d="M7 11 C7 11 1 7 1 3.5 C1 1.5 2.5 0 4.5 0.5 C5.5 0.8 6.3 1.5 7 2.5 C7.7 1.5 8.5 0.8 9.5 0.5 C11.5 0 13 1.5 13 3.5 C13 7 7 11 7 11Z" fill="#b39ddb"/>
                </svg>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", color: "#2d2416" }}>in India</span>
                <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                  <rect x="0" y="0" width="22" height="5.3" rx="1" fill="#ff9933"/>
                  <rect x="0" y="5.3" width="22" height="5.3" fill="white"/>
                  <rect x="0" y="10.7" width="22" height="5.3" rx="1" fill="#138808"/>
                  <circle cx="11" cy="8" r="2.5" fill="none" stroke="#000080" strokeWidth="0.6"/>
                  <circle cx="11" cy="8" r="0.5" fill="#000080"/>
                  {[0,30,60,90,120,150,180,210,240,270,300,330,360].map((deg, i) => (
                    <line key={i} x1="11" y1="8" x2={11 + 2.3 * Math.cos((deg * Math.PI) / 180)} y2={8 + 2.3 * Math.sin((deg * Math.PI) / 180)} stroke="#000080" strokeWidth="0.4"/>
                  ))}
                </svg>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Social icons */}
              {[
                { 
                  label: "Twitter", 
                  link: "https://x.com/shivamdotdev", 
                  Icon: () => (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="4" fill="#f5f5f5" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/><path d="M3 14 L8 9 L3 4 H5.5 L9 8 L12.5 4 H15 L10.5 9 L15.5 14 H13 L9.5 10 L6 14 Z" fill="#333" strokeWidth="0"/></svg>
                  )
                },
                { 
                  label: "LinkedIn", 
                  link: "https://www.linkedin.com/in/shivam-yadav-0a5ba0351/", 
                  Icon: () => (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="4" fill="#f5f5f5" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/><circle cx="6" cy="7" r="1.5" fill="#0077b5"/><rect x="4.5" y="9.5" width="3" height="6" rx="0.5" fill="#0077b5"/><path d="M10 9.5 H13 V15.5 H10 Z" fill="#0077b5"/><path d="M10 11.5 C10 10 11 9.5 12 9.5 C13 9.5 13.5 10.5 13.5 11 V15.5 H10 Z" fill="#0077b5"/></svg>
                  )
                },
                { 
                  label: "YouTube", 
                  Icon: () => (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="18" height="18" rx="4" fill="#f5f5f5" stroke="rgba(45,36,22,0.2)" strokeWidth="0.8"/><rect x="3" y="6" width="14" height="9" rx="2" fill="#ff0000" opacity="0.9"/><path d="M8 8 L13 10.5 L8 13Z" fill="white"/></svg>
                  )
                },
              ].map(({ label, link, Icon }) => {
                
                // Handle the click logic dynamically
                const handleClick = () => {
                  if (label === "YouTube") {
                    // FIXED: Instead of browser alert, open our custom modal wrapper
                    setIsDemoModalOpen(true);
                  } else if (link) {
                    window.open(link, "_blank", "noopener,noreferrer");
                  }
                };

                return (
                  <div 
                    key={label} 
                    onClick={handleClick}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                  >
                    <Icon />
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 700, color: "#2d2416" }}>
                      {label}
                    </span>
                  </div>
                );
              })}

              {/* Sleeping cat SVG */}
              <svg width="70" height="40" viewBox="0 0 70 40" fill="none">
                <ellipse cx="35" cy="32" rx="25" ry="8" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                <ellipse cx="22" cy="28" rx="12" ry="8" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                {/* Head */}
                <ellipse cx="14" cy="24" rx="10" ry="8" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.8"/>
                {/* Ears */}
                <path d="M7 18 L4 10 L13 16Z" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.6"/>
                <path d="M19 17 L23 10 L19 16Z" fill="#f5f5f5" stroke="rgba(45,36,22,0.1)" strokeWidth="0.6"/>
                <path d="M8 18 L6 13 L12 17Z" fill="#ffb3c1" opacity="0.4"/>
                <path d="M19 17 L21 13 L19 17Z" fill="#ffb3c1" opacity="0.4"/>
                {/* Patches */}
                <path d="M7 22 C9 19 13 19 13 21 C11 24 7 24 7 22Z" fill="#555" opacity="0.5"/>
                {/* Closed eyes (sleeping) */}
                <path d="M10 22 Q12 21 14 22" stroke="#333" strokeWidth="1" strokeLinecap="round" fill="none"/>
                <path d="M16 22 Q18 21 20 22" stroke="#333" strokeWidth="1" strokeLinecap="round" fill="none"/>
                {/* Nose */}
                <path d="M13 25 L14 24 L15 25 L14 26Z" fill="#ffb3c1"/>
                {/* Tail */}
                <path d="M58 32 C62 28 66 24 68 26 C70 28 66 32 62 32 C58 32 55 32 55 32" fill="none" stroke="rgba(45,36,22,0.1)" strokeWidth="6" strokeLinecap="round"/>
                <path d="M58 31 C62 27 66 23 68 26" stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {/* Zzz */}
                <text x="50" y="18" fontFamily="'Nunito', sans-serif" fontSize="10" fill="rgba(45,36,22,0.15)" fontWeight="bold">z</text>
                <text x="56" y="13" fontFamily="'Nunito', sans-serif" fontSize="8" fill="rgba(45,36,22,0.1)" fontWeight="bold">z</text>
                <text x="62" y="9" fontFamily="'Nunito', sans-serif" fontSize="6" fill="rgba(45,36,22,0.08)" fontWeight="bold">z</text>
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ── TRICKED MODAL ── */}
      {isTrickedOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45, 36, 22, 0.25)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div style={{ position: "relative", width: "440px", padding: "40px 30px 30px 30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible", filter: "drop-shadow(5px 6px 0px #2d2416)" }} viewBox="0 0 440 260" preserveAspectRatio="none" fill="none">
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" fill="#fffdf9" />
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div onClick={() => setIsTrickedOpen(false)} style={{ position: "absolute", top: "14px", right: "20px", fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "bold", color: "#2d2416", cursor: "pointer", zIndex: 2, userSelect: "none" }}>✕</div>
            <div style={{ fontSize: "40px", margin: "0", zIndex: 1, position: "relative" }}>😜</div>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "36px", fontWeight: "900", color: "#2d2416", margin: "0", zIndex: 1, position: "relative" }}>Ha ha, tricked u!</h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "15px", fontWeight: "700", color: "rgba(45, 36, 22, 0.65)", margin: "0 0 6px 0", lineHeight: "1.4", zIndex: 1, position: "relative" }}>There is absolutely no dark mode here. Keep enjoying the warm paper vibes!</p>
            <button onClick={() => setIsTrickedOpen(false)} style={{ backgroundColor: "#7c4dff", color: "#ffffff", fontFamily: "'Caveat', cursive", fontSize: "22px", fontWeight: "bold", border: "1.5px solid #2d2416", borderRadius: "8px", padding: "6px 36px", cursor: "pointer", outline: "none", zIndex: 1, position: "relative" }}>Okay, u got me</button>
          </div>
        </div>
      )}

      {/* ── NEW DEMO STATUS NOTIFICATION MODAL ── */}
      {isDemoModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45, 36, 22, 0.25)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div style={{ position: "relative", width: "440px", padding: "40px 30px 30px 30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible", filter: "drop-shadow(5px 6px 0px #2d2416)" }} viewBox="0 0 440 260" preserveAspectRatio="none" fill="none">
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" fill="#fffdf9" />
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div onClick={() => setIsDemoModalOpen(false)} style={{ position: "absolute", top: "14px", right: "20px", fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "bold", color: "#2d2416", cursor: "pointer", zIndex: 2, userSelect: "none" }}>✕</div>
            <div style={{ fontSize: "40px", margin: "0", zIndex: 1, position: "relative" }}>🚀</div>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "36px", fontWeight: "900", color: "#2d2416", margin: "0", zIndex: 1, position: "relative" }}>Work in Progress!</h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "15px", fontWeight: "700", color: "rgba(45, 36, 22, 0.65)", margin: "0 0 6px 0", lineHeight: "1.4", zIndex: 1, position: "relative" }}>The stupid developer said, "I'll make the demo video tomorrow," and then joined another hackathon. The demo video is coming soon</p>
            <button onClick={() => setIsDemoModalOpen(false)} style={{ backgroundColor: "#ffd6db", color: "#2d2416", fontFamily: "'Caveat', cursive", fontSize: "22px", fontWeight: "bold", border: "1.5px solid #2d2416", borderRadius: "8px", padding: "6px 36px", cursor: "pointer", outline: "none", zIndex: 1, position: "relative" }}>Can't wait to see it!</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(45, 36, 22, 0.15); border-radius: 99px; }
      `}} />
    </div>
  );
}