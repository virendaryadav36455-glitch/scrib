"use client";

import React, { use } from "react";
import { Compass, PlusCircle, LayoutDashboard, Share2, Layout, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/success/BG.png')", // Uses your full-page sketched border asset
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Caveat', cursive", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 50px 0px 50px", // Flushed bottom layout flow handles the alignment safely
      }}
    >
      {/* ── 1. HEADER NAVIGATION LAYER ── */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, flexShrink: 0 }}>
        {/* Logo Branding */}
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "24px", fontWeight: 800, color: "#2d2416", letterSpacing: "-0.5px" }}>
            ScribbleForms <span style={{ color: "#634cc9" }}>💜</span>
          </span>
        </Link>

        {/* Action items on the right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/dashboard/forms" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, color: "#5a4a30", opacity: 0.8 }}>
            <Compass size={16} /> Explore Forms
          </Link>
          <Link href="/dashboard/forms" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, color: "#5a4a30", opacity: 0.8 }}>
            <PlusCircle size={16} /> Create Form
          </Link>

          {/* Organic Sketched Button */}
          <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, position: "relative", padding: "8px 16px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} viewBox="0 0 140 38" fill="none" preserveAspectRatio="none">
              <path d="M6 4 Q8 2 40 2.5 Q80 3 115 2 Q132 1.5 136 4 Q140 6 139 10 Q140 22 138 32 Q136 37 130 36.5 Q95 37.5 60 37 Q25 36.5 10 37 Q4 37 3 33 Q1 28 2 18 Q1 8 6 4Z" fill="#e0d4f7" stroke="#2d2416" strokeWidth="1.5"/>
            </svg>
            <LayoutDashboard width="14" height="14" style={{ position: "relative", zIndex: 1, color: "#2d2416" }} />
            <span style={{ position: "relative", zIndex: 1, color: "#2d2416" }}>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ── UNIFIED SCENE WRAPPER ── */}
      <div 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", 
          width: "100%",
          maxHeight: "calc(100vh - 10px)",
          boxSizing: "border-box",
          marginTop: "-65px" 
        }}
      >
        {/* ── 2. CENTRAL HERO MIDDLEGROUND LAYER ── */}
        <div 
          style={{
            display: "flex",
            alignItems: "flex-end", 
            justifyContent: "center",
            width: "100%",
            height: "52%", 
            boxSizing: "border-box",
          }}
        >
          <img 
            src="/success/mid.png" 
            alt="Response Safely Landed" 
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* ── 3. BOTTOM WHAT'S NEXT ACTIONS SHELF ── */}
        <div 
          style={{ 
            position: "relative", 
            width: "1080px", 
            height: "145px", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            boxSizing: "border-box",
            padding: "12px 20px 20px 20px",
            marginTop: "4px", 
            flexShrink: 0
          }}
        >
          {/* Outer Hand-drawn Sketch border wrapper enclosing items */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1080 145" preserveAspectRatio="none" fill="none">
            <path d="M4 6 C300 4, 700 5, 1076 4 C1078.5 25, 1077.5 75, 1075.5 140 C750 141.5, 350 140.5, 5 141 C1.5 100, 2 50, 4 6 Z" stroke="#2d2416" strokeWidth="1.2" fill="none" strokeOpacity="0.4"/>
            <path d="M6 8 Q250 5 550 6 T1074 7 Q1077 35 1076 80 T1074 138 Q800 140 450 139 T6 136 Q3 75 4 45 Z" stroke="#2d2416" strokeWidth="0.8" fill="none" strokeOpacity="0.2"/>
          </svg>

          {/* Section Label */}
          <div style={{ position: "relative", zIndex: 1, fontSize: "16px", fontWeight: 800, color: "#2d2416", marginBottom: "14px" }}>
            What's next?
          </div>

          {/* Grid Split Content */}
          <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", width: "100%", height: "100%" }}>
            
            {/* Action Column 1: Explore */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 10px", borderRight: "1px dashed rgba(45,36,22,0.15)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e8e5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #2d2416" }}>
                <Compass size={18} color="#634cc9" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>Explore more forms</div>
                <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.6)", lineHeight: "14px", marginBottom: "6px" }}>Discover interesting forms</div>
                <Link href="/dashboard/forms" style={{ textDecoration: "none", width: "fit-content", padding: "4px 12px", fontSize: "11px", fontWeight: 700, background: "#ede8f9", color: "#2d2416", border: "1px solid #2d2416", borderRadius: "6px", textAlign: "center" }}>
                  Explore Forms →
                </Link>
              </div>
            </div>

            {/* Action Column 2: Create */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 16px", borderRight: "1px dashed rgba(45,36,22,0.15)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #2d2416" }}>
                <PlusCircle size={18} color="#2e7d32" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>Create your own</div>
                <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.6)", lineHeight: "14px", marginBottom: "6px" }}>Build beautiful forms in minutes.</div>
                <Link href="/dashboard/forms" style={{ textDecoration: "none", width: "fit-content", padding: "4px 12px", fontSize: "11px", fontWeight: 700, background: "#e8f5e9", color: "#2d2416", border: "1px solid #2d2416", borderRadius: "6px", textAlign: "center" }}>
                  Create Form →
                </Link>
              </div>
            </div>

            {/* Action Column 3: Dashboard Views */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 16px", borderRight: "1px dashed rgba(45,36,22,0.15)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #2d2416" }}>
                <BarChart3 size={18} color="#ef6c00" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>View your responses</div>
                <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.6)", lineHeight: "14px", marginBottom: "6px" }}>Check analytics and insights.</div>
                <Link href="/dashboard" style={{ textDecoration: "none", width: "fit-content", padding: "4px 12px", fontSize: "11px", fontWeight: 700, background: "#ffecc2", color: "#2d2416", border: "1px solid #2d2416", borderRadius: "6px", textAlign: "center" }}>
                  Go to Dashboard →
                </Link>
              </div>
            </div>

            {/* Action Column 4: Share */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e1f5fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #2d2416" }}>
                <Share2 size={18} color="#0288d1" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>Share the love</div>
                <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.6)", lineHeight: "14px", marginBottom: "6px" }}>Share this form with others.</div>
                <Link href="/dashboard/forms" style={{ textDecoration: "none", width: "fit-content", padding: "4px 12px", fontSize: "11px", fontWeight: 700, background: "#e1f5fe", color: "#2d2416", border: "1px solid #2d2416", borderRadius: "6px", textAlign: "center" }}>
                  Share Form →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}