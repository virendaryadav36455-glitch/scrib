"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "~/components/Sidebar"; 
import { Search, AlertCircle, CheckCircle2, TrendingUp, Users, Clock, Move } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormList, useCreateForm, useDeleteForm, useDuplicateForm } from "~/hooks/api/forms";

type ToastType = "success" | "error" | "info";
interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export default function AnalyticsHubPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"responses" | "recent">("responses");

  // ─── REAL BACKEND CONNECTION HOOKS ───
  const { data, isLoading, isError, error, refetch } = useFormList({ search: search || undefined });
  const deleteForm = useDeleteForm();
  const duplicateForm = useDuplicateForm();

  const allForms = data?.pages.flatMap((p: any) => p.forms) ?? [];

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Structural generation for decorative drafting layouts
  const getDraftingPositionMeta = (index: number) => {
    const styles = [
      { tabColor: "#ffd6db", clipAngle: "-1.5deg", markerColor: "#ff8fab" },
      { tabColor: "#dfcbf2", clipAngle: "1deg", markerColor: "#b39ddb" },
      { tabColor: "#e8f5e9", clipAngle: "-2deg", markerColor: "#81c784" },
      { tabColor: "#e1f5fe", clipAngle: "1.5deg", markerColor: "#4fc3f7" },
      { tabColor: "#fff3e0", clipAngle: "-1deg", markerColor: "#ffb74d" }
    ];

    return styles[index % styles.length]!;
  };

  // Sort logically for an Analytics presentation view layer
  const sortedForms = [...allForms].sort((a: any, b: any) => {
    if (sortBy === "responses") {
      return (b.totalResponses || 0) - (a.totalResponses || 0);
    }
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  const handleDuplicateForm = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateForm.mutate({ id }, {
      onSuccess: () => {
        showToast(`Duplicated "${title}" cleanly.`);
        refetch();
      },
      onError: (err: any) => showToast(err?.message || "Error copying form canvas.", "error")
    });
  };

  const handleDeleteForm = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Wipe "${title}" permanently?`)) {
      deleteForm.mutate({ id }, {
        onSuccess: () => {
          showToast(`Discarded "${title}" container template layout.`, "info");
          refetch();
        },
        onError: (err: any) => showToast(err?.message || "Failed to wipe sketch document.", "error")
      });
    }
  };

  // ─── NEW CREATIVE COMPILING LOADING STATE ───
  if (isLoading) {
    return (
      <div 
        style={{ 
          width: "100vw", 
          height: "100vh", 
          backgroundColor: "#fdf6ed", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "fixed",
          inset: 0,
          zIndex: 99999
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          
          {/* Schematic Compiling Animation Frame */}
          <div style={{ position: "relative", width: "80px", height: "80px" }}>
            
            {/* Background Grid Points */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "radial-gradient(#2d2416 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            
            {/* Rotating Drafting Tool Ring */}
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: "absolute", inset: 0, animation: "draftRotate 4s linear infinite" }}>
              <circle cx="40" cy="40" r="32" stroke="#2d2416" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
              <path d="M 40 2 L 40 10 M 40 70 L 40 78 M 2 40 L 10 40 M 70 40 L 78 40" stroke="#2d2416" strokeWidth="1.5" />
            </svg>

            {/* Inner Scaling Metric Wave Group */}
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              style={{ 
                position: "absolute", 
                top: "20px", 
                left: "20px", 
                animation: "pulseData 1.5s ease-in-out infinite"
              }}
            >
              <path d="M4 28 Q12 10 20 22 T36 12" fill="none" stroke="#9462f5" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="22" r="3" fill="#9462f5" />
              <circle cx="36" cy="12" r="3" fill="#ff8fab" />
            </svg>
          </div>

          {/* Descriptive Typography */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "26px", fontWeight: 900, color: "#2d2416", margin: 0, letterSpacing: "0.5px" }}>
              Compiling metric grids...
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 700, color: "rgba(45, 36, 22, 0.4)", margin: 0 }}>
              Plotting visual response coordinates and data vectors
            </p>
          </div>
        </div>

        {/* Local Keyframe Animations Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes draftRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulseData {
            0%, 100% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}} />
      </div>
    );
  }

  if (isError) {
    return <SketchError message={error?.message || "Could not successfully sync your analytics data matrix."} />;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/form/formBG.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* TOASTER */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 1000 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px",
              backgroundColor: t.type === "error" ? "#fff9f7" : "#fdfbf7",
              border: `1.5px dashed ${t.type === "error" ? "#f4c2b0" : t.type === "info" ? "#b4c6ef" : "#c2e6c4"}`,
              borderRadius: "12px", boxShadow: "4px 4px 0px rgba(45,36,22,0.15)",
              fontSize: "14px", fontWeight: 700, color: "#2d2416", transform: "rotate(-0.5deg)",
              minWidth: "265px"
            }}
          >
            {t.type === "error" ? <AlertCircle style={{ color: "#e64a19" }} size={16} /> : <CheckCircle2 style={{ color: "#2e7d32" }} size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* SCALE WRAPPER */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "125vw", 
          height: "125vh", 
          display: "flex",
          transform: "scale(0.8)",
          transformOrigin: "top left",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* LEFT SIDEBAR AREA */}
        <div style={{ width: "240px", height: "100%", paddingLeft: "65px", paddingTop: "24px", display: "flex", flexDirection: "column", boxSizing: "border-box", flexShrink: 0 }}>
          <Sidebar activeTab="Analytics" />
        </div>

        {/* MAIN BLUEPRINT VIEW */}
        <div style={{ flex: 1, height: "100%", padding: "45px 60px 45px 170px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
          
          {/* HEADER SECTION */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "30px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#1a150e", fontFamily: "'Caveat', cursive" }}>
                  Analytics Blueprint Desk
                </h2>
                <span style={{ fontSize: "20px" }}>
                    {/* <AnalyticsIcon/> */}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "rgba(45, 36, 22, 0.6)", fontWeight: 500 }}>
                Click down onto any active workspace dossier folder to compile tracking metrics and graphs.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Find blueprint folder..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 36px 8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(45,36,22,0.15)",
                    fontSize: "13px",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    outline: "none",
                    width: "190px",
                  }}
                />
                <Search style={{ width: "16px", height: "16px", position: "absolute", right: "12px", color: "rgba(45,36,22,0.4)" }} />
              </div>

              {/* Sorting Workspace Toggles */}
              <div style={{ display: "flex", background: "rgba(45,36,22,0.06)", padding: "2px", borderRadius: "8px", border: "1px solid rgba(45,36,22,0.1)" }}>
                <button 
                  onClick={() => setSortBy("responses")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", backgroundColor: sortBy === "responses" ? "#fff" : "transparent", color: "#2d2416", transition: "all 0.1s" }}
                >
                  Top Impact
                </button>
                <button 
                  onClick={() => setSortBy("recent")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", backgroundColor: sortBy === "recent" ? "#fff" : "transparent", color: "#2d2416", transition: "all 0.1s" }}
                >
                  Chronological
                </button>
              </div>
            </div>
          </div>

          {/* ─── PORTFOLIO GRID DECK ─── */}
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "45px 30px", 
              flex: 1, 
              overflowY: "auto", 
              padding: "50px 50px 30px 50px",
              alignContent: "start"
            }} 
            className="custom-scrollbar"
          >
            {sortedForms.map((card: any, idx: number) => {
              const posMeta = getDraftingPositionMeta(idx);
              const isDropdownOpen = openDropdownId === card.id;
              const responseVol = card.totalResponses || card.count || 0;

              return (
                <div
                  key={card.id}
                  onClick={() => router.push(`/dashboard/forms/${card.id}/analytics`)}
                  style={{
                    position: "relative",
                    backgroundColor: "#fffdfa",
                    border: "1.5px solid #2d2416",
                    borderRadius: "0px 16px 16px 16px",
                    padding: "24px 20px 16px 20px",
                    transform: `rotate(${posMeta.clipAngle})`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "215px",
                    boxSizing: "border-box",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease"
                  }}
                  className="blueprint-folder-hover"
                >
                  {/* Folder Tab Cutout Attached on Top-Left Edge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-25px",
                      left: "-1.5px",
                      height: "25px",
                      width: "120px",
                      backgroundColor: posMeta.tabColor,
                      border: "1.5px solid #2d2416",
                      borderBottom: "none",
                      borderRadius: "8px 12px 0px 0px",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "12px",
                      boxSizing: "border-box"
                    }}
                  >
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: 900, color: "#2d2416", letterSpacing: "0.05em" }}>
                      DOSSIER #{idx + 101}
                    </span>
                  </div>

                  {/* Colored Highlight Technical Blueprint Margin Line */}
                  <div style={{ position: "absolute", left: "10px", top: 0, bottom: 0, width: "1px", borderLeft: `1px dashed ${posMeta.markerColor}`, opacity: 0.5 }} />

                  {/* Top Content Row: Title Info Stack */}
                  <div style={{ paddingLeft: "8px", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                      <h4 
                        style={{ 
                          margin: "0 0 4px 0", 
                          fontFamily: "'Caveat', cursive", 
                          fontSize: "22px", 
                          fontWeight: 800, 
                          color: "#2d2416", 
                          lineHeight: 1.1, 
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: "48px", 
                        }}
                      >
                        {card.title}
                      </h4>
                    </div>
                    
                    <span style={{ fontSize: "10px", color: "rgba(45,36,22,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                      {card.status || "Draft"} — {card.visibility || "public"}
                    </span>
                  </div>

                  {/* Middle Segment: Big Analytics Summary Visual Counter */}
                  <div style={{ paddingLeft: "8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "8px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "28px", fontWeight: 500, color: "#2d2416", lineHeight: 1, fontFamily: "'Caveat', cursive", marginBottom:"4px", marginTop:"4px" }}>
                        {responseVol}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Users size={12} /> Total Captured
                      </span>
                    </div>

                    {/* Micro Sparkline Indicator Vector */}
                    <div style={{ width: "80px", height: "30px", opacity: 0.7, paddingBottom: "4px" }}>
                      <svg width="100%" height="100%" viewBox="0 0 80 30" fill="none">
                        <path 
                          d={responseVol > 50 ? "M0 25 L20 20 L40 10 L60 15 L80 2" : "M0 25 L20 23 L40 18 L60 20 L80 12"} 
                          stroke={posMeta.markerColor} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                        <path 
                          d={responseVol > 50 ? "M0 25 L20 20 L40 10 L60 15 L80 2 L80 30 L0 30 Z" : "M0 25 L20 23 L40 18 L60 20 L80 12 L80 30 L0 30 Z"} 
                          fill={posMeta.tabColor} 
                          opacity="0.3" 
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Segment: Micro Metric Footers */}
                  <div style={{ paddingLeft: "8px", borderTop: "1px dashed rgba(45,36,22,0.12)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "rgba(45,36,22,0.4)" }}>
                      <Clock size={11} />
                      <span>{card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : "Recently"}</span>
                    </div>
                    
                    <div 
                      style={{ 
                        width: "24px", height: "24px", borderRadius: "50%", border: "1.2px solid #2d2416", 
                        display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: posMeta.tabColor,
                        boxShadow: "1.5px 1.5px 0px #2d2416"
                      }}
                      className="blueprint-arrow-btn"
                    >
                      <TrendingUp size={11} color="#2d2416" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM SUMMARY CONTROLS FOOTER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "15px", borderTop: "1px dashed rgba(45,36,22,0.15)" }}>
            <span style={{ fontSize: "12px", color: "rgba(45,36,22,0.5)", fontWeight: 700 }}>
              Drafting Desk Capacity: {sortedForms.length} architectural dossier records active
            </span>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "15px", color: "#7c4dff", fontWeight: "bold" }}>
              * Select a drawing module portfolio to view complete data vectors
            </span>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .blueprint-folder-hover:hover {
          transform: scale(1.015) rotate(0deg) !important;
        }
        .blueprint-folder-hover:hover .blueprint-arrow-btn {
          transform: translate(-0.5px, -0.5px);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(45,36,22,0.18); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(45,36,22,0.35); }
      `}} />
    </div>
  );
}

