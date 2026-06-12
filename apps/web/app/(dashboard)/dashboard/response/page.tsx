"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "~/components/Sidebar"; 
import { Search, SlidersHorizontal, Plus, Eye, BarChart3, Link2, MoreHorizontal, Trash2, Copy, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { ScribbleButton } from "~/components/scribble/ScribbleButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormList, useCreateForm, useDeleteForm, useDuplicateForm } from "~/hooks/api/forms";

type ToastType = "success" | "error" | "info";
interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export default function FormPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All Forms");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Adjusted for standard data table row scannability rows per view window
  const cardsPerPage = 8;

  // ─── REAL BACKEND CONNECTION HOOKS ───
  const { data, isLoading, isError, error, refetch } = useFormList({ search: search || undefined });
  const createForm = useCreateForm();
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

  const getCardThemingMeta = (gridIndex: number) => {
    const assetLibrary = [
      { type: "bar", statusColor: "#e1f5fe", textColor: "#0288d1", tapeColor: "#ffccd5" },
      { type: "line", statusColor: "#e8f5e9", textColor: "#2e7d32", tapeColor: "#c8e6c9" },
      { type: "pie", statusColor: "#fff3e0", textColor: "#ef6c00", tapeColor: "#ffe0b2" },
      { type: "pencil", statusColor: "#f3e5f5", textColor: "#7b1fa2", tapeColor: "#e1bee7" },
      { type: "nps", statusColor: "#e8f5e9", textColor: "#2e7d32", tapeColor: "#ffccd5" },
      { type: "checkbox", statusColor: "#f3e5f5", textColor: "#7b1fa2", tapeColor: "#c5cae9" },
      { type: "wave", statusColor: "#fff3e0", textColor: "#ef6c00", tapeColor: "#ffccd5" },
      { type: "mail", statusColor: "#e8f5e9", textColor: "#2e7d32", tapeColor: "#c8e6c9" },
    ];
    return assetLibrary[gridIndex % assetLibrary.length];
  };

  const filteredForms = allForms.filter((form: any) => {
    const statusLower = form.status?.toLowerCase() || "draft";
    const visibilityLower = form.visibility?.toLowerCase() || "public";

    if (activeTab === "All Forms") return true;
    if (activeTab === "Drafts") return statusLower === "draft";
    if (activeTab === "Published") return statusLower === "published";
    if (activeTab === "Unlisted") return visibilityLower === "unlisted";
    return true;
  });

  const totalCount = allForms.length;
  const draftsCount = allForms.filter((f: any) => f.status?.toLowerCase() === "draft").length;
  const publishedCount = allForms.filter((f: any) => f.status?.toLowerCase() === "published").length;
  const unlistedCount = allForms.filter((f: any) => f.visibility?.toLowerCase() === "unlisted").length;

  const totalPages = Math.ceil(filteredForms.length / cardsPerPage) || 1;
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredForms.slice(indexOfFirstCard, indexOfLastCard);

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

  const handleDuplicateForm = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateForm.mutate(
      { id },
      {
        onSuccess: () => {
          showToast(`Duplicated "${title}" cleanly.`);
          refetch();
        },
        onError: (err: any) => showToast(err?.message || "Error copying form canvas.", "error")
      }
    );
  };

  const handleDeleteForm = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Wipe "${title}" from your sketches permanently?`)) {
      deleteForm.mutate(
        { id },
        {
          onSuccess: () => {
            showToast(`Discarded "${title}" layout container workspace.`, "info");
            refetch();
          },
          onError: (err: any) => showToast(err?.message || "Failed to wipe sketch document.", "error")
        }
      );
    }
  };

  const renderCardVisualSVG = (type: string) => {
    switch (type) {
      case "bar":
        return (
          <svg width="60" height="28" viewBox="0 0 70 35" fill="none" style={{ opacity: 0.75 }}>
            <line x1="0" y1="33" x2="70" y2="33" stroke="#2d2416" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="4" y="22" width="6" height="11" rx="1.5" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
            <rect x="14" y="16" width="6" height="17" rx="1.5" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
            <rect x="24" y="12" width="6" height="21" rx="1.5" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
            <rect x="34" y="18" width="6" height="15" rx="1.5" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
            <rect x="44" y="8" width="6" height="25" rx="1.5" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
          </svg>
        );
      case "line":
        return (
          <svg width="60" height="28" viewBox="0 0 75 35" fill="none" style={{ opacity: 0.85 }}>
            <line x1="0" y1="33" x2="75" y2="33" stroke="#2d2416" strokeWidth="1" strokeLinecap="round" />
            <path d="M4 28 Q16 14 26 24 T52 10 T70 4" fill="none" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="70" cy="4" r="2" fill="#2e7d32" />
          </svg>
        );
      case "pie":
        return (
          <svg width="32" height="32" viewBox="0 0 42 42" style={{ transform: "rotate(-45deg)" }}>
            <circle cx="21" cy="21" r="16" fill="#fffdf9" stroke="#2d2416" strokeWidth="1.2" />
            <path d="M21 21 L21 5 A16 16 0 0 1 37 21 Z" fill="#ffe0b2" stroke="#2d2416" strokeWidth="1" />
            <path d="M21 21 L37 21 A16 16 0 0 1 21 37 Z" fill="#fff3e0" stroke="#2d2416" strokeWidth="1" />
            <path d="M21 21 L21 37 A16 16 0 0 1 5 21 Z" fill="#c7b9ff" stroke="#2d2416" strokeWidth="1" />
          </svg>
        );
      case "pencil":
        return (
          <svg width="70" height="28" viewBox="0 0 80 35" fill="none">
            <line x1="2" y1="8" x2="50" y2="8" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="18" x2="45" y2="18" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" />
            <g transform="translate(56, 6) rotate(45)">
              <rect x="0" y="0" width="6" height="20" rx="1" fill="#fff" stroke="#2d2416" strokeWidth="1.2" />
              <path d="M0 0 L3 -5 L6 0 Z" fill="#fce09b" stroke="#2d2416" strokeWidth="1" />
            </g>
          </svg>
        );
      default:
        return (
          <svg width="60" height="28" viewBox="0 0 75 35" fill="none" style={{ opacity: 0.5 }}>
            <path d="M2 28 Q15 4 28 15 T56 8 T82 22" fill="none" stroke="#634cc9" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  if (isError) {
    return <SketchError message={error?.message || "Could not successfully sync your doodle canvas from workspace servers."} />;
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
      {/* ── ALERTS TOASTER SYSTEM ── */}
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
              minWidth: "265px", animation: "sketchToastIn 0.2s ease-out forwards"
            }}
          >
            {t.type === "error" ? <AlertCircle style={{ color: "#e64a19" }} size={16} /> : <CheckCircle2 style={{ color: "#2e7d32" }} size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN LAYOUT SCALING AREA ── */}
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
        <div
          style={{
            width: "240px",
            height: "100%",
            paddingLeft: "65px", 
            paddingTop: "24px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {/* SIDEBAR NAVIGATION UPDATE: Target responses explicitly */}
          <Sidebar activeTab="response" />
        </div>

        {/* MAIN DISPLAY VIEW */}
        <div
          style={{
            flex: 1,
            height: "100%",
            padding: "45px 60px 45px 170px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            overflow: "hidden", 
          }}
        >
          {/* HEADER SECTION */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "25px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#1a150e", fontFamily: "'Caveat', cursive" }}>
                  Form Responses Hub
                </h2>
                <span style={{ color: "#a78bfa", fontSize: "20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.9 }}>
                    <path d="M12 20.5S3 14 3 8.5A4.5 4.5 0 0 1 11.5 5.5c.2.3.4.7.5 1 .1-.3.3-.7.5-1A4.5 4.5 0 0 1 21 8.5c0 5.5-9 12-9 12z" fill="#a78bfa" fillOpacity="0.4" />
                    <path d="M12 21C11.5 20.6 3 14 3 8.5A4.5 4.5 0 0 1 11.5 5.5Q12 6.5 12.5 5.5A4.5 4.5 0 0 1 21 8.5C21 14 12.5 20.6 12 21Z" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "rgba(45, 36, 22, 0.6)", fontWeight: 500 }}>
                Select a form template container below to inspect logged endpoint entries.
              </p>
            </div>

            {/* Action controls panel alignment */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: "8px 36px 8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "13px",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    outline: "none",
                    width: "180px",
                  }}
                />
                <Search style={{ width: "16px", height: "16px", position: "absolute", right: "12px", color: "rgba(0,0,0,0.4)" }} />
              </div>

              {/* <ScribbleButton
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                  borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", backgroundColor: "rgba(255,255,255,0.6)",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}
              >
                <SlidersHorizontal style={{ width: "14px", height: "14px" }} /> Filter
              </ScribbleButton> */}

              <ScribbleButton
                onClick={handleCreateForm}
                disabled={createForm.isPending}
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                  borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", backgroundColor: "#c7b9ff",
                  color: "#1a150e", fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                  boxShadow: "2px 2px 0px rgba(0,0,0,0.15)",
                }}
              >
                <Plus style={{ width: "16px", height: "16px" }} /> {createForm.isPending ? "Doodling..." : "Create New Form"}
              </ScribbleButton>

              <div style={{ position: "absolute", top: "4px", left: "35px", width: "150px", height: "180px", pointerEvents: "none", zIndex: 20 }}>
                <Image src="/form/holdingBoy.png" alt="Scribble doodle character hanging down" fill priority style={{ objectFit: "contain" }} />
              </div>
            </div>
          </div>

          {/* TAB FILTERS ROW */}
          <div 
            style={{ 
              display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(45, 36, 22, 0.15)", 
              borderRadius: "10px", padding: "6px 8px", marginBottom: "25px", backgroundColor: "rgba(255, 255, 255, 0.4)",
              width: "max-content", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            {[
              { name: "All Forms", count: totalCount, activeBg: "#dcd4ff", activeColor: "#2d2416", circleBg: "transparent", circleBorder: "rgba(0,0,0,0.3)" },
              { name: "Drafts", count: draftsCount, activeBg: "#f3e5f5", activeColor: "#7b1fa2", circleBg: "#fff", circleBorder: "rgba(0,0,0,0.15)" },
              { name: "Published", count: publishedCount, activeBg: "#e8f5e9", activeColor: "#2e7d32", circleBg: "#fff", circleBorder: "rgba(46, 125, 50, 0.3)" },
              { name: "Unlisted", count: unlistedCount, activeBg: "#fff3e0", activeColor: "#ef6c00", circleBg: "#fff", circleBorder: "rgba(239, 108, 0, 0.3)" }
            ].map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => { setActiveTab(tab.name); setCurrentPage(1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 700,
                    color: isActive ? tab.activeColor : "rgba(45, 36, 22, 0.7)", cursor: "pointer",
                    backgroundColor: isActive ? tab.activeBg : "transparent", padding: "6px 16px",
                    borderRadius: "8px", border: isActive ? "1px solid rgba(0, 0, 0, 0.1)" : "1px solid transparent",
                    outline: "none", transition: "all 0.15s ease",
                  }}
                >
                  <span>{tab.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#2d2416", backgroundColor: tab.circleBg, border: `1px solid ${tab.circleBorder}`, borderRadius: "50%", width: "20px", height: "20px" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── ROW WISE CONTENT CARDS CANVAS STACK ─── */}
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, overflowY: "auto" }}>
              {Array.from({ length: 5 }).map((_, i) => <SketchRowSkeleton key={i} />)}
            </div>
          ) : currentCards.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed #c4b8a8", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.2)" }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", color: "#2d2416", opacity: 0.6, margin: "0 0 12px 0" }}>Empty sketch workspace pad!</p>
              <ScribbleButton onClick={handleCreateForm} style={{ padding: "8px 16px", backgroundColor: "#c7b9ff", borderRadius: "8px" }}>
                Add New Record Canvas
              </ScribbleButton>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, overflowY: "auto", paddingRight: "8px" }} className="custom-scrollbar">
              {currentCards.map((card: any, idx: number) => {
                const themeMeta = getCardThemingMeta(idx);
                const isDropdownOpen = openDropdownId === card.id;
                const statusLower = card.status?.toLowerCase() || "draft";
                const isPublished = statusLower === "published";

                return (
                  <div
                    key={card.id}
                    onClick={() => router.push(`/dashboard/forms/${card.id}/responses`)}
                    style={{
                      backgroundColor: "#fefbf5", 
                      border: "1px dashed rgba(45,36,22,0.25)", 
                      borderRadius: "12px",
                      padding: "14px 20px", 
                      position: "relative", 
                      boxShadow: "2px 3px 0px rgba(45,36,22,0.04)",
                      display: "flex", 
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "3px 5px 0px rgba(45,36,22,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "2px 3px 0px rgba(45,36,22,0.04)";
                    }}
                  >
                    {/* Left Vertical Binder Sticky Tape Element */}
                    <div
                      style={{
                        position: "absolute", left: "-6px", top: "25%", width: "12px", height: "36px",
                        backgroundColor: themeMeta.tapeColor, opacity: 0.6, transform: "rotate(-4deg)",
                        borderRadius: "2px"
                      }}
                    />

                    {/* Block 1: Main Title Info Structure */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "35%" }}>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#2d2416", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {card.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            backgroundColor: isPublished ? "#e8f5e9" : "#f3e5f5", 
                            color: isPublished ? "#2e7d32" : "#7b1fa2",
                            fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase",
                          }}
                        >
                          {card.status || "Draft"}
                        </span>
                        <span style={{ fontSize: "10px", color: "rgba(45,36,22,0.45)", textTransform: "lowercase" }}>
                          • {card.visibility || "public"}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.4)" }}>
                          • {card.updatedAt ? `Saved ${new Date(card.updatedAt).toLocaleDateString()}` : "Saved recently"}
                        </span>
                      </div>
                    </div>

                    {/* Block 2: Sparkline Abstract Visualization Frame */}
                    {/* <div style={{ width: "20%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {renderCardVisualSVG(themeMeta.type)}
                    </div> */}

                    {/* Block 3: Quantitative Response Data Badge */}
                    <div style={{ width: "20%", display: "flex", justifyContent: "center",marginLeft:"950px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid rgba(45,36,22,0.12)", padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(255,255,255,0.5)" }}>
                        <MessageSquare size={13} style={{ color: "rgba(45,36,22,0.5)" }} />
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#2d2416" }}>
                          {card.totalResponses || card.count || 0}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: 600 }}>entries</span>
                      </div>
                    </div>

                    {/* Block 4: Context Utilities Panel Control Layout */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "flex-end", width: "15%" }}>
                      <div style={{ display: "flex", gap: "12px", color: "rgba(45, 36, 22, 0.45)" }}>
                        <Link href={`/dashboard/forms/${card.id}/build`} onClick={(e) => e.stopPropagation()} style={{ color: "inherit" }} title="Form Builder">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="11" y1="13" x2="4" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="8.5" y1="15.5" x2="4.5" y2="19.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.2" />
                            <rect x="11.5" y="10.5" width="2" height="2" transform="rotate(45 12.5 11.5)" fill="currentColor" />
                            <g transform="rotate(45 14 10)">
                              <rect x="11" y="8" width="6" height="4" rx="1" fill="currentColor" />
                              <path d="M17 9 L19 9 L19 11 L17 11 Z" fill="currentColor" />
                              <path d="M19 8.5 L20 9 L20 11 L19 11.5 Z" fill="currentColor" opacity="0.7" />
                              <path d="M11 8.5 C8 8.5 6 10.5 5 13 C6.5 11.5 9 11 11 11.5 Z" fill="currentColor" />
                            </g>
                          </svg>
                        </Link>
                        <Link href={`/dashboard/forms/${card.id}/analytics`} onClick={(e) => e.stopPropagation()} style={{ color: "inherit" }} title="Analytics Dashboard"><BarChart3 size={14} /></Link>
                        <Link href={`/dashboard/forms/${card.id}/share`} onClick={(e) => e.stopPropagation()} style={{ color: "inherit" }} title="Share Links"><Link2 size={14} /></Link>
                      </div>

                      {/* <div style={{ position: "relative" }}>
                        <MoreHorizontal 
                          style={{ width: "16px", height: "16px", color: "rgba(45,36,22,0.4)", cursor: "pointer" }} 
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(isDropdownOpen ? null : card.id); }}
                        />
                        {isDropdownOpen && (
                          <div style={{ position: "absolute", top: "22px", right: 0, backgroundColor: "#fff", border: "1.5px solid #2d2416", borderRadius: "8px", boxShadow: "3px 3px 0px rgba(45,36,22,0.12)", zIndex: 100, minWidth: "120px", padding: "4px 0" }}>
                            <div 
                              onClick={(e) => handleDuplicateForm(card.id, card.title, e)}
                              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "12px", color: "#2d2416", cursor: "pointer" }}
                            >
                              <Copy size={12} /> Duplicate
                            </div>
                            <div 
                              onClick={(e) => handleDeleteForm(card.id, card.title, e)}
                              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", fontSize: "12px", color: "#dc2626", cursor: "pointer", borderTop: "1px dashed rgba(45,36,22,0.08)" }}
                            >
                              <Trash2 size={12} /> Delete
                            </div>
                          </div>
                        )}
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM PAGINATION FOOTER CONTROL */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "auto", paddingTop: "20px" }}>
            <span style={{ fontSize: "12px", color: "rgba(45,36,22,0.45)", marginRight: "auto", fontWeight: 600 }}>
              Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, filteredForms.length)} of {filteredForms.length} workspaces
            </span>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold", color: "#2d2416", opacity: currentPage === 1 ? 0.3 : 1 }}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{ 
                  border: "none", backgroundColor: currentPage === i + 1 ? "#c7b9ff" : "transparent", 
                  width: "24px", height: "24px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer",
                  color: "#2d2416"
                }}
              >
                {i + 1}
              </button>
            ))}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold", color: "#2d2416", opacity: currentPage === totalPages ? 0.3 : 1 }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes sketchToastIn {
          from { transform: translateY(15px) rotate(1deg); opacity: 0; }
          to { transform: translateY(0) rotate(-0.5deg); opacity: 1; }
        }
        @keyframes sketchLineShimmer {
          0% { background-position: -150px 0; }
          100% { background-position: 150px 0; }
        }
      `}</style>
    </div>
  );
}

