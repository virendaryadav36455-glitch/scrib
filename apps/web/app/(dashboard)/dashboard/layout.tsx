"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "~/hooks/api/auth";
import { useUIStore } from "~/store/ui.store";
import { ScribbleToast } from "~/components/scribble/ScribbleUI";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const router = useRouter();
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    if (!isLoading && !me) router.replace("/login");
  }, [me, isLoading, router]);

  // ─── THEMED ORGANIC SKETCH WORKSPACE LOADER ─────────────────────────────────
  if (isLoading) return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fdf8f0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="26" stroke="#c4b8a8" strokeWidth="1.5" strokeDasharray="4 3" style={{ animation: "workspaceSpin 3s linear infinite" }} />
          <circle cx="30" cy="30" r="16" stroke="#9b8fdf" strokeWidth="1.5" strokeDasharray="3 4" style={{ animation: "workspaceSpinReverse 2s linear infinite" }} />
          <circle cx="30" cy="30" r="4" fill="#9b8fdf" opacity="0.6" />
        </svg>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "22px", color: "#2d2416", opacity: 0.75, margin: 0 }}>
          Doodling your workspace canvas...
        </p>
        <style>{`
          @keyframes workspaceSpin { from { transform-origin: 30px 30px; transform: rotate(0deg); } to { transform-origin: 30px 30px; transform: rotate(360deg); } }
          @keyframes workspaceSpinReverse { from { transform-origin: 30px 30px; transform: rotate(0deg); } to { transform-origin: 30px 30px; transform: rotate(-360deg); } }
          @keyframes scribbleToastIn {
            from { transform: translateY(12px) rotate(2deg); opacity: 0; }
            to { transform: translateY(0) rotate(-0.5deg); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );

  if (!me) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--paper)" }}>
      {/* <Sidebar/> */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* <Topbar/> */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>

      {/* ─── CUSTOM THEME SKETCH TOAST PORTAL NOTIFICATIONS ───────────────────── */}
      <div 
        style={{ 
          position: "fixed", 
          bottom: 24, 
          right: 24, 
          zIndex: 9999, 
          display: "flex", 
          flexDirection: "column", 
          gap: 12 
        }}
      >
        {notifications?.map((n) => {
          // Dynamic theme configuration mapping matching the sketch engine aesthetic
          const isError = n.type === "error";
          const isInfo = n.type === "info" || n.type === "loading";
          
          const borderStroke = isError ? "#f4c2b0" : isInfo ? "#b4c6ef" : "#c2e6c4";
          const bgPaperColor = isError ? "#fff9f7" : "#fdfbf7";

          return (
            <div 
              key={n.id} 
              style={{ 
                animation: "scribbleToastIn 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards" 
              }}
            >
              {/* If you prefer to use your generic core UI wrapper component pass down properties directly */}
              <div
                onClick={() => removeNotification(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 20px",
                  backgroundColor: bgPaperColor,
                  border: `1.5px dashed ${borderStroke}`,
                  borderRadius: "12px",
                  boxShadow: "4px 4px 0px rgba(45,36,22,0.12)",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "14px",
                  fontWeight: 650,
                  color: "#2d2416",
                  cursor: "pointer",
                  minWidth: "280px",
                  maxWidth: "400px",
                  position: "relative",
                  userSelect: "none",
                  transition: "transform 0.1s ease"
                }}
              >
                {/* Visual Feedback Marker Icon badges */}
                {isError ? (
                  <AlertCircle className="shrink-0" style={{ color: "#e64a19" }} size={18} />
                ) : isInfo ? (
                  <Info className="shrink-0" style={{ color: "#3182ce" }} size={18} />
                ) : (
                  <CheckCircle2 className="shrink-0" style={{ color: "#2e7d32" }} size={18} />
                )}

                <div style={{ flex: 1, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                  {n.message}
                </div>
                
                {/* Small stylized miniature tape indicator cross tabs */}
                <div style={{ position: "absolute", top: "-6px", left: "16px", width: "24px", height: "10px", backgroundColor: borderStroke, opacity: 0.35, transform: "rotate(-4deg)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}