// ─── BLUEPRINT SKELETON LOADER CONTAINER ───
function BlueprintFolderSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "rgba(254,251,245,0.4)", border: "1.5px dashed rgba(45,36,22,0.2)", borderRadius: "0 16px 16px 16px",
        padding: "24px 20px 16px 20px", height: "215px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box"
      }}
    >
      <div>
        <div style={{ width: "55%", height: "12px", backgroundColor: "rgba(45,36,22,0.08)", borderRadius: "4px", marginBottom: "8px", animation: "sketchLineShimmer 1.6s infinite linear" }} />
        <div style={{ width: "30%", height: "8px", backgroundColor: "rgba(45,36,22,0.04)", borderRadius: "3px" }} />
      </div>
      <div style={{ width: "40%", height: "24px", backgroundColor: "rgba(45,36,22,0.06)", borderRadius: "4px" }} />
      <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(45,36,22,0.03)", borderRadius: "2px" }} />
    </div>
  );
}

function SketchError({ message }: { message: string }) {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fdf8f0" }}>
      <div style={{ position: "relative", border: "1.5px solid #f4c2b0", borderRadius: "12px", padding: "32px 40px", backgroundColor: "#fff9f7", transform: "rotate(-1deg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", maxWidth: "360px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e64a19" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#2d2416", margin: 0, fontFamily: "'Caveat', cursive" }}>System Sketch Error</h3>
        <p style={{ fontSize: "13px", color: "rgba(45,36,22,0.6)", margin: 0, textAlign: "center" }}>{message}</p>
      </div>
    </div>
  );
}