"use client";

import React, { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";

export default function MobileDesktopGate({ children }: { children: React.ReactNode }) {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkViewportLimit = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    checkViewportLimit();
    window.addEventListener("resize", checkViewportLimit);
    return () => window.removeEventListener("resize", checkViewportLimit);
  }, []);

  if (!mounted) return null;

  if (isMobileViewport) {
    return (
      <div 
        style={{ 
          position: "fixed", inset: 0, width: "100vw", height: "100vh",
          backgroundColor: "#fdf6ed", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 999999, boxSizing: "border-box",
          padding: "24px", overflow: "hidden"
        }}
      >
        <div 
          style={{ 
            position: "relative", width: "100%", maxWidth: "360px",
            backgroundColor: "#fffdf9", border: "1.5px solid #2d2416",
            borderRadius: "16px", padding: "40px 24px 36px 24px",
            boxShadow: "4px 4px 0px #2d2416", display: "flex",
            flexDirection: "column", alignItems: "center", gap: "20px",
            boxSizing: "border-box", transform: "rotate(-1deg)", textAlign: "center"
          }}
        >
          <div
            style={{
              position: "absolute", top: "-10px", left: "50%",
              transform: "translateX(-50%) rotate(1deg)", width: "100px",
              height: "20px", backgroundColor: "#ffccd5", opacity: 0.85,
              borderRadius: "2px", border: "1px dashed rgba(45,36,22,0.15)", zIndex: 2
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            <Smartphone size={32} strokeWidth={1.5} color="rgba(45,36,22,0.3)" />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", animation: "wobbleArrow 1.5s infinite ease-in-out" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "#9462f5" }}>→</span>
            </div>
            <Monitor size={44} strokeWidth={1.5} color="#2d2416" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 900, color: "#2d2416", margin: 0, lineHeight: 1.1 }}>
              Desktop Only Workspace!
            </h3>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: "700", color: "rgba(45, 36, 22, 0.55)", margin: 0, lineHeight: "1.5" }}>
              ScribbleForms requires a larger drawing canvas to map out components, grids, and analytics vectors properly.
            </p>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", fontWeight: "bold", color: "#7c4dff", margin: "4px 0 0 0" }}>
              * Please expand your browser window or switch to a desktop computer!
            </p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes wobbleArrow {
            0%, 100% { transform: translateX(0); opacity: 0.5; }
            50% { transform: translateX(4px); opacity: 1; }
          }
        `}} />
      </div>
    );
  }

  return <>{children}</>;
}