// ─── SHIMMERING ROW WORKSPACE SKELETON ───
function SketchRowSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "rgba(254,251,245,0.5)", border: "1px dashed rgba(45,36,22,0.15)", borderRadius: "12px",
        padding: "18px 20px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "30%" }}>
        <div style={{ width: "75%", height: "12px", backgroundColor: "rgba(45,36,22,0.08)", borderRadius: "4px", animation: "sketchLineShimmer 1.6s infinite linear" }} />
        <div style={{ width: "40%", height: "8px", backgroundColor: "rgba(45,36,22,0.04)", borderRadius: "3px" }} />
      </div>
      <div style={{ width: "60px", height: "20px", backgroundColor: "rgba(45,36,22,0.04)", borderRadius: "4px" }} />
      <div style={{ width: "80px", height: "24px", backgroundColor: "rgba(45,36,22,0.03)", borderRadius: "12px" }} />
      <div style={{ width: "40px", height: "14px", backgroundColor: "rgba(45,36,22,0.05)", borderRadius: "3px" }} />
    </div>
  );
}

function SketchError({ message }: { message: string }) {
  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fdf8f0" }}>
      <div style={{ position: "relative", border: "1.5px solid #f4c2b0", borderRadius: "12px", padding: "32px 40px", backgroundColor: "#fff9f7", transform: "rotate(-1deg)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", maxWidth: "360px", boxShadow: "3px 4px 12px rgba(239,108,0,0.1)" }}>
        <div style={{ position: "absolute", top: "-10px", left: "30px", width: "50px", height: "18px", backgroundColor: "#ffe0cc", opacity: 0.8, transform: "rotate(-2deg)" }} />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e64a19" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#2d2416", margin: 0, fontFamily: "'Caveat', cursive" }}>Something scribbled wrong!</h3>
        <p style={{ fontSize: "13px", color: "rgba(45,36,22,0.6)", margin: 0, textAlign: "center", lineHeight: 1.5 }}>{message}</p>
      </div>
    </div>
  );
}