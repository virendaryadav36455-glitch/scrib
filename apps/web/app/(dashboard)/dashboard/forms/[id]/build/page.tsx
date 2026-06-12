"use client";

// FILE: apps/web/app/(dashboard)/dashboard/forms/[id]/build/page.tsx
//
// FIXES IN THIS FILE:
// 1. deleteField.mutate(field.id) → deleteField.mutate({ formId, fieldId })
//    Route expects { formId, fieldId } not a bare string.
//
// 2. Right sidebar label/placeholder used defaultValue (uncontrolled).
//    When user clicks a different field the inputs kept showing the old field's value.
//    FIX: controlled value + local state reset on selectedFieldId change.
//
// 3. single_select/multi_select had no way to add/edit options.
//    FIX: full options manager in sidebar.
//
// 4. checkbox had no sidebar config at all.
//    FIX: shows label config (it's a single yes/no toggle for the respondent).
//
// 5. rating had no max stars config.
//    FIX: max stars input in sidebar (default 5, configurable up to 10).
//
// 6. Preview button opened broken /dashboard/forms/${formId}/preview.
//    FIX: opens /f/${slug}.
//
// 7. No link to the Share page from the builder.
//    FIX: "Share" button in top-right links to /dashboard/forms/${formId}/share.
//
// 8. Field previews showed hardcoded options.
//    FIX: reads from field.config.options.

import React, { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormBuilderStore } from "~/store/form-builder.store";
import { useUIStore } from "~/store/ui.store";
import {
  useFormDetail, useUpdateForm, usePublishForm, useUnpublishForm,
  useAddField, useDeleteField, useUpdateField,
} from "~/hooks/api/forms";
import { Skeleton } from "~/components/ui/skeleton";
import {
  CheckCircle, Loader2, AlertCircle, Copy, Trash2,
  Link as LinkIcon,
  Plus, X, GitCommit, Eye, Share2,
  EyeOff,
  Upload,
} from "lucide-react";
import Sidebar from "~/components/Sidebar";
import { ScribbleButton } from "~/components/scribble/ScribbleButton";

const FIELD_TYPES = [
  { type: "short_text",    label: "Short Text" },
  { type: "long_text",     label: "Long Text" },
  { type: "email",         label: "Email" },
  { type: "number",        label: "Number" },
  { type: "single_select", label: "Single Select" },
  { type: "multi_select",  label: "Multi Select" },
  { type: "checkbox",      label: "Checkbox" },
  { type: "rating",        label: "Rating" },
  { type: "date",          label: "Date" },
  { type: "phone",         label: "Phone" },
];

const getWobble = (w: number, h: number, s: number) => {
  const r = (i: number) => { const x = Math.sin(s*9301+i*49297+233711)*43758.5453; return (x-Math.floor(x)-0.5)*3.5; };
  return [`M${4+r(0)} ${3+r(1)}`,`Q${w*.25+r(2)} ${1+r(3)} ${w*.5+r(4)} ${2+r(5)}`,`Q${w*.75+r(6)} ${1.5+r(7)} ${w-4+r(8)} ${3+r(9)}`,`Q${w-1+r(10)} ${h*.3+r(11)} ${w-2+r(12)} ${h*.65+r(13)}`,`Q${w-3+r(14)} ${h-4+r(15)} ${w-5+r(16)} ${h-2+r(17)}`,`Q${w*.65+r(18)} ${h-1+r(19)} ${w*.35+r(20)} ${h-2+r(21)}`,`Q${5+r(22)} ${h-1+r(23)} ${3+r(24)} ${h-4+r(25)}`,`Q${1+r(26)} ${h*.65+r(27)} ${2+r(28)} ${h*.3+r(29)}`,"Z"].join(" ");
};

function useDebounce<T>(v: T, d: number): T {
  const [val, setVal] = useState(v);
  useEffect(() => { const t = setTimeout(() => setVal(v), d); return () => clearTimeout(t); }, [v, d]);
  return val;
}

