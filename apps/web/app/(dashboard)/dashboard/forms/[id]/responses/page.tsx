"use client";

import React, { use, useState, useMemo, useEffect } from "react";
import Sidebar from "~/components/Sidebar";
import { ArrowLeft, Trash2, Calendar } from "lucide-react";
import { useFormDetail } from "~/hooks/api/forms";
// import { useResponseList, useDeleteResponse, useResponseDetail } from "~/hooks/api";
import { useResponseList,useDeleteResponse, useResponseDetail } from "~/hooks/api/responses";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Field {
  id: string;
  type: string;
  label: string;
  config: { options?: string[]; max?: number } | null;
}

interface UserResponse {
  id: string;
  formId: string;
  isComplete: boolean;
  timeToCompleteMs: number;
  createdAt: string;
  emailAnswer: string;
  nameAnswer: string;
}

interface AllFormsTableProps {
  filteredResponses: UserResponse[];
  paginatedResponses: UserResponse[];

  responses: UserResponse[];

  selectedStatus: string;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;

  checkedRecords: Record<string, boolean>;
  setCheckedRecords: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;

  toggleSelectAll: () => void;

  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  totalPages: number;
  itemsPerPage: number;

  activeInspectionRecord: UserResponse | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;

  deleteResponse: any;
}

