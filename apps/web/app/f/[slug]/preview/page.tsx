"use client";

import { AlertCircle, Lock, Moon, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "~/components/ui/card";
import { applyConditions, buildFieldSchema } from "@repo/validators";
import { Skeleton } from "~/components/ui/skeleton";
import { useTrackEvent } from "~/hooks/api/analytics";
import { usePublicForm } from "~/hooks/api/forms";
import { getErrorMessage } from "~/lib/errors";
import { toast } from "sonner";


// ── SCRIBBLE SUBMIT BUTTON ──────────────────────────────────────────────────
interface ScribbleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  submitting?: boolean;
}

export function ScribbleButton({ children, submitting, style, ...props }: ScribbleButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: "10px", fontFamily: "'Caveat', cursive, sans-serif", fontSize: "24px",
        fontWeight: "bold", color: "#ffffff", cursor: submitting ? "not-allowed" : "pointer",
        border: "none", background: "transparent", position: "relative",
        padding: "12px 65px", userSelect: "none",
        transition: "transform 0.1s ease, filter 0.1s ease", outline: "none",
        ...style,
      }}
      onMouseEnter={e => !submitting && (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={e => !submitting && (e.currentTarget.style.transform = "scale(1)")}
      onMouseDown={e  => !submitting && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={e    => !submitting && (e.currentTarget.style.transform = "scale(1.02)")}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible", pointerEvents: "none" }} viewBox="0 0 320 60" preserveAspectRatio="none" fill="none">
        <defs>
          <filter id="wc-tex" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDiffuseLighting in="noise" lighting-color="#e1d5ff" surfaceScale="2" result="light">
              <feDistantLight azimuth="60" elevation="50" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" result="blend" />
          </filter>
        </defs>
        <rect x="3" y="5" width="314" height="52" rx="10" fill="rgba(45,36,22,0.15)" />
        <rect x="3" y="3" width="314" height="52" rx="10" fill="#9462f5" filter="url(#wc-tex)" />
        <path d="M12 4 Q160 2 308 4 Q316 5 316 12 Q318 30 316 48 Q316 56 308 56 Q160 58 12 56 Q4 56 4 48 Q2 30 4 12 Q4 5 12 4 Z" stroke="#2d2416" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <g stroke="#2d2416" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="-12" y1="24" x2="-22" y2="18" /><line x1="-15" y1="30" x2="-26" y2="30" /><line x1="-12" y1="36" x2="-22" y2="42" />
        </g>
        <g stroke="#2d2416" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="332" y1="24" x2="342" y2="18" /><line x1="335" y1="30" x2="346" y2="30" /><line x1="332" y1="36" x2="342" y2="42" />
        </g>
      </svg>
      <span style={{ position: "relative", zIndex: 1, letterSpacing: "0.5px", textShadow: "1px 1.5px 0px rgba(0,0,0,0.15)" }}>{children}</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ position: "relative", zIndex: 1, overflow: "visible", marginLeft: "2px" }}>
        <path d="M2 12L22 2L15 22L11 13L2 12Z" fill="#fff" stroke="#2d2416" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M11 13L22 2" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}


// ── FIELD ICONS ─────────────────────────────────────────────────────────────
function renderFieldIcon(type: string) {
  const s = { flexShrink: 0, overflow: "visible" } as React.CSSProperties;
  switch (type) {
    case "email":
      return (
        <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={s}>
          <rect x="2" y="4" width="20" height="14" rx="3" fill="#dfc9ff" stroke="#2d2416" strokeWidth="2" strokeLinejoin="round" />
          <path d="M2 5L12 13L22 5" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 6h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "short_text": case "phone":
      return (
        <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={s}>
          <circle cx="12" cy="7" r="4" fill="#dfc9ff" stroke="#2d2416" strokeWidth="2" />
          <path d="M4 18c0-3.5 3.5-6 8-6s8 2.5 8 6" fill="#dfc9ff" stroke="#2d2416" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 5a2 2 0 0 1 2 2" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
    case "number": case "rating":
      return (
        <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={s}>
          <path d="M12 2l2.8 5.7 6.2.9-4.5 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.5-4.4 6.2-.9L12 2z" fill="#dfc9ff" stroke="#2d2416" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 5l1.2 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case "long_text":
      return (
        <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={s}>
          <rect x="4" y="5" width="16" height="15" rx="2" fill="#dfc9ff" stroke="#2d2416" strokeWidth="2" />
          <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" fill="#b095e6" stroke="#2d2416" strokeWidth="2" />
          <line x1="8" y1="10" x2="16" y2="10" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="14" x2="14" y2="14" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="20" viewBox="0 0 24 22" fill="none" style={s}>
          <path d="M7 9v6a4 4 0 1 0 8 0V7a2.5 2.5 0 0 0-5 0v7.5a1 1 0 0 0 2 0V9" stroke="#634cc9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}


// ── DYNAMIC FIELD RENDERER ───────────────────────────────────────────────────
function DynamicPublicField({ field, value, onChange, error }: {
  field: any; value: any; onChange: (v: any) => void; error?: string;
}) {
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Caveat', cursive, sans-serif", display: "flex",
    alignItems: "center", gap: "10px", fontSize: "18px", fontWeight: "500",
    color: "#2d2416", marginBottom: "6px", userSelect: "none",
  };
  const errorStyle: React.CSSProperties = {
    fontFamily: "'Caveat', cursive, sans-serif", fontSize: "14px",
    color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px",
  };

  if (typeof error === "string") {
    error = error
      .replaceAll("Invalid input: ", "")
      .replaceAll("Invalid option: ", "")
      .replaceAll(" received undefined", "");
  }

  const baseInputStyle: React.CSSProperties = {
    width: "100%", minHeight: "42px", padding: "0 14px",
    border: "1.5px solid #c8b8a0", borderRadius: "8px",
    backgroundColor: "rgba(255,253,247,0.75)",
    fontFamily: "'Nunito', sans-serif", fontSize: "14px",
    color: "#2d2416", outline: "none", boxSizing: "border-box",
  };

  switch (field.type) {
    case "short_text": case "email": case "phone":
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <input
            type={field.type === "email" ? "email" : "text"}
            placeholder={field.placeholder ?? "Type your answer here..."}
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            style={baseInputStyle}
          />
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );

    case "number":
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <input
            type="number"
            placeholder={field.placeholder ?? "Enter a number..."}
            value={value ?? ""}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : "")}
            style={baseInputStyle}
          />
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );

    case "long_text":
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <textarea
            placeholder={field.placeholder ?? "Write your thoughts here..."}
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            rows={4}
            style={{ ...baseInputStyle, padding: "10px 14px", resize: "none" }}
          />
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );

    case "single_select": {
      const opts: string[] = field.config?.options ?? [];
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px", marginTop: "4px" }}>
            {opts.length === 0 && (
              <span style={{ fontSize: "13px", color: "#9a8060", fontStyle: "italic" }}>No options configured.</span>
            )}
            {opts.map(opt => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2d2416", cursor: "pointer" }}>
                <input
                  type="radio" name={field.id} checked={value === opt}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: "#634cc9", cursor: "pointer", width: "16px", height: "16px" }}
                />
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "600" }}>{opt}</span>
              </label>
            ))}
          </div>
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );
    }

    case "multi_select": {
      const opts: string[] = field.config?.options ?? [];
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px", marginTop: "4px" }}>
            {opts.length === 0 && (
              <span style={{ fontSize: "13px", color: "#9a8060", fontStyle: "italic" }}>No options configured.</span>
            )}
            {opts.map(opt => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2d2416", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={e => {
                    const next = e.target.checked
                      ? [...selected, opt]
                      : selected.filter(v => v !== opt);
                    onChange(next);
                  }}
                  style={{ accentColor: "#634cc9", cursor: "pointer", width: "16px", height: "16px" }}
                />
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "600" }}>{opt}</span>
              </label>
            ))}
          </div>
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );
    }

    case "rating": {
      const ratingValue = typeof value === "number" ? value : 0;
      const maxStars = typeof field.config?.max === "number" ? field.config.max : 5;
      const starSequence = Array.from({ length: maxStars }, (_, i) => i + 1);

      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <div style={{ display: "flex", gap: "8px", paddingLeft: "32px", marginTop: "4px" }}>
            {starSequence.map(star => (
              <button
                key={star} 
                type="button"
                onClick={() => onChange(star === ratingValue ? 0 : star)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <svg width="30" height="30" viewBox="0 0 20 20">
                  <path
                    d="M10 2l2.4 5H18l-4.4 3.4 1.6 5.6L10 13l-5.2 3 1.6-5.6L2 7h5.6z"
                    fill={star <= ratingValue ? "#f5b800" : "none"}
                    stroke={star <= ratingValue ? "#d48a00" : "#9a8060"}
                    strokeWidth="1.2"
                  />
                </svg>
              </button>
            ))}
          </div>
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );
    }

    case "date":
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            {renderFieldIcon(field.type)}
            <span>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
          </label>
          <input
            type="date"
            value={value ?? ""}
            onChange={e => onChange(e.target.value)}
            style={baseInputStyle}
          />
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );

    case "checkbox":
      return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
          <label style={{ ...labelStyle, cursor: "pointer" }}>
            {renderFieldIcon(field.type)}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox" checked={!!value}
                onChange={e => onChange(e.target.checked)}
                style={{ accentColor: "#634cc9", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }}
              />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "700" }}>
                {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
              </span>
            </div>
          </label>
          {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }} />{error}</p>}
        </div>
      );

    default:
      return null;
  }
}


// ── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({
  onUnlock,
  externalError,
}: {
  slug: string;
  onUnlock: (pw: string) => void;
  externalError?: string;
}) {
  const [pw, setPw] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (externalError) setLocalError(externalError);
  }, [externalError]);

  const handleSubmit = () => {
    if (!pw.trim()) { setLocalError("Please enter the password."); return; }
    setLocalError("");
    onUnlock(pw.trim());
  };

  return (
    <div style={{
      background: "#fffdf9", border: "1.5px solid #2d2416", borderRadius: "16px",
      padding: "40px 36px", maxWidth: "380px", width: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "18px",
      boxShadow: "4px 5px 0px rgba(45,36,22,0.08)",
    }}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect x="8" y="20" width="28" height="18" rx="4" fill="#e0d4f7" stroke="#2d2416" strokeWidth="1.8" />
        <path d="M14 20V15C14 10.5 22 7 30 10V15" stroke="#2d2416" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="29" r="3" fill="#634cc9" />
      </svg>

      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "26px", fontWeight: 900, color: "#2d2416", margin: "0 0 4px 0" }}>
          Password Required
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", color: "rgba(45,36,22,0.55)", margin: 0 }}>
          This form is password protected.
        </p>
      </div>

      <input
        type="password"
        value={pw}
        onChange={e => { setPw(e.target.value); setLocalError(""); }}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        placeholder="Enter password..."
        style={{
          width: "100%", height: "42px", padding: "0 14px",
          border: `1.5px solid ${localError ? "#ef4444" : "#c8b8a0"}`,
          borderRadius: "8px", background: "rgba(255,253,247,0.9)",
          fontFamily: "'Nunito', sans-serif", fontSize: "14px",
          color: "#2d2416", outline: "none", boxSizing: "border-box",
        }}
      />

      {localError && (
        <p style={{ color: "#ef4444", fontSize: "13px", margin: "-8px 0 0 0", fontFamily: "'Nunito', sans-serif", alignSelf: "flex-start" }}>
          {localError}
        </p>
      )}

      <ScribbleButton onClick={handleSubmit} style={{ fontSize: "18px", padding: "8px 40px" }}>
        Unlock Form
      </ScribbleButton>
    </div>
  );
}