interface BuildPageProps { params: Promise<{ id: string }>; }

export default function BuildPage({ params }: BuildPageProps) {
  const { id: formId } = use(params);
  const { data: form, isLoading } = useFormDetail(formId);
  const updateForm    = useUpdateForm(formId);
  const publishForm   = usePublishForm(formId);
  const unpublishForm = useUnpublishForm(formId);
  const addField      = useAddField(formId);
  const deleteField   = useDeleteField(formId);
  const updateField   = useUpdateField(formId);

  const { autosaveStatus } = useUIStore();
  const { selectedFieldId, setSelectedField } = useFormBuilderStore();

  const [titleVal,     setTitleVal]     = useState("");
  const [description,  setDescription]  = useState("");
  const [scale,        setScale]        = useState(0.8);

  // ── SIDEBAR CONTROLLED STATE ─────────────────────────────────────
  // Using local state so inputs clear immediately when switching fields.
  // Without this, React keeps the old uncontrolled defaultValue.
  const [sidebarLabel,       setSidebarLabel]       = useState("");
  const [sidebarPlaceholder, setSidebarPlaceholder] = useState("");
  const [sidebarOptions,     setSidebarOptions]     = useState<string[]>([]);
  const [sidebarMaxStars,    setSidebarMaxStars]     = useState<number>(5);
  const [newOption,          setNewOption]          = useState("");

  const debouncedLabel       = useDebounce(sidebarLabel,       600);
  const debouncedPlaceholder = useDebounce(sidebarPlaceholder, 600);

  const lastFieldRef        = useRef<string | null>(null);
  const lastLabelRef        = useRef<string>("");
  const lastPlaceholderRef  = useRef<string>("");

  useEffect(() => {
    const handleResize = () => setScale(Math.max((window.innerWidth / 1525) * 0.8, 0.45));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { if (form?.title) setTitleVal(form.title); }, [form?.title]);
  useEffect(() => { if (form?.description) setDescription(form.description ?? ""); }, [form?.description]);

  const fields        = form?.fields ?? [];
  const selectedField = fields.find((f: any) => f.id === selectedFieldId);

  // Reset sidebar when switching fields
  useEffect(() => {
    if (selectedField && selectedField.id !== lastFieldRef.current) {
      lastFieldRef.current       = selectedField.id;
      lastLabelRef.current       = selectedField.label ?? "";
      lastPlaceholderRef.current = selectedField.placeholder ?? "";
      setSidebarLabel(selectedField.label ?? "");
      setSidebarPlaceholder(selectedField.placeholder ?? "");
      const opts = (selectedField.config as any)?.options ?? [];
      setSidebarOptions(Array.isArray(opts) ? opts : []);
      setSidebarMaxStars(Number((selectedField.config as any)?.max ?? 5));
      setNewOption("");
    }
  }, [selectedField?.id]);

  // Debounced label save
  useEffect(() => {
    if (!selectedFieldId || !lastFieldRef.current) return;
    if (debouncedLabel === lastLabelRef.current) return;
    lastLabelRef.current = debouncedLabel;
    updateField.mutate({ formId, fieldId: selectedFieldId, data: { label: debouncedLabel } });
  }, [debouncedLabel]);

  // Debounced placeholder save
  useEffect(() => {
    if (!selectedFieldId || !lastFieldRef.current) return;
    if (debouncedPlaceholder === lastPlaceholderRef.current) return;
    lastPlaceholderRef.current = debouncedPlaceholder;
    updateField.mutate({ formId, fieldId: selectedFieldId, data: { placeholder: debouncedPlaceholder } });
  }, [debouncedPlaceholder]);

  const handleAddField = (type: string) => {
    addField.mutate({
      formId,
      field: {
        type: type as any,
        label: `New ${type.replace(/_/g, " ")} field`,
        required: false,
        order: fields.length,
        // Pre-seed config so fields are usable immediately after adding
        config: (type === "single_select" || type === "multi_select")
          ? { options: ["Option 1", "Option 2"] }
          : type === "rating"
          ? { max: 5 }
          : undefined,
      },
    });
  };

  // FIX: was deleteField.mutate(field.id) — route expects { formId, fieldId }
  const handleDelete = (fieldId: string) => {
    deleteField.mutate({ formId, fieldId });
    if (selectedFieldId === fieldId) setSelectedField(null);
  };

  const handleSaveOptions = (opts: string[]) => {
    if (!selectedFieldId) return;
    updateField.mutate({ formId, fieldId: selectedFieldId, data: { config: { options: opts } } });
  };

  const handleAddOption = () => {
    const t = newOption.trim();
    if (!t || sidebarOptions.includes(t)) return;
    const next = [...sidebarOptions, t];
    setSidebarOptions(next);
    handleSaveOptions(next);
    setNewOption("");
  };

  const handleRemoveOption = (i: number) => {
    const next = sidebarOptions.filter((_, j) => j !== i);
    setSidebarOptions(next);
    handleSaveOptions(next);
  };

  const handleSaveMaxStars = (max: number) => {
    if (!selectedFieldId) return;
    const clamped = Math.max(3, Math.min(10, max));
    setSidebarMaxStars(clamped);
    updateField.mutate({ formId, fieldId: selectedFieldId, data: { config: { max: clamped } } });
  };

  // Field preview renderer — reads REAL config values
  const renderPreview = (field: any, idx: number) => {
    const seed = idx * 17 + 42;
    const W = 440;
    const opts: string[] = (field.config as any)?.options ?? [];
    const maxStars = Number((field.config as any)?.max ?? 5);

    switch (field.type) {
      case "short_text": case "email": case "number": case "phone":
        return (
          <div style={{ width: "100%", position: "relative", padding: "6px 0", maxWidth: "440px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox={`0 0 ${W} 36`} fill="none" preserveAspectRatio="none">
              <path d={getWobble(W, 36, seed)} fill="white" fillOpacity={0.6} stroke="#c8b8a0" strokeWidth="1.1" />
            </svg>
            <span style={{ fontSize: "13px", color: "rgba(45,36,22,0.4)", paddingLeft: "12px", position: "relative", zIndex: 10, display: "block", padding: "4px", fontFamily: "'Nunito', sans-serif" }}>
              {field.placeholder || "Type your answer here..."}
            </span>
          </div>
        );
      case "long_text":
        return (
          <div style={{ width: "100%", position: "relative", padding: "6px 0", marginTop: "4px", maxWidth: "440px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox={`0 0 ${W} 64`} fill="none" preserveAspectRatio="none">
              <path d={getWobble(W, 64, seed+5)} fill="white" fillOpacity={0.6} stroke="#c8b8a0" strokeWidth="1.1" />
            </svg>
            <span style={{ fontSize: "13px", color: "rgba(45,36,22,0.4)", paddingLeft: "12px", paddingTop: "6px", position: "relative", zIndex: 10, display: "block", minHeight: "48px", fontFamily: "'Nunito', sans-serif" }}>
              {field.placeholder || "Write your answer..."}
            </span>
          </div>
        );
      case "date":
        return (
          <div style={{ width: "100%", position: "relative", padding: "6px 0", maxWidth: "440px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox={`0 0 ${W} 36`} fill="none" preserveAspectRatio="none">
              <path d={getWobble(W, 36, seed)} fill="white" fillOpacity={0.6} stroke="#c8b8a0" strokeWidth="1.1" />
            </svg>
            <span style={{ fontSize: "13px", color: "rgba(45,36,22,0.4)", paddingLeft: "12px", position: "relative", zIndex: 10, display: "block", padding: "4px", fontFamily: "'Nunito', sans-serif" }}>MM / DD / YYYY</span>
          </div>
        );
      case "single_select":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "13px" }}>
            {(opts.length > 0 ? opts : ["Option 1", "Option 2"]).map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2d2416" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#9a8060" strokeWidth="1.5" />
                  {i === 0 && <circle cx="8" cy="8" r="3.5" fill="#634cc9" />}
                </svg>
                <span style={{ fontWeight: 600 }}>{opt}</span>
              </label>
            ))}
            {opts.length === 0 && <span style={{ color: "#9a8060", fontSize: "11px", fontStyle: "italic" }}>Add options in sidebar →</span>}
          </div>
        );
      case "multi_select":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "13px" }}>
            {(opts.length > 0 ? opts : ["Choice 1", "Choice 2"]).map((opt, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2d2416" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#9a8060" strokeWidth="1.5" />
                </svg>
                <span style={{ fontWeight: 600 }}>{opt}</span>
              </label>
            ))}
            {opts.length === 0 && <span style={{ color: "#9a8060", fontSize: "11px", fontStyle: "italic" }}>Add options in sidebar →</span>}
          </div>
        );
      case "checkbox":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "6px", fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: 600, color: "#2d2416" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#9a8060" strokeWidth="1.5" />
            </svg>
            <span>Respondent checks this to confirm</span>
          </div>
        );
      case "rating":
        return (
          <div style={{ display: "flex", gap: "6px", paddingTop: "6px" }}>
            {Array.from({ length: maxStars }).map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 2l2.4 5H18l-4.4 3.4 1.6 5.6L10 13l-5.2 3 1.6-5.6L2 7h5.6z" stroke="#9a8060" strokeWidth="1.5" fill="none" />
              </svg>
            ))}
          </div>
        );
      default: return null;
    }
  };

  const hasPlaceholder = selectedField?.type && !["checkbox","rating","date","single_select","multi_select"].includes(selectedField.type);
  const hasOptions     = selectedField?.type === "single_select" || selectedField?.type === "multi_select";
  const isRating       = selectedField?.type === "rating";