// ─── LOADING STATE ───────────────────────────────────────────────────────────
function SketchLoading() {
  return (
    <div 
      style={{ 
        width: "100vw", 
        height: "100vh", 
        position: "fixed", 
        top: 0, 
        left: 0, 
        backgroundColor: "#fdf6ed", // Matches your warm scribble canvas base tone
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        zIndex: 99999
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        
        {/* Playful Mechanical Drawing Vector Frame */}
        <div style={{ position: "relative", width: "80px", height: "80px" }}>
          
          {/* Static Hand-drawn Layout Target Crosshairs */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80" 
            fill="none" 
            style={{ position: "absolute", inset: 0, opacity: 0.25 }}
          >
            <circle cx="40" cy="40" r="34" stroke="#2d2416" strokeWidth="1" strokeDasharray="3 6" />
            <line x1="40" y1="2" x2="40" y2="78" stroke="#2d2416" strokeWidth="0.8" strokeDasharray="4 4" />
            <line x1="2" y1="40" x2="78" y2="40" stroke="#2d2416" strokeWidth="0.8" strokeDasharray="4 4" />
          </svg>

          {/* Animated Nib Quill Tracker Element */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80" 
            fill="none" 
            style={{ 
              position: "absolute", 
              inset: 0, 
              animation: "quillOrbit 2.2s infinite ease-in-out" 
            }}
          >
            {/* Ink drop bleed trail */}
            <circle cx="40" cy="12" r="3" fill="#9462f5" opacity="0.4" />
            
            {/* The Sketched Fountain Pen Tip Assembly */}
            <g transform="translate(40, 12) rotate(45) translate(-6, -18)">
              {/* Metal Nib Body */}
              <path 
                d="M 6 0 L 12 14 L 10 24 L 2 24 L 0 14 Z" 
                fill="#fffdf9" 
                stroke="#2d2416" 
                strokeWidth="1.5" 
                strokeLinejoin="round" 
              />
              {/* Nib Breather Hole Detail */}
              <circle cx="6" cy="12" r="1.2" fill="#9462f5" stroke="#2d2416" strokeWidth="0.8" />
              {/* Slit Line split */}
              <line x1="6" y1="0" x2="6" y2="11" stroke="#2d2416" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

        {/* Text Messaging Frame */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
          <p 
            style={{ 
              fontFamily: "'Caveat', cursive", 
              fontSize: "26px", 
              fontWeight: 900, 
              color: "#2d2416", 
              margin: 0,
              letterSpacing: "0.5px" 
            }}
          >
            Scribbling your response...
          </p>
          <p 
            style={{ 
              fontFamily: "'Nunito', sans-serif", 
              fontSize: "12px", 
              fontWeight: 700, 
              color: "rgba(45, 36, 22, 0.4)", 
              margin: 0 
            }}
          >
            Binding ink patterns onto workspace database servers
          </p>
        </div>

        {/* Dynamic Keyframe Injection mapping local center anchors exactly */}
        <style>{`
          @keyframes quillOrbit {
            0% { transform-origin: 40px 40px; transform: rotate(0deg); }
            50% { transform-origin: 40px 40px; transform: rotate(180deg) scale(0.95); }
            100% { transform-origin: 40px 40px; transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── ERROR BOUNDARY STATE ─────────────────────────────────────────────────────
function SketchError({ message }: { message: string }) {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", top: 0, left: 0, backgroundImage: "url('/BG_2.png')", backgroundSize: "100% 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ border: "1.5px solid #2d2416", padding: "24px 32px", borderRadius: "16px", backgroundColor: "#fff5f3", boxShadow: "4px 4px 0px #2d2416", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", color: "#e64a19", margin: "0 0 8px 0" }}>Scribble Error!</h3>
        <p style={{ fontSize: "13px", fontFamily: "'Nunito', sans-serif", color: "rgba(45,36,22,0.6)", margin: 0 }}>{message}</p>
      </div>
    </div>
  );
}

// ─── RESPONSE GROWTH KPI CARD ────────────────────────────────────────────────
function ResponseKPICard({ 
  label, value, percentage, sublabel, bg, strokeColor, innerIcon, trendIcon, trendColor 
}: { 
  label: string; 
  value: string; 
  percentage?: string;
  sublabel: string; 
  bg: string; 
  strokeColor: string;
  innerIcon: React.ReactNode;
  trendIcon: "up" | "down";
  trendColor: string;
}) {
  return (
    <div style={{ 
      backgroundColor: bg, 
      borderRadius: "16px", 
      padding: "16px 20px", 
      display: "flex", 
      flexDirection: "column", 
      flex: 1, 
      height: "135px",
      position: "relative",
      boxSizing: "border-box",
      filter: "drop-shadow(3px 4px 6px rgba(45, 36, 22, 0.06))"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
        <div style={{ 
          width: "43px", 
          height: "43px", 
          borderRadius: "50%", 
          backgroundColor: bg, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          border: `1.2px solid ${strokeColor}`,
          flexShrink: 0 ,
          marginBottom:"28px"
        }}>
          {innerIcon}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "2px", marginLeft: "12px" }}>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", fontWeight: 500, color: "#2d2416" }}>
            {label}
          </span>
          <span style={{ fontSize: "28px", fontWeight: "400", color: "#1a150e", fontFamily: "'Caveat', cursive", lineHeight: 1.1, marginTop: "12px" }}>
            {value}
          </span>
          {percentage && (
            <span style={{ fontSize: "12px", fontWeight: "800", color: trendColor, fontFamily: "'Caveat', cursive", marginTop: "3px" }}>
              {percentage}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginLeft: "62px", display: "flex", alignItems: "center", gap: "4px", marginTop: percentage ? "6px" : "16px", fontSize: "11px", fontWeight: "700", color: "rgba(45,36,22,0.55)", fontFamily: "'Caveat', cursive" }}>
        <span style={{ color: trendColor, fontSize: "12px", fontWeight: "900", display: "inline-flex", alignItems: "center" }}>
          {trendIcon === "up" ? "↑" : "↓"}
        </span>
        <span>{sublabel}</span>
      </div>
    </div>
  );
}

// ─── LEFTHAND COMPONENT COLUMN TABLE DETACHED SUB-BLOCK ───────────────────────
function AllFormsTable({
  filteredResponses,
  paginatedResponses,

  responses,
  selectedStatus,
  setSelectedStatus,

  checkedRecords,
  setCheckedRecords,
  toggleSelectAll,

  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,

  activeInspectionRecord,
  setSelectedId,
  deleteResponse
}: AllFormsTableProps) {
  return (
    <div 
      style={{ 
        backgroundColor: "#FFFDF9", 
        borderRadius: "16px", 
        padding: "16px 20px", 
        display: "flex", 
        flexDirection: "column", 
        height: "100%", 
        boxSizing: "border-box",
        filter: "drop-shadow(3px 4px 6px rgba(45, 36, 22, 0.06))",
        fontFamily: "'Caveat', cursive", 
      }}
    >
      <div style={{ display: "flex", gap: "24px", borderBottom: "1.2px solid rgba(45,36,22,0.1)", paddingBottom: "10px", marginBottom: "12px", fontSize: "13px", fontWeight: "bold", fontFamily: "'Caveat', cursive"}}>
        <div style={{ position: "relative", color: selectedStatus === "All Status" ? "#2d2416" : "rgba(45,36,22,0.4)", cursor: "pointer" }} onClick={() => setSelectedStatus("All Status")}>
          <span>All Responses ({responses.length})</span>
          {selectedStatus === "All Status" && (
            <svg width="110" height="6" viewBox="0 0 110 6" fill="none" style={{ position: "absolute", bottom: "-11px", left: 0 }}>
              <path d="M 2 3 C 30 5, 75 1.5, 108 3.5 M 12 4 C 45 4.5, 80 3, 98 4" stroke="#634cc9" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span style={{ color: selectedStatus === "Completed" ? "#2d2416" : "rgba(45,36,22,0.4)", cursor: "pointer" }} onClick={() => setSelectedStatus("Completed")}>
          Completed ({responses.filter(r => r.isComplete).length})
        </span>
        <span style={{ color: selectedStatus === "In Progress" ? "#2d2416" : "rgba(45,36,22,0.4)", cursor: "pointer" }} onClick={() => setSelectedStatus("In Progress")}>
          In Progress ({responses.filter(r => !r.isComplete).length})
        </span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", width: "100%" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(45,36,22,0.12)", color: "rgba(45,36,22,0.5)", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>
              <th style={{ padding: "8px 12px" }}>Respondent</th>
              <th style={{ padding: "8px 12px" }}>Status</th>
              <th style={{ padding: "8px 12px" }}>Submitted</th>
              <th style={{ padding: "8px 12px", textAlign: "end" }}><div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "4px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div></th>
            </tr>
          </thead>
          <tbody>
            {paginatedResponses.map((res: UserResponse) => (
              <tr 
                key={res.id} 
                onClick={() => setSelectedId(res.id)}
                style={{ borderBottom: "1px dashed rgba(45,36,22,0.06)", backgroundColor: activeInspectionRecord?.id === res.id ? "#FCF6EE" : "transparent", cursor: "pointer" }}
              >
                <td style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fdf3dc", border: "1.2px solid #2d2416", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", color: "#2d2416", flexShrink: 0 }}>
                    {res.nameAnswer?.charAt(0) || "R"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: "800", color: "#1a150e", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "180px", fontFamily: "'Nunito', sans-serif" }}>{res.nameAnswer || "Rohan Sharma"}</div>
                    <div style={{ fontSize: "10px", color: "rgba(45,36,22,0.5)", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "180px" }}>{res.emailAnswer}</div>
                  </div>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "bold", backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid rgba(46,125,50,0.18)" }}>Completed</span>
                </td>
                <td style={{ padding: "8px 12px", color: "#2d2416", fontSize: "11px", fontWeight: 600 }}>
                  <div style={{ fontWeight: "bold" }}>May 16, 2026</div>
                  <div style={{ fontSize: "10px", color: "rgba(45,36,22,0.4)" }}>10:24 AM</div>
                </td>
                <td style={{ textAlign: "end", paddingRight: "10px" }}>
                  <button onClick={(e) => { e.stopPropagation(); deleteResponse.mutate(res.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(45,36,22,0.4)" }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1.2px solid rgba(45,36,22,0.08)", marginTop: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage((p: number) => Math.max(p - 1, 1))} 
            style={{ border: "none", background: "transparent", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "bold", color: "#2d2416", opacity: currentPage === 1 ? 0.35 : 1, display: "flex", alignItems: "center" }}
          >
            ←
          </button>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
              const pageIndexNode = idx + 1;
              const isSelected = currentPage === pageIndexNode;
              return (
                <div 
                  key={pageIndexNode} 
                  onClick={() => typeof setCurrentPage === "function" && setCurrentPage(pageIndexNode)} 
                  style={{ 
                    width: "24px", 
                    height: "24px", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    border: isSelected ? "1.5px solid #634cc9" : "1px solid transparent", 
                    fontSize: "12px", 
                    fontWeight: "bold", 
                    cursor: "pointer", 
                    backgroundColor: isSelected ? "#e0d4f7" : "transparent", 
                    color: "#2d2416" 
                  }}
                >
                  {pageIndexNode}
                </div>
              );
            })}
            {totalPages > 5 && <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.4)", fontWeight: "bold" }}>... {totalPages}</span>}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage((p: number) => Math.min(p + 1, totalPages))} 
            style={{ border: "none", background: "transparent", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "bold", color: "#2d2416", opacity: currentPage === totalPages ? 0.35 : 1, display: "flex", alignItems: "center" }}
          >
            →
          </button>
        </div>

        <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.45)", fontWeight: "700", fontFamily: "'Nunito', sans-serif" }}>
          Showing {Math.min(filteredResponses.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredResponses.length, currentPage * itemsPerPage)} of {filteredResponses.length}
        </span>
      </div>
    </div>
  );
}

// ─── SYSTEM MAIN CONTAINER INTERFACE ─────────────────────────────────────────
export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedRecords, setCheckedRecords] = useState<Record<string, boolean>>({});
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [scale, setScale] = useState(0.8);

  // Dynamic Resolution Monitor Matrix Hook
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1525; // Base window breakpoint where 0.8 scale fits beautifully
      const currentWidth = window.innerWidth;
      const calculatedScale = (currentWidth / baseWidth) * 0.8;
      setScale(Math.max(calculatedScale, 0.45)); // Safe-clamp boundary limit
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: formDetails, isLoading: formLoading, isError: formError } = useFormDetail(formId);
  const { data: responseData, isLoading: responseLoading, isError: responseError } = useResponseList(formId);
  const deleteResponse = useDeleteResponse(formId);

  const responses = useMemo<UserResponse[]>(() => {
    if (!responseData?.pages) return [];
    return responseData.pages.flatMap((p: any) => p.responses ?? []);
  }, [responseData]);

  const totalResponsesCount = responseData?.pages[0]?.total ?? responses.length;

  // FIX: filter now respects both search AND status dropdown
  // selectedStatus: "All Status" | "Completed" | "In Progress"
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      // Search filter
      const matchesSearch = !searchQuery ||
        r.nameAnswer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.emailAnswer?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter — based on real isComplete field from API
      const matchesStatus =
        selectedStatus === "All Status" ||
        (selectedStatus === "Completed"   &&  r.isComplete) ||
        (selectedStatus === "In Progress" && !r.isComplete);

      return matchesSearch && matchesStatus;
    });
  }, [responses, searchQuery, selectedStatus]);

  const itemsPerPage = 8; 
  const totalPages = Math.max(Math.ceil(filteredResponses.length / itemsPerPage), 1);
  
  const paginatedResponses = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredResponses.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredResponses, currentPage]);

  // FIX: was showing hardcoded fake answers. Now fetches the real response detail
  // (including all answers) when a response is selected in the table.
  const activeId = selectedId ?? paginatedResponses[0]?.id ?? null;
  const { data: responseDetail, isLoading: detailLoading } = useResponseDetail(activeId ?? "", !!activeId);

  const activeInspectionRecord = useMemo(() => {
    if (activeId) return responses.find(r => r.id === activeId) || null;
    return paginatedResponses[0] || null;
  }, [responses, activeId, paginatedResponses]);

  const toggleSelectAll = () => {
    const allCheckedOnPage = paginatedResponses.length > 0 && paginatedResponses.every(r => checkedRecords[r.id]);
    const updated = { ...checkedRecords };
    paginatedResponses.forEach(r => { updated[r.id] = !allCheckedOnPage; });
    setCheckedRecords(updated);
  };

  if (formLoading || responseLoading) return <SketchLoading />;
  if (formError || responseError) return <SketchError message="Could not compile form submission nodes." />;

  return (
    <div style={{
      width: "100vw", height: "100vh",
      backgroundImage: "url('/response/BG(2).png')", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat",
      position: "fixed", top: 0, left: 0, overflow: "hidden", boxSizing: "border-box", fontFamily: "'Nunito', sans-serif"
    }}>
      {/* ── INTERNAL DYNAMIC RESPONSIVE WRAPPER ── */}
      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "1920px",        // Fixed virtual coordinate plane coordinates
        height: "1080px",       
        display: "flex", 
        transform: `scale(${scale})`, 
        transformOrigin: "top left", 
        overflow: "hidden" 
      }}>
        
        {/* SIDEBAR NAVIGATION BLOCK */}
        <div style={{ width: "240px", height: "100%", paddingLeft: "65px", paddingTop: "24px", flexShrink: 0 }}>
          <Sidebar activeTab="Responses" />
        </div>

        {/* RECONSTRUCTED CENTRAL DATA GRID */}
        <div style={{ flex: 1, height: "100%", padding: "45px 50px 60px 140px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
          
          {/* ── UPPER CONTROLS ACTION LAYER ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "1220px", marginBottom: "35px", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(45,36,22,0.6)", fontSize: "14px", fontWeight: 700, cursor: "pointer" }} onClick={() => window.history.back()}>
              <ArrowLeft size={16} /> Back to Dashboard
            </div>

            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Caveat', cursive", fontSize: 16, fontWeight: 600, cursor: "pointer", border: "none", background: "transparent", position: "relative", padding: "6px 14px" }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} viewBox="0 0 110 38" fill="none" preserveAspectRatio="none">
                <path d="M6 4 Q8 2 30 2.5 Q55 3 80 2 Q100 1.5 106 4 Q110 6 109 10 Q110 22 108 32 Q106 37 100 36.5 Q75 37.5 50 37 Q25 36.5 10 37 Q4 37 3 33 Q1 28 2 18 Q1 8 6 4Z" fill="#e0d4f7" stroke="#2d2416" strokeWidth="1.5"/>
              </svg>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ position: "relative", zIndex: 1 }}>
                <path d="M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 16h12" strokeLinecap="round"/>
              </svg>
              <span style={{ position: "relative", zIndex: 1, color: "#2d2416", fontWeight: "100" }}>Export</span>
            </button>
          </div>

          {/* ── KPI GRID ROW CONTAINER ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 320px)", gap: "26px", marginBottom: "20px", width: "1220px", boxSizing: "border-box", position: "relative" }}>
            {/* FLOATING HANGING BOY ARTWORK */}
            <div style={{ position: "absolute", top: "-175px", left: "425px", zIndex: 10, pointerEvents: "none" }}>
              <img src="/response/ropBoy.png" alt="Hanging Boy" style={{ width: "390px", height: "240px", mixBlendMode: "darken" }} />
            </div>

            <ResponseKPICard 
              label="Total Responses" 
              value={totalResponsesCount.toLocaleString()} 
              sublabel={`${responses.length} loaded`}
              trendIcon="up"
              trendColor="#2e7d32"
              bg="#e8e5f9"
              strokeColor="#9b8fdf"
              innerIcon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#634cc9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              } 
            />

            <ResponseKPICard 
              label="Completed" 
              value={responses.filter(r => r.isComplete).length.toLocaleString()}
              percentage={responses.length > 0 ? `${Math.round((responses.filter(r => r.isComplete).length / responses.length) * 100)}%` : "0%"}
              sublabel="completion rate"
              trendIcon="up"
              trendColor="#2e7d32"
              bg="#e8f5e9"
              strokeColor="#74c99a"
              innerIcon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" strokeWidth="2" />
                </svg>
              } 
            />

            <ResponseKPICard 
              label="In Progress" 
              value={responses.filter(r => !r.isComplete).length.toLocaleString()}
              percentage={responses.length > 0 ? `${Math.round((responses.filter(r => !r.isComplete).length / responses.length) * 100)}%` : "0%"}
              sublabel="of all responses"
              trendIcon="down"
              trendColor="#ef6c00"
              bg="#fff3e0"
              strokeColor="#f5a623"
              innerIcon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef6c00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 15 15" /><circle cx="12" cy="12" r="1" fill="#ef6c00" /></svg>} 
            />

            <ResponseKPICard 
              label="Avg. Time" 
              value={(() => {
                const withTime = responses.filter(r => r.timeToCompleteMs && r.timeToCompleteMs > 0);
                if (!withTime.length) return "—";
                const avg = withTime.reduce((s, r) => s + (r.timeToCompleteMs ?? 0), 0) / withTime.length;
                const m = Math.floor(avg / 60000);
                const s2 = Math.floor((avg % 60000) / 1000);
                return m > 0 ? `${m}m ${s2}s` : `${s2}s`;
              })()}
              percentage={`${responses.filter(r => r.timeToCompleteMs && r.timeToCompleteMs > 0).length} timed`}
              sublabel="avg time to complete"
              trendIcon="up"
              trendColor="#c62828"
              bg="#ffebee"
              strokeColor="#e87777"
              innerIcon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} 
            />
          </div>

          {/* ── QUICK SELECTION FILTERING SHELF ── */}
          <div style={{ position: "relative", padding: "10px 14px", marginBottom: "20px", marginTop: "12px", width: "1340px", display: "flex", alignItems: "center", boxSizing: "border-box", height:"58px", fontFamily: "'Caveat', cursive" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1220 52" preserveAspectRatio="none" fill="none">
              <path d="M3 4 C400 1.5, 800 3.5, 1217 3 C1219.5 10, 1218.5 26, 1217.5 48 C850 49.5, 400 48.5, 4 49 C1.5 36, 2 22, 3 4 Z" stroke="#5a4a30" strokeWidth="1.2" fill="none" strokeOpacity="0.6" />
              <path d="M4 6 Q25 3 350 4 T800 3 T1216 5 Q1218 12 1217 28 T1216 46 Q1180 49 850 48 T250 49 T5 45 Q2 30 3 24 Z" stroke="#5a4a30" strokeWidth="0.8" fill="none" strokeOpacity="0.3"/>
            </svg>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%", position: "relative", zIndex: 1 }}>
              <div style={{ position: "relative", width: 250, height: 38 }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 250 34" fill="none" preserveAspectRatio="none">
                  <path d="M4 4 Q40 2, 125 2.5 T246 4 Q249 8, 248 17 T246 30 Q190 32, 125 31.5 T4 29 Q1 20, 2 17 Z" fill="#fffcf7" stroke="#2d2416" strokeWidth="0.8" opacity="0.3"/>
                </svg>
                <svg style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 2 }} width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#5a4a30" strokeWidth="1.8" opacity="0.7">
                  <circle cx="9" cy="9" r="6"/><path d="M14 14l4 4" strokeLinecap="round"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search responses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", position: "relative", zIndex: 1, paddingLeft: 44, paddingRight: 10, fontSize: 13, fontWeight: 600, color: "#2d2416", fontFamily: "'Caveat', cursive" }} 
                />
              </div>

              <div style={{ position: "relative", height: 38, width: 150 }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 140 34" fill="none" preserveAspectRatio="none">
                  <path d="M4 3 Q25 2, 70 2.5 T136 4 Q138 8, 137 17 T136 30 Q100 31.5, 55 31 T4 29 Q2 20, 3 17 Z" fill="#fffcf7" stroke="#2d2416" strokeWidth="0.8" opacity="0.3"/>
                </svg>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ width: "100%", height: "100%", background: "transparent", border: "none", outline: "none", position: "relative", zIndex: 1, padding: "0 24px 0 12px", fontFamily: "'Caveat', cursive", fontSize: 13, fontWeight: 700, color: "#2d2416", appearance: "none", cursor: "pointer" }}
                >
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Unstarted</option>
                </select>
                <div style={{ position: "absolute", right: 12, top: "54%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 2 }}>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#5a4a30" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1l4 4 4-4" /></svg>
                </div>
              </div>

              <div style={{ fontFamily: "'Caveat', cursive", position: "relative", height: 38, width: 180 }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 180 34" fill="none" preserveAspectRatio="none">
                  <path d="M3 4 Q40 2, 95 2.5 T176 4 Q178 8, 177 17 T176 30 Q120 32, 75 31.5 T4 29 Q2 20, 3 17 Z" fill="#fffcf7" stroke="#2d2416" strokeWidth="0.8" opacity="0.3"/>
                </svg>
                <div style={{ width: "100%", height: "100%", position: "relative", zIndex: 1, display: "flex", alignItems: "center", padding: "0 12px", gap: 6, fontSize: 12, fontWeight: 600, color: "#2d2416" }}>
                  <Calendar size={13} style={{ color: "#5a4a30" }} />
                  <span>May 10 – May 16</span>
                </div>
              </div>

              <div style={{ position: "relative", height: 38, width: 160, marginLeft: "auto" }}>
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 130 34" fill="none" preserveAspectRatio="none">
                  <path d="M4 4 Q30 2, 80 2.5 T120 4 Q122 8, 121 17 T120 30 Q85 32, 50 31.5 T4 29 Q2 20, 3 17 Z" fill="transparent" stroke="#2d2416" strokeWidth="0.8" opacity="0.4"/>
                </svg>
                <button style={{ width: "100%", height: "100%", border: "none", background: "transparent", position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Nunito', sans-serif", letterSpacing: 0.5, fontSize: 13, fontWeight: 700, color: "#2d2416", cursor: "pointer" }}>
                  <span>More Filters</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 6h12M6 10h8M8 14h4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── DATA GRID CONTAINMENT ZONE ── */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "860px 470px", 
            gap: "30px", 
            width: "1350px", 
            height: "560px", 
            maxHeight: "560px",
            overflow: "hidden"
          }}>
            
            {/* Left Side Container (Table Scroll) */}
            <div className="custom-scribble-scroll" style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <AllFormsTable
  filteredResponses={filteredResponses}
  paginatedResponses={paginatedResponses}

  responses={responses}

  selectedStatus={selectedStatus}
  setSelectedStatus={setSelectedStatus}

  checkedRecords={checkedRecords}
  setCheckedRecords={setCheckedRecords}

  toggleSelectAll={toggleSelectAll}

  currentPage={currentPage}
  setCurrentPage={setCurrentPage}

  totalPages={totalPages}
  itemsPerPage={itemsPerPage}

  activeInspectionRecord={activeInspectionRecord}
  setSelectedId={setSelectedId}

  deleteResponse={deleteResponse}
/>
            </div>

            {/* Right Side Detail Card */}
            <div style={{ backgroundColor: "#FFFDF9", border: "1px solid #fff", borderRadius: "14px", padding: "20px", filter: "drop-shadow(3px 4px 6px rgba(45, 36, 22, 0.06))", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative", overflowX: "visible", overflowY: "hidden" }}>
              <div style={{ position: "absolute", top: "-10px", left: "40%", width: "60px", height: "16px", backgroundColor: "#d1c4e9", opacity: 0.7, transform: "rotate(-2deg)" }} />
              
              {activeInspectionRecord ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px dashed #2d2416", paddingBottom: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#ede8f9", border: "1px solid #2d2416", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {activeInspectionRecord.nameAnswer?.charAt(0) || "S"}
                    </div>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#2d2416", fontSize: "14px" }}>{activeInspectionRecord.nameAnswer}</div>
                      <div style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)" }}>{activeInspectionRecord.emailAnswer}</div>
                    </div>
                    <span style={{ marginLeft: "auto", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid #2d2416" }}>Completed</span>
                  </div>

                  <div style={{ display: "flex", gap: "24px", fontSize: "11px", color: "rgba(45,36,22,0.6)", marginBottom: "14px" }}>
                    <div><strong>Submitted on:</strong><br />{new Date(activeInspectionRecord.createdAt).toLocaleString()}</div>
                    <div><strong>Time Taken:</strong><br />{activeInspectionRecord.timeToCompleteMs ? `${Math.round(activeInspectionRecord.timeToCompleteMs / 1000)}s` : "—"}</div>
                  </div>

                  {/* FIX: was showing hardcoded fake answers. Now reads from responseDetail.answers
                      which contains the real submitted values, joined with the form field labels. */}
                  <div className="custom-scribble-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "8px", fontFamily: "'Caveat', cursive" }}>
                    {detailLoading ? (
                      <div style={{ textAlign: "center", color: "rgba(45,36,22,0.4)", fontSize: "14px", paddingTop: "20px" }}>Loading answers...</div>
                    ) : responseDetail?.answers?.length ? (
                      responseDetail.answers.map((ans: any, i: number) => {
                        // Look up the field label from the form's current fields
                        const field = formDetails?.fields?.find((f: any) => f.id === ans.fieldId);
                        const label = field?.label ?? `Field ${i + 1}`;
                        const fieldType = ans.fieldType ?? field?.type ?? "short_text";

                        // Deserialize the stored answer value
                        let displayValue: string;
                        if (fieldType === "multi_select" && Array.isArray(ans.valueArray)) {
                          displayValue = ans.valueArray.join(", ") || "—";
                        } else if (fieldType === "rating" || fieldType === "number") {
                          displayValue = ans.valueNumber != null ? String(ans.valueNumber) : "—";
                        } else if (fieldType === "checkbox") {
                          displayValue = ans.valueText === "true" ? "✓ Checked" : "✗ Unchecked";
                        } else {
                          displayValue = ans.valueText ?? "—";
                        }

                        return (
                          <div key={ans.id ?? i} style={{ border: "1px solid rgba(45,36,22,0.1)", borderRadius: "8px", padding: "10px", backgroundColor: "#fff", filter: "drop-shadow(1px 2px 3px rgba(45,36,22,0.02))" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", color: "rgba(45,36,22,0.5)", marginBottom: "2px" }}>{i + 1}. {label}</div>
                            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#2d2416" }}>
                              {fieldType === "rating" ? (
                                <span>{Array.from({ length: Number(ans.valueNumber ?? 0) }).map(() => "⭐").join("")} {ans.valueNumber ?? 0}</span>
                              ) : (
                                displayValue
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: "center", color: "rgba(45,36,22,0.4)", fontSize: "14px", paddingTop: "20px" }}>No answers recorded for this response.</div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat', cursive", fontSize: "20px", color: "rgba(45,36,22,0.4)" }}>Select a response node to inspect answers</div>
              )}
            </div>

            {/* 🎨 Mini Injected Stylesheet for Organic Sketch Scrollbars */}
            <style>{`
              .custom-scribble-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scribble-scroll::-webkit-scrollbar-track {
                background: rgba(45, 36, 22, 0.04);
                border-radius: 10px;
              }
              .custom-scribble-scroll::-webkit-scrollbar-thumb {
                background-color: rgba(90, 74, 48, 0.4);
                border-radius: 10px;
              }
              .custom-scribble-scroll::-webkit-scrollbar-thumb:hover {
                background-color: rgba(90, 74, 48, 0.7);
              }
            `}</style>
          </div>

        </div>
      </div>
    </div>
  );
}