// ── MAIN PAGE ────────────────────────────────────────────────────────────────
const DefaultScribbleFormPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug }  = use(params);
  const router    = useRouter();
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const apiUrl    = rawApiUrl.replace(/\/trpc\/?$/, "");

  const [password,      setPassword]    = useState<string | undefined>(undefined);
  const [answers,       setAnswers]     = useState<Record<string, unknown>>({});
  const [errors,        setErrors]      = useState<Record<string, string>>({});
  const [isTrickedOpen, setIsTrickedOpen] = useState(false);
  // NEW STATE: Manage active preview notifications
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const { data: form, isLoading, error } = usePublicForm(slug, password);

  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const update = () => {
      const scaleX = window.innerWidth  / 1250;
      const scaleY = window.innerHeight / 900;
      const computedScale = Math.min(scaleX, scaleY, 0.8);
      setScale(computedScale < 0.4 ? 0.4 : computedScale); // Fixed minimal break fallback threshold protection
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── LOADING SKELETON FRAME ──
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fdf6ed" }}>
      <div className="w-full max-w-xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  // ── PREVIEW BYPASS ROUTING ──
  // D_AIM: Form is rendered explicitly for developers, bypassing the missing/unpublished error route block entirely.
  const formPayload = form && !("requiresPassword" in form) ? form : null;

  // ── PASSWORD GATE CHECK ──
  if (form && (form as any).requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fdf6ed" }}>
        <PasswordGate
          slug={slug}
          onUnlock={pw => setPassword(pw)}
          externalError={(form as any).wrongPassword ? "Incorrect password. Please try again." : undefined}
        />
      </div>
    );
  }

  const allFields = formPayload ? ((formPayload as any).fields ?? []) : [];
  const activeFields = applyConditions(allFields, answers as Record<string, unknown>);

  // ── RENDER CONTAINER SKETCH ──
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", overflow: "hidden" }}>

      {/* Global Dev Banner Notification Tab */}
      {/* <div 
        style={{
          position: "fixed", top: "14px", left: "50%", transform: "translateX(-50%) rotate(-0.5deg)",
          backgroundColor: "#dfcbf2", border: "1.5px solid #2d2416", borderRadius: "8px",
          padding: "6px 20px", display: "flex", alignItems: "center", gap: "8px",
          zIndex: 999, boxShadow: "3px 3px 0px #2d2416"
        }}
      >
        <Eye size={16} color="#2d2416" />
        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 800, color: "#2d2416" }}>
          LIVE CANVAS PREVIEW MODE
        </span>
      </div> */}

      {/* Background Frame */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Image src="/formsType/scribbleFormBG.png" alt="Scribble Canvas Theme Border Frame" fill priority className="object-fill" />
      </div>

      {/* Responsive layout viewport context container mapping */}
      <div style={{
        position: "absolute", left: "50%", top: "47%",
        width: "1810px", height: "900px",
        display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: "center center",
        boxSizing: "border-box", zIndex: 1, padding: "20px 40px",
      }}>

        {/* Top header strip */}
        <div style={{ fontFamily: "'Caveat', cursive", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "65px" }}>
          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", width: "fit-content", position: "relative", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: "'Caveat', cursive, sans-serif", fontSize: "26px", fontWeight: 900, color: "#2d2416", lineHeight: "1" }}>ScribbleForms</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(45,36,22,0.15)" transform="translate(0.5,1.5)" />
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#9462f5" stroke="#2d2416" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 7.5c-1 1-0.8 2.5 0 3" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: "-10px", left: "2px", width: "100%", height: "12px" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M 2 7 C 45 4, 85 9, 130 6 C 165 4, 188 8, 197 5" stroke="#9462f5" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </div>

          {/* Security badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "20px", fontWeight: 700, color: "#5a4a30" }}>
            <Lock size={24} />
            <div style={{ display: "flex", alignItems: "center", gap: "4px", borderBottom: "1px dashed #5a4a30", paddingBottom: "2px" }}>
              Secure & Private
            </div>
            <Moon size={24} style={{ opacity: 0.3, cursor: "not-allowed" }} />
          </div>
        </div>

        {/* Decorative assets */}
        <div style={{ position: "absolute", left: "-10px", top: "40px", width: "360px", height: "auto", transform: "rotate(-4deg)", zIndex: 2, pointerEvents: "none" }}>
          <img src="/formsType/prupleCard.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
        <div style={{ position: "absolute", left: "50px", bottom: "-157px", width: "410px", height: "auto", zIndex: 2, pointerEvents: "none" }}>
          <img src="/formsType/catWithBall.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
        <div style={{ position: "absolute", right: "120px", top: "180px", width: "330px", transform: "rotate(3deg)", zIndex: 2, pointerEvents: "none" }}>
          <img src="/formsType/midRightCard.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
        <div style={{ position: "absolute", right: "10px", bottom: "-35px", width: "460px", zIndex: 2, pointerEvents: "none" }}>
          <img src="/formsType/bottomRightCat(1).png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* Main form card */}
        <div style={{
          position: "relative", backgroundColor: "#fffdf9",
          border: "1.5px solid #2d2416", borderRadius: "16px",
          width: "860px", height: "790px",
          boxShadow: "4px 5px 0px rgba(45,36,22,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "45px 40px 24px 40px", boxSizing: "border-box", marginTop: "45px",
        }}>
          {/* Peekaboo boy */}
          <div style={{ position: "absolute", top: "-170px", left: "55%", transform: "translateX(-41%)", width: "330px", height: "auto", zIndex: 5, pointerEvents: "none" }}>
            <img src="/formsType/BoyOnTop.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* Form title + description */}
          <div style={{ textAlign: "center", marginBottom: "20px", width: "100%" }}>
            <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: "38px", fontWeight: "900", color: "#2d2416", margin: "0 0 2px 0" }}>
              {formPayload ? (formPayload as any).title : "Untitled Skeleton Pad"}
            </h1>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "700", color: "rgba(45,36,22,0.55)", margin: 0 }}>
              {formPayload ? ((formPayload as any).description ?? "Draft mode container view.") : "Configure structural fields in the workspace manager sidebar."}
            </p>
          </div>

          {/* Scrollable fields */}
          <div
            className="custom-scrollbar"
            style={{
              width: "100%", flex: 1, overflowY: "auto", overflowX: "hidden",
              display: "flex", flexDirection: "column", gap: "20px",
              border: "1px dashed rgba(45,36,22,0.1)", borderRadius: "10px",
              padding: "16px 14px", marginBottom: "20px", boxSizing: "border-box",
            }}
          >
            {allFields.length === 0 && (
              <p style={{ textAlign: "center", color: "rgba(45,36,22,0.4)", fontFamily: "'Nunito', sans-serif", fontSize: "14px", padding: "40px 0" }}>
                No active fields found on canvas sketch! Drag items on the editor to populate elements.
              </p>
            )}
            {allFields.map((field: any) => (
              <DynamicPublicField
                key={field.id}
                field={field}
                value={answers[field.id]}
                error={errors[field.id]}
                onChange={val => {
                  setAnswers(prev => ({ ...prev, [field.id]: val }));
                }}
              />
            ))}
          </div>

          {/* Submit button intercepting actions to manifest Toast Overlay */}
          {allFields.length > 0 && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", zIndex: 10, flexShrink: 0 }}>
              <ScribbleButton
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                Submit Response
              </ScribbleButton>
            </div>
          )}
        </div>
      </div>

      {/* ── THE DETACHED PREVIEW ALIGNMENT TOAST MODAL ── */}
      {isPreviewModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45, 36, 22, 0.25)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", zIndex: 999999, justifyContent:"center" }}>
          <div style={{ position: "relative", width: "420px", padding: "40px 30px 30px 30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            
            {/* Playful vector board mapping card profile outlines safely */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible", filter: "drop-shadow(5px 6px 0px #2d2416)" }} viewBox="0 0 440 260" preserveAspectRatio="none" fill="none">
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" fill="#fffdf9" />
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <div onClick={() => setIsPreviewModalOpen(false)} style={{ position: "absolute", top: "14px", right: "20px", fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "bold", color: "#2d2416", cursor: "pointer", zIndex: 2 }}>✕</div>
            <div style={{ fontSize: "40px", zIndex: 1, position: "relative" }}>📝</div>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", fontWeight: "900", color: "#2d2416", margin: 0, zIndex: 1, position: "relative" }}>Preview Mode Only</h2>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "700", color: "rgba(45, 36, 22, 0.6)", margin: 0, lineHeight: "1.5", zIndex: 1, position: "relative" }}>
              You are currently auditing the live wireframe layout workspace. Submissions are offline during build previews!
            </p>
            <button 
              onClick={() => setIsPreviewModalOpen(false)} 
              style={{ backgroundColor: "#9462f5", color: "#ffffff", fontFamily: "'Caveat', cursive", fontSize: "20px", fontWeight: "bold", border: "1.5px solid #2d2416", borderRadius: "8px", padding: "6px 36px", cursor: "pointer", outline: "none", zIndex: 1, position: "relative", boxShadow: "2px 2px 0px #2d2416" }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(45,36,22,0.15); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(45,36,22,0.3); }
      `}} />
    </div>
  );
};

export default DefaultScribbleFormPage;