// ── LOADING BUILD CONFIG DESK ──
  if (isLoading) {
    return (
      <div 
        style={{ 
          backgroundColor: "#fdf6ed", // Matches Scribble warm paper canvas background
          width: "100vw", 
          height: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          
          {/* Hand-drawn Grid Scaffold Animation Box */}
          <div style={{ position: "relative", width: "70px", height: "70px" }}>
            
            {/* Background Structural Blueprint Grid Points */}
            <svg 
              width="70" 
              height="70" 
              viewBox="0 0 70 70" 
              fill="none" 
              style={{ position: "absolute", inset: 0, opacity: 0.2 }}
            >
              <circle cx="15" cy="15" r="1" fill="#2d2416" />
              <circle cx="35" cy="15" r="1" fill="#2d2416" />
              <circle cx="55" cy="15" r="1" fill="#2d2416" />
              <circle cx="15" cy="35" r="1" fill="#2d2416" />
              <circle cx="35" cy="35" r="1" fill="#2d2416" />
              <circle cx="55" cy="35" r="1" fill="#2d2416" />
              <circle cx="15" cy="55" r="1" fill="#2d2416" />
              <circle cx="35" cy="55" r="1" fill="#2d2416" />
              <circle cx="55" cy="55" r="1" fill="#2d2416" />
            </svg>

            {/* Sketched Wireframe Window Loop */}
            <svg 
              width="70" 
              height="70" 
              viewBox="0 0 70 70" 
              fill="none"
              style={{
                position: "relative",
                zIndex: 2,
                animation: "scaffoldScale 1.6s infinite ease-in-out"
              }}
            >
              {/* Outer Bounding Box Profile */}
              <rect 
                x="10" 
                y="14" 
                width="50" 
                height="42" 
                rx="6" 
                stroke="#2d2416" 
                strokeWidth="1.8" 
                strokeDasharray="4 3" 
                fill="none"
              />
              {/* Inner Sidebar Splitting Guideline */}
              <line x1="26" y1="14" x2="26" y2="56" stroke="#2d2416" strokeWidth="1.2" strokeDasharray="2 3" />
              
              {/* Fake Micro Element Blocks inside the Mock Builder Card */}
              <rect x="32" y="22" width="22" height="6" rx="1.5" fill="#ede8f9" stroke="#7c4dff" strokeWidth="1" opacity="0.4" />
              <rect x="32" y="34" width="16" height="4" rx="1" fill="rgba(45,36,22,0.1)" />
              <circle cx="18" cy="22" r="2" fill="#7c4dff" opacity="0.5" />
              <circle cx="18" cy="30" r="2" fill="rgba(45,36,22,0.2)" />
            </svg>
          </div>

          {/* Text Communications Center */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "3px" }}>
            <p 
              style={{ 
                fontFamily: "'Caveat', cursive", 
                fontSize: "25px", 
                fontWeight: 900, 
                color: "#2d2416", 
                margin: 0,
                letterSpacing: "0.3px"
              }}
            >
              Assembling drawing grid...
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
              Calibrating workspace viewports, drag fields & layout nodes
            </p>
          </div>
        </div>

        {/* CSS Component Keyframes */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scaffoldScale {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.04); opacity: 0.6; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", color: "#2d2416", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Image src="/builderBG.png" alt="" fill priority className="object-fill" />
      </div>

      <div style={{
        position: "absolute", left: 0, top: 0, width: "1920px", height: "1080px",
        display: "flex", transform: `scale(${scale})`, transformOrigin: "top left",
        boxSizing: "border-box", paddingLeft: "76px", paddingTop: "24px", zIndex: 1,
      }}>
        <Sidebar activeTab="Form" />

        <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", paddingLeft: "10px" }}>

          {/* TOP NAV */}
          <div style={{ width: "100%", height: "90px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "16px", boxSizing: "border-box" }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#2d2416", fontWeight: "bold", fontSize: "15px", fontFamily: "'Nunito', sans-serif", paddingTop: "35px" }}>
              <svg width="22" height="16" viewBox="0 0 24 16" fill="none" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 1L2 8L9 15" /><path d="M2 8H22" />
              </svg>
              Back
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, height: "100%", position: "relative" }}>
              <div style={{ position: "relative", width: "480px", height: "120px", marginTop: "20px", marginLeft:"300px",display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src="/builder Boy (1).png" alt="" width={480} height={120} priority style={{ objectFit: "contain", transform: "scale(1.25)" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "30px", paddingRight: "46px" }}>
              {/* Autosave */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, fontFamily: "'Nunito', sans-serif",width:"63px" }}>
                {autosaveStatus === "saving" && <><Loader2 style={{ width: "14px", height: "14px", color: "#9a8060" }} className="animate-spin" /><span style={{ color: "#9a8060" }}>Saving...</span></>}
                {(autosaveStatus === "saved" || autosaveStatus === "idle") && <><CheckCircle style={{ width: "14px", height: "14px", color: "#22c55e" }} /><span style={{ color: "rgba(45,36,22,0.5)" }}>Saved</span></>}
                {autosaveStatus === "error" && <><AlertCircle style={{ width: "14px", height: "14px", color: "#ef4444" }} /><span style={{ color: "#ef4444" }}>Error</span></>}
              </div>

              {/* Version badge */}
              {(form as any)?.version && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#634cc9", background: "rgba(99,76,201,0.08)", padding: "3px 10px", borderRadius: "99px", fontFamily: "'Nunito', sans-serif" }}>
                  <GitCommit style={{ width: "12px", height: "12px" }} /> v{(form as any).version}
                </div>
              )}

              {/* FIX: Preview opens real /f/${slug} URL */}
              <ScribbleButton onClick={() => { const slug = (form as any)?.customSlug ?? (form as any)?.slug ?? ""; if (slug) window.open(`/f/${slug}/preview`, "_blank"); }}>
                <Eye style={{ width: "14px", height: "14px" ,paddingRight:"6px"}} /> Preview
              </ScribbleButton>

              {/* FIX: Share page button — was missing entirely */}
              <Link href={`/dashboard/forms/${formId}/share`} style={{ textDecoration: "none" }}>
                <ScribbleButton>
                  <Share2 style={{ width: "14px", height: "14px" ,paddingRight:"6px"}} /> Share
                </ScribbleButton>
              </Link>

              {/* Publish */}
              <ScribbleButton
                style={{width:"150px"}}
                disabled={publishForm.isPending || unpublishForm.isPending}
                onClick={() => form?.status === "published" ? unpublishForm.mutate({ id: formId }) : publishForm.mutate({ id: formId })}
              >
               
{
  publishForm.isPending || unpublishForm.isPending ? (
    "..."
  ) : form?.status === "published" ? (
    <>
      <EyeOff size={14} style={{paddingRight:"6px"}}/>
      Unpublish
    </>
  ) : (
    <>
      <Upload size={14} style={{paddingRight:"6px"}}/>
      Publish
    </>
  )
}
              </ScribbleButton>
            </div>
          </div>

          {/* 3-COLUMN GRID */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "270px 960px 280px", width: "100%", height: "calc(100% - 130px)", overflow: "hidden" }}>

            {/* COL 1: ADD FIELDS */}
            <div style={{ height: "100%", display: "flex", flexDirection: "column", paddingRight: "12px", overflowY: "auto", overflowX: "hidden", alignItems: "center", boxSizing: "border-box" }}>
              <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "22px", margin: "0 0 4px 0", color: "#1a150e", width: "100%", paddingLeft: "12px" }}>Add Fields</h3>
              <p style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", margin: "0 0 12px 0", fontFamily: "'Nunito', sans-serif", width: "100%", paddingLeft: "12px" }}>Click to add to form</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                {FIELD_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    disabled={addField.isPending}
                    onClick={() => handleAddField(ft.type)}
                    style={{ width: "100%", height: "42px", display: "flex", alignItems: "center", padding: "0 14px", background: "transparent", fontSize: "13px", fontWeight: 600, color: "#2d2416", textAlign: "left", cursor: "pointer", border: "none", position: "relative", outline: "none", gap: "10px", boxSizing: "border-box", fontFamily: "'Nunito', sans-serif" }}
                  >
                    <svg viewBox="0 0 176 38" fill="none" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                      <path d="M4.3703564055176685 1.6306875446680351 Q44.77590335932473 2.234368125858964 87.7289548808476 0.8793961147748632 Q132.84263172607734 1.826822399183584 171.32160742735869 2.300008643651381 Q174.00146472210145 12.005913244260592 175.27713761983614 23.575536357159944 Q173.11011265711204 34.3794556775174 171.66287634876062 34.579691604535924 Q113.48791747456417 38.139812168046774 60.356604982991115 35.879774289107445 Q4.650967657209549 37.29812903411221 1.7210496918796707 34.378610699910496 Q1.3890541362925433 23.92372687110692 2.203594366063953 11.222672864313063 Z" fill="white" stroke="#c8b8a0" strokeWidth="1.3" />
                    </svg>
                    <span style={{ position: "relative", zIndex: 1 }}>{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* COL 2: CANVAS */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px", overflow: "hidden" }}>
              <div style={{ width: "700px", height: "760px", position: "relative", display: "flex", flexDirection: "column", padding: "64px 44px 44px 44px", boxSizing: "border-box", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                  <Image src="/demoBG (1).png" alt="" height={760} width={700} priority style={{ objectFit: "fill" }} />
                </div>
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", width: "612px" }}>
                  {/* Title */}
                  <div style={{ marginBottom: "16px", flexShrink: 0 }}>
                    <input value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={() => titleVal.trim() && titleVal !== form?.title && updateForm.mutate({ id: formId, data: { title: titleVal.trim() } })} placeholder="Form Title" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "26px", fontWeight: "800", color: "#1a150e", border: "none", outline: "none", width: "100%", background: "transparent" }} />
                    <input value={description} onChange={e => setDescription(e.target.value)} onBlur={() => updateForm.mutate({ id: formId, data: { description } })} placeholder="Description..." style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", color: "rgba(45,36,22,0.6)", outline: "none", width: "100%", border: "none", background: "transparent" }} />
                  </div>

                  {/* Fields list */}
                  <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px", width: "100%" }}>
                    {fields.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", border: "1.5px dashed #c8b8a0", borderRadius: "6px", color: "rgba(45,36,22,0.5)", fontFamily: "'Nunito', sans-serif" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "bold" }}>No fields yet.</p>
                        <p style={{ margin: 0, fontSize: "12px" }}>Click a type on the left.</p>
                      </div>
                    ) : fields.map((field: any, idx: number) => {
                      const isSelected = field.id === selectedFieldId;
                      return (
                        <div key={field.id} onClick={() => setSelectedField(field.id === selectedFieldId ? null : field.id)}
                          style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: isSelected ? "rgba(252,224,155,0.25)" : "transparent", border: isSelected ? "1.5px solid #2d2416" : "1.5px solid transparent", position: "relative", cursor: "pointer", flexShrink: 0, width: "100%", boxSizing: "border-box" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#2d2416", fontFamily: "'Nunito', sans-serif" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", borderRadius: "50%", border: "1px solid #c8b8a0", fontSize: "10px", fontWeight: "bold", color: "#634cc9", marginRight: "6px" }}>{idx+1}</span>
                              {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.4)", fontFamily: "'Nunito', sans-serif" }}>{field.type.replace(/_/g, " ")}</span>
                              {/* FIX: was deleteField.mutate(field.id) */}
                              <button onClick={e => { e.stopPropagation(); handleDelete(field.id); }} style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "#ef4444" }}><Trash2 style={{ width: "12px", height: "12px" }} /></button>
                            </div>
                          </div>
                          <div style={{ paddingRight: "8px" }}>{renderPreview(field, idx)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div onClick={() => handleAddField("short_text")} style={{ width: "100%", height: "40px", borderRadius: "6px", border: "1.2px dashed rgba(99,76,201,0.4)", backgroundColor: "rgba(244,240,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", color: "#634cc9", fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>
                    <Plus style={{ width: "14px", height: "14px" }} /> Add field
                  </div>
                </div>
              </div>
              <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar{width:5px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(45,36,22,0.15);border-radius:99px}`}} />
            </div>

            {/* COL 3: RIGHT SIDEBAR */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: "14px", padding: "0 16px 0 10px", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }}>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "18px", fontWeight: "800", margin: 0, color: "#1a150e" }}>{selectedField ? "Field Settings" : "Form Settings"}</h3>

              {selectedField ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontFamily: "'Nunito', sans-serif", fontSize: "13px" }}>

                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#634cc9", background: "rgba(99,76,201,0.08)", padding: "3px 10px", borderRadius: "99px", width: "fit-content" }}>
                    {selectedField.type.replace(/_/g, " ")}
                  </div>

                  {/* Label */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: "6px", color: "#2d2416" }}>Field Label</label>
                    <input type="text" value={sidebarLabel} onChange={e => setSidebarLabel(e.target.value)}
                      style={{ width: "100%", height: "36px", padding: "0 12px", border: "1.2px solid #c8b8a0", borderRadius: "6px", background: "white", outline: "none", fontSize: "13px", fontFamily: "'Nunito', sans-serif", boxSizing: "border-box" }}
                      placeholder="Field label..." />
                  </div>

                  {/* Placeholder — text fields only */}
                  {hasPlaceholder && (
                    <div>
                      <label style={{ display: "block", fontWeight: 700, marginBottom: "6px", color: "#2d2416" }}>Placeholder</label>
                      <input type="text" value={sidebarPlaceholder} onChange={e => setSidebarPlaceholder(e.target.value)}
                        style={{ width: "100%", height: "36px", padding: "0 12px", border: "1.2px solid #c8b8a0", borderRadius: "6px", background: "white", outline: "none", fontSize: "13px", fontFamily: "'Nunito', sans-serif", boxSizing: "border-box" }}
                        placeholder="Hint text..." />
                    </div>
                  )}

                  {/* Options manager — single_select and multi_select */}
                  {hasOptions && (
                    <div>
                      <label style={{ display: "block", fontWeight: 700, marginBottom: "8px", color: "#2d2416" }}>Options</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                        {sidebarOptions.map((opt, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input type="text" value={opt}
                              onChange={e => { const n = [...sidebarOptions]; n[i] = e.target.value; setSidebarOptions(n); }}
                              onBlur={() => handleSaveOptions(sidebarOptions)}
                              style={{ flex: 1, height: "32px", padding: "0 10px", border: "1.2px solid #c8b8a0", borderRadius: "6px", background: "white", outline: "none", fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}
                            />
                            <button onClick={() => handleRemoveOption(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px", display: "flex" }}><X style={{ width: "13px", height: "13px" }} /></button>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input type="text" value={newOption} onChange={e => setNewOption(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddOption()} placeholder="New option..."
                          style={{ flex: 1, height: "32px", padding: "0 10px", border: "1.2px dashed #c8b8a0", borderRadius: "6px", background: "rgba(244,240,250,0.4)", outline: "none", fontSize: "12px", fontFamily: "'Nunito', sans-serif" }}
                        />
                        <button onClick={handleAddOption} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#634cc9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                          <Plus style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FIX: Rating max stars — was missing entirely */}
                  {isRating && (
                    <div>
                      <label style={{ display: "block", fontWeight: 700, marginBottom: "6px", color: "#2d2416" }}>Max Stars (3–10)</label>
                      <input type="number" min={3} max={10} value={sidebarMaxStars}
                        onChange={e => setSidebarMaxStars(Number(e.target.value))}
                        onBlur={() => handleSaveMaxStars(sidebarMaxStars)}
                        style={{ width: "100%", height: "36px", padding: "0 12px", border: "1.2px solid #c8b8a0", borderRadius: "6px", background: "white", outline: "none", fontSize: "13px", fontFamily: "'Nunito', sans-serif", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                        {Array.from({ length: sidebarMaxStars }).map((_, i) => (
                          <svg key={i} width="16" height="16" viewBox="0 0 20 20">
                            <path d="M10 2l2.4 5H18l-4.4 3.4 1.6 5.6L10 13l-5.2 3 1.6-5.6L2 7h5.6z" stroke="#f5b800" fill="#f5b800" strokeWidth="1" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                    <span style={{ fontWeight: 700, color: "#2d2416" }}>Required</span>
                    <input type="checkbox" checked={selectedField.required} onChange={e => updateField.mutate({ formId, fieldId: selectedField.id, data: { required: e.target.checked } })}
                      style={{ width: "16px", height: "16px", accentColor: "#634cc9", cursor: "pointer" }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'Nunito', sans-serif", fontSize: "13px" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: "6px", color: "#2d2416" }}>Form Title</label>
                    <input type="text" defaultValue={form?.title} onBlur={e => updateForm.mutate({ id: formId, data: { title: e.target.value } })}
                      style={{ width: "100%", height: "36px", padding: "0 12px", border: "1.2px solid #c8b8a0", borderRadius: "6px", background: "white", outline: "none", fontSize: "13px", fontFamily: "'Nunito', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(45,36,22,0.5)", margin: 0 }}>Click any field to configure it.</p>
                  {/* Link to share page from here too */}
                  <Link href={`/dashboard/forms/${formId}/share`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#634cc9" }}>
                    <Share2 style={{ width: "13px", height: "13px" }} /> Go to Share page
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}