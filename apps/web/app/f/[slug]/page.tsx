// "use client"

// import { AlertCircle } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { use, useState, useRef, useEffect } from 'react';
// import Image from 'next/image';
// import { Card, CardContent } from '~/components/ui/card';
// import { applyConditions, buildFieldSchema } from "@repo/validators";
// import { Skeleton } from '~/components/ui/skeleton';
// import { useTrackEvent } from '~/hooks/api';
// import { usePublicForm } from '~/hooks/api/forms';
// import { getErrorMessage } from '~/lib/errors';
// import { toast } from 'sonner';
// import { ScribbleButton } from '~/components/scribble/ScribbleButton';

// // ── CUSTOM THEMED INPUT RENDERER ──
// function DynamicPublicField({ field, value, onChange, error }: {
//   field: any; value: any; onChange: (v: any) => void; error?: string;
// }) {
//   const labelStyle = {fontFamily: "'Caveat', cursive, sans-serif", display: "block", fontSize: "14px", fontWeight: "700", color: "#2d2416", marginBottom: "6px" };
//   const errorStyle = {fontFamily: "'Caveat', cursive, sans-serif", fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" };
  
//   if(typeof error === "string"){
//     error = error.replaceAll("Invalid input: ","").replaceAll("Invalid option: ","").replaceAll(" received undefined","")
//   }
  
//   const baseInputStyle = {
//     width: "100%",
//     minHeight: "42px",
//     padding: "0 14px",
//     border: "1.5px solid #c8b8a0",
//     borderRadius: "8px",
//     backgroundColor: "rgba(255, 253, 247, 0.75)",
//     fontFamily: "'Nunito', sans-serif",
//     fontSize: "14px",
//     color: "#2d2416",
//     outline: "none",
//     boxSizing: "border-box" as const
//   };

//   switch (field.type) {
//     case "short_text":
//     case "email":
//     case "number":
//     case "phone":
//       return (
//         <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
//           <label style={labelStyle}>
//             {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
//           </label>
//           <input 
//             type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"} 
//             placeholder={field.placeholder ?? `Type your answer here...`} 
//             value={value ?? ""} 
//             onChange={e => onChange(field.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value)} 
//             style={baseInputStyle} 
//           />
//           {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }}/>{error}</p>}
//         </div>
//       );

//     case "long_text":
//       return (
//         <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
//           <label style={labelStyle}>
//             {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
//           </label>
//           <textarea 
//             placeholder={field.placeholder ?? "Write your thoughts here..."} 
//             value={value ?? ""} 
//             onChange={e => onChange(e.target.value)} 
//             rows={4} 
//             style={{ ...baseInputStyle, padding: "10px 14px", resize: "none" }} 
//           />
//           {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }}/>{error}</p>}
//         </div>
//       );

//     case "single_select": {
//       const opts: string[] = field.config?.options ?? [];
//       return (
//         <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
//           <label style={labelStyle}>
//             {field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}
//           </label>
//           <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "4px" }}>
//             {opts.map(opt => (
//               <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2d2416", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
//                 <input 
//                   type="radio" 
//                   name={field.id} 
//                   checked={value === opt} 
//                   onChange={() => onChange(opt)} 
//                   style={{ accentColor: "#634cc9", cursor: "pointer", width: "16px", height: "16px" }} 
//                 />
//                 <span style={{fontFamily: "'Caveat', cursive, sans-serif"}}>{opt}</span>
//               </label>
//             ))}
//           </div>
//           {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }}/>{error}</p>}
//         </div>
//       );
//     }

//     case "checkbox":
//       return (
//         <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
//           <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
//             <input 
//               type="checkbox" 
//               checked={!!value} 
//               onChange={e => onChange(e.target.checked)} 
//               style={{fontFamily: "'Caveat', cursive, sans-serif", accentColor: "#634cc9", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }} 
//             />
//             <span style={{fontFamily: "'Caveat', cursive, sans-serif"}}>{field.label} {field.required && <span style={{ color: "#ef4444" }}>*</span>}</span>
//           </label>
//           {error && <p style={errorStyle}><AlertCircle style={{ width: "13px", height: "13px" }}/>{error}</p>}
//         </div>
//       );

//     default:
//       return null;
//   }
// }

// // ── Password gate ──────────────────────────────────────────────────
// function PasswordGate({ slug, onUnlock }: { slug: string; onUnlock: (pw: string) => void }) {
//   const [pw, setPw] = useState("");
//   return <h1>hello</h1>;
// }

// const page = ({ params }: { params: Promise<{ slug: string }> }) => {
//   const { slug }  = use(params);
//   const router    = useRouter();
//   const apiUrl    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

//   const [password, setPassword]   = useState<string | undefined>(undefined);
//   const [answers, setAnswers]     = useState<Record<string, unknown>>({});
//   const [errors, setErrors]       = useState<Record<string, string>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [formClosed, setFormClosed] = useState(false);

//   const trackEvent = useTrackEvent();
//   const { data: form, isLoading, error } = usePublicForm(slug, "hackathon2025");

//   // ── RESPONSIVE SCALE ──────────────────────────────────────────────
// // ── RESPONSIVE SCALE ──
// const [scale, setScale] = useState(0.8);

// useEffect(() => {
//   const update = () => {
//   const scaleX = window.innerWidth  / 1250;
//   const scaleY = window.innerHeight / 900;
//   // Cap at 0.8 — never go above original design
//   // On small screens, shrink proportionally
//   setScale(Math.min(scaleX, scaleY, 0.8));
// };
//   update();
//   window.addEventListener("resize", update);
//   return () => window.removeEventListener("resize", update);
// }, []);
//   // ─────────────────────────────────────────────────────────────────

//   const hasViewed = useRef(false);
//   const startTimeRef = useRef(Date.now());
//   const hasStarted = useRef(false);
//   const hasSubmitted = useRef(false);

  

//   // Track form_view once on mount
//   useEffect(() => {
//     if (form && !("requiresPassword" in form) && !hasViewed.current) {
//       trackEvent.mutate({
//         formId: form.id,
//         eventType: "form_view",
//       });
//     }

//     return () => {
//       if (hasStarted.current && !hasSubmitted.current && form) {
//         trackEvent.mutate({
//           formId: form.id,
//           eventType: "form_abandon",
//         });
//       }
//     };
//   }, [form?.id]);

//   if (isLoading) return (
//     <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fbf3eb" }}>
//       <div className="w-full max-w-xl space-y-4">
//         <Skeleton className="h-10 w-2/3" />
//         <Skeleton className="h-4 w-full" />
//         <Skeleton className="h-20 w-full" />
//         <Skeleton className="h-20 w-full" />
//       </div>
//     </div>
//   );

//   if (error || !form) return (
//     <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fbf3eb" }}>
//       <Card className="max-w-md w-full">
//         <CardContent className="py-12 text-center space-y-2">
//           <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
//           <p className="font-semibold">Form not available</p>
//           <p className="text-sm text-muted-foreground">
//             {getErrorMessage(error) ?? "This form doesn't exist or has been removed."}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );

//   if (formClosed) return (
//     <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fbf3eb" }}>
//       <Card className="max-w-md w-full">
//         <CardContent className="py-12 text-center space-y-2">
//           <p className="font-semibold">Form Closed</p>
//           <p className="text-sm text-muted-foreground">This form is no longer accepting responses.</p>
//         </CardContent>
//       </Card>
//     </div>
//   );

//   // Password gate
//   if ((form as any).requiresPassword && password === undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fbf3eb" }}>
//         <PasswordGate slug={slug} onUnlock={pw => setPassword(pw)} />
//       </div>
//     );
//   }

//   const allFields     = (form as any).fields ?? [];
//   const activeFields  = applyConditions(allFields, answers as Record<string, unknown>);
//   const inputFields   = activeFields.filter((f: any) => f.type !== "divider" && f.type !== "section_title");
//   const answered      = inputFields.filter((f: any) => answers[f.id] !== undefined && answers[f.id] !== "").length;
//   const progressPct   = inputFields.length > 0 ? Math.round((answered / inputFields.length) * 100) : 0;

//   async function handleSubmit() {
//     const schema     = buildFieldSchema(inputFields as any);
//     const validation = schema.safeParse(answers);

//     if (!validation.success) {
//       const fieldErrors: Record<string, string> = {};
//       for (const [key, issues] of Object.entries(validation.error.flatten().fieldErrors)) {
//         fieldErrors[key] = (issues as string[])[0] ?? "Invalid";
//       }
//       setErrors(fieldErrors);
//       return;
//     }
//     setErrors({});
//     setSubmitting(true);

//     try {
//       const res = await fetch(`${apiUrl}/f/${slug}/submit`, {
//         method:      "POST",
//         headers:     { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           formVersionId: (form as any).currentVersionId,
//           answers:       validation.data,
//           metadata: {
//             timeToCompleteMs: Date.now() - startTimeRef.current,
//             referrer: typeof window !== "undefined" ? document.referrer : "",
//           },
//           __hp: "",
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.code === "FORM_VERSION_OUTDATED") {
//           toast.error(getErrorMessage(data));
//           window.location.reload();
//           return;
//         }
//         if (data.code === "FORM_EXPIRED" || data.code === "FORM_RESPONSE_LIMIT") {
//           setFormClosed(true); return;
//         }
//         if (data.code === "VALIDATION_FAILED") {
//           setErrors(data.errors ?? {}); return;
//         }
//         alert(getErrorMessage(data));
//         return;
//       }

//       if (!hasSubmitted.current) {
//         hasSubmitted.current = true;
//       }

//       if (data.redirectUrl) {
//         window.location.href = data.redirectUrl;
//       } else {
//         router.push(`/f/${slug}/success`);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//  <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", overflow: "hidden" }}>
      
//       {/* ── BACKGROUND FIXED ANIME COVER COMPOSITION FRAME ── */}
//       <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, margin: "0px 0px" }}>
//         <Image 
//           src="/FormAnime.png" 
//           alt="Anime Convention Interactive Theme Base" 
//           fill 
//           priority 
//           className="object-fill"
//         />
//       </div>

//       {/* ── GLOBAL INTERACTIVE OVERLAY SYSTEM MATRIX ── */}
//       <div 
//         style={{
//           position: "absolute", 
//           left: 0, 
//           top: 0, 
//           width: "125vw",    // unchanged
//           height: "125vh",   // unchanged
//           display: "flex",
//           transform: `scale(${scale})`,   // ← was hardcoded scale(0.8)
//           transformOrigin: "top left",    // unchanged
//           boxSizing: "border-box",
//           zIndex: 1,
//           padding: "40px"
//         }}
//       >
//         {/* Main Content Layout Columns Alignment */}
//         <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          
//           {/* 1. TOP HEADER OVERLAY (Sits cleanly inside the empty space of the top notebook paper sheet asset) */}
//           <div style={{ 
//             width: "400px", // Compressed slightly to prevent text from overflowing into the character asset space
//             height: "120px", 
//             marginLeft: "620px", // FIXED: Shifted coordinates leftwards to perfectly sit inside the lines
//             marginTop: "80px", // FIXED: Lowered bounding track to prevent overlap with the sticky tape decoration
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             padding: "0 10px",
//             boxSizing: "border-box",
//             maxHeight:"120px"
//           }}>
//             {/* Form Main Layout Title Text */}
//             <h1 style={{ 
//               fontFamily: "'Caveat', cursive, sans-serif", // Matches your signature handwritten anime brand style track
//               fontSize: "26px", // Enlarged font tracking sizing to give it a strong visual impact
//               fontWeight: "900", 
//               color: "#2d2416", // Custom hand-drawn warm ink accent tone color split
//               margin: "0 0 2px 0",
//               lineHeight: "1.1",
//               letterSpacing: "-0.01em",
//               paddingBottom:"24px"
//             }}>
//               { form?.title ?? "U stupid give title to form"}
//             </h1>
            
//             {/* Form Description Subtitle Block */}
//             <p style={{ 
//               fontFamily: "'Nunito', sans-serif", // Clean body baseline tracking layout fonts 
//               fontSize: "14px", 
//               fontWeight: "700", 
//               color: "rgba(45, 36, 22, 0.65)", // Subdued secondary text treatment color matrix profiles
//               margin: 0,
//               lineHeight: "1.4",
//               letterSpacing: "0.01em"
//             }}>
//               {form?.description ?? "Stupid give description to form 🌸"}
//             </p>
//           </div>

//           {/* 2. LOWER CONTENT ZONE (Maps exactly over the large central empty cardboard frame sheet) */}
//           <div 
//             style={{ 
//               width: "640px", // FIXED: Adjusted width metrics to lock flush into background frame line rules
//               height: "920px", // FIXED: Extended tracking window size down to provide ample layout depth 
//               marginLeft: "580px", // FIXED: Center aligned seamlessly inside the white notebook sheet canvas bounds
//               marginTop: "60px",
//               boxSizing: "border-box",
//               display: "flex",
//               flexDirection: "column",
//               gap: "24px",
//               overflowY: "auto", // Keeps overflow scrolling tracking strictly bound inside the layout frame
//               overflowX: "hidden",
//               padding: "20px 36px 60px 46px",
//               maxHeight:"540px"
//             }} 
//             className="custom-scrollbar"
//           >
//             {/* DYNAMIC FORM FIELDS RENDER TRACK LOOP */}
//             {allFields.map((field: any) => (
//               <DynamicPublicField 
//                 key={field.id}
//                 field={field}
//                 value={answers[field.id]}
//                 error={errors[field.id]}
//                 onChange={(val) => {
//                   setAnswers(prev => ({ ...prev, [field.id]: val }));
//                   if (!hasStarted.current) hasStarted.current = true;
//                 }}
//               />
//             ))}

//             {/* FORM ACTIONS SUBMIT BUTTON */}
//             {allFields.length > 0 && (
//               <div style={{ marginTop: "16px", width: "100%", display: "flex", justifyContent: "center" }}>
//                 <ScribbleButton
//                   type="button"
//                   disabled={submitting}
//                   onClick={handleSubmit}
//                   style={{
//                     backgroundColor: "#634cc9",
//                     color: "#654280",
//                     fontFamily: "'Caveat', cursive",
//                     fontSize: "15px",
//                     fontWeight: "800",
//                     border: "none",
//                     borderRadius: "8px",
//                     padding: "12px 32px",
//                     cursor: submitting ? "not-allowed" : "pointer",
//                     boxShadow: "0px 4px 10px rgba(99, 76, 201, 0.25)",
//                     transition: "all 0.1s ease",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px"
//                   }}
//                   onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = "translateY(-1px)")}
//                   onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = "none")}
//                 >
//                   {submitting ? "Submitting..." : "Submit Application"}
//                 </ScribbleButton>
//               </div>
//             )}
//           </div>

//           {/* 3. RIGHT SIDEBAR PINNED YELLOW NOTEBOOK LAYER OVERLAY */}
//           {/* Maps seamlessly over image_e7968c.png to display custom copy instructions */}
//           <div style={{
//             position: "absolute",
//             top: "300px",
//             left: "1415px",
//             width: "250px",
//             height: "260px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             padding: "35px 28px 25px 28px",
//             boxSizing: "border-box",
//             transform: "rotate(1.5deg)" // Custom tilt angle layer maps organic pushpin perspective offset
//           }}>
//             <p style={{
//               fontFamily: "'Caveat', cursive",
//               fontSize: "25px",
//               fontWeight: "bold",
//               color: "#333333",
//               textAlign: "center",
//               lineHeight: "1.3",
//               margin: 0,
//               userSelect: "none"
//             }}>
//               stop reading this stupid fill the form and leave
//             </p>
//           </div>

//         </div>
//       </div>

//       {/* Embedded Sketch Scrollbar Styles Injector */}
//       <style dangerouslySetInnerHTML={{__html: `
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(45, 36, 22, 0.18);
//           border-radius: 99px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(45, 36, 22, 0.35);
//         }
//       `}} />

//     </div>
//   );
// }

// export default page;

"use client";

// FILE: apps/web/app/f/[slug]/page.tsx
//
// FIXES APPLIED:
// 1. HARDCODED PASSWORD: usePublicForm(slug, "hackathon2025") → usePublicForm(slug, password)
//    The old code ALWAYS passed "hackathon2025" as the password so every form was
//    authenticated with a dev password. Now it uses the real password state.
//
// 2. PASSWORD GATE: PasswordGate was `return <h1>Secure Gate</h1>` — completely broken.
//    Replaced with a real working UI that calls onUnlock(pw) when submitted.
//    Also handles wrongPassword feedback when the server returns { wrongPassword: true }.
//
// 3. MISSING FIELD TYPES: multi_select, rating, date, number were not rendered.
//    All 4 added inside DynamicPublicField with proper controlled inputs.
//
// 4. SUBMIT ERROR: was `alert(getErrorMessage(data))` — replaced with toast.error()
//    and proper handling of FORM_VERSION_OUTDATED / FORM_EXPIRED / VALIDATION_FAILED codes.
//
// 5. REQUIRES-PASSWORD GATE: the old check was `password === undefined` which means
//    after a wrong password the user was shown the form (broken). Now checks
//    (form as any).requiresPassword which is always true until the server returns
//    a real form object.

import { AlertCircle, Lock, Moon } from "lucide-react";
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
// FIX: added multi_select, rating, date, number cases (were missing, defaulted to null)
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

  // Clean up Zod error messages for display
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

    // FIX: number was grouped with short_text before — now standalone with type="number"
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
      // Reads options from field.config.options (set in the builder sidebar)
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

    // FIX: multi_select was completely missing — added with checkbox group
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

    // ─── DYNAMIC RATING CONFIG BOUNDARY ───
    case "rating": {
      const ratingValue = typeof value === "number" ? value : 0;
      
      // DYNAMIC FIX: Extract max limit from configuration object stream or default safely to 5
      const maxStars = typeof field.config?.max === "number" ? field.config.max : 5;
      
      // DYNAMIC FIX: Generate an array sequence based exactly on the configured maximum limit
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

    // FIX: date was missing — added native date input
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
// FIX: was `return <h1>Secure Gate</h1>` — completely non-functional.
// Now renders a proper password input that calls onUnlock(pw) on submit.
// externalError: passed in when server returns { wrongPassword: true }
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

  // Show server-side wrong-password error when it arrives
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
      {/* Lock icon */}
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
  // FIX: strip /trpc suffix — NEXT_PUBLIC_API_URL may point to the tRPC endpoint
  // but the form submit endpoint is at the Express root (/f/:slug/submit)
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const apiUrl    = rawApiUrl.replace(/\/trpc\/?$/, "");

  // FIX: password state feeds into usePublicForm — was hardcoded "hackathon2025"
  const [password,    setPassword]    = useState<string | undefined>(undefined);
  const [answers,     setAnswers]     = useState<Record<string, unknown>>({});
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [submitting,  setSubmitting]  = useState(false);
  const [formClosed,  setFormClosed]  = useState(false);
  const [isTrickedOpen, setIsTrickedOpen] = useState(false);

  const trackEvent = useTrackEvent();

  // FIX: was usePublicForm(slug, "hackathon2025") — now uses real password state
  const { data: form, isLoading, error } = usePublicForm(slug, password);

  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const update = () => {
      const scaleX = window.innerWidth  / 1250;
      const scaleY = window.innerHeight / 900;
      setScale(Math.min(scaleX, scaleY, 0.8));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const hasViewed    = useRef(false);
  const startTimeRef = useRef(Date.now());
  const hasStarted   = useRef(false);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (form && !("requiresPassword" in form) && !hasViewed.current) {
      hasViewed.current = true;
      trackEvent.mutate({ formId: (form as any).id, eventType: "form_view" });
    }
    return () => {
      if (hasStarted.current && !hasSubmitted.current && form && !("requiresPassword" in form)) {
        trackEvent.mutate({ formId: (form as any).id, eventType: "form_abandon" });
      }
    };
  }, [(form as any)?.id]);

  // ── LOADING ──
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

  // ── NOT FOUND ──
  if (error || !form) return (
    <div 
      style={{ 
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fdf6ed", // Scribble warm paper canvas background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        boxSizing: "border-box",
        padding: "24px"
      }}
    >
      <div 
        style={{ 
          position: "relative", 
          width: "100%",
          maxWidth: "460px", // Expanded slightly to comfortably hold your custom 320px ScribbleButton
          backgroundColor: "#fffdf9",
          border: "1.5px solid #2d2416",
          borderRadius: "16px",
          padding: "45px 32px 36px 32px",
          boxShadow: "0 6px 24px rgba(45, 36, 22, 0.06), 0 2px 8px rgba(45, 36, 22, 0.04)", 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          boxSizing: "border-box",
          transform: "rotate(-0.5deg)" 
        }}
      >
        {/* Decorative Tape Strip */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "50%",
            transform: "translateX(-50%) rotate(1deg)",
            width: "110px",
            height: "20px",
            backgroundColor: "#ffd6db", 
            opacity: 0.85,
            borderRadius: "2px",
            border: "1px dashed rgba(45,36,22,0.15)",
            zIndex: 2
          }}
        />

        {/* Warning Icon Container */}
        <div 
          style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "50%", 
            backgroundColor: "#fff0f1", 
            border: "1.5px dashed #ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <AlertCircle style={{ color: "#ef4444", width: "26px", height: "26px" }} />
        </div>

        {/* Text Details Stack */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <h3 
            style={{ 
              fontFamily: "'Caveat', cursive", 
              fontSize: "32px", // Punchy, crisp handwritten heading title
              fontWeight: 900, 
              color: "#2d2416", 
              margin: 0,
              lineHeight: 1
            }}
          >
            Form not published yet!
          </h3>
          <p 
            style={{ 
              fontFamily: "'Nunito', sans-serif", 
              fontSize: "14px", 
              fontWeight: "700", 
              color: "rgba(45, 36, 22, 0.7)", // Slightly darker for high readability
              margin: 0, 
              lineHeight: "1.5",
              padding: "0 10px"
            }}
          >
            The builder of this form is kinda silly. They shared the form link before actually publishing it onto the workspace registry!
          </p>
          
          {/* Technical Sub-Error Message Container */}
          <div style={{ borderTop: "1px dashed rgba(45, 36, 22, 0.12)", marginTop: "8px", paddingTop: "8px" }}>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: "600", color: "rgba(45, 36, 22, 0.45)", margin: 0 }}>
              {getErrorMessage(error) ?? "Status: draft / unlisted"}
            </p>
          </div>
        </div>

        {/* Reload Action Button (ScribbleButton Core Instance) */}
        <ScribbleButton 
          onClick={() => window.location.reload()}
          style={{ 
            marginTop: "4px" 
            // Internal styles like backgrounds, filters, widths, and hover vectors 
            // are safely left to your component to handle cleanly!
          }}
        >
          Check Again
        </ScribbleButton>
      </div>
    </div>
  );

// ── FORM CLOSED ──
  if (formClosed) return (
    <div 
      style={{ 
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fdf6ed", // Scribble warm paper canvas background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        boxSizing: "border-box",
        padding: "24px"
      }}
    >
      <div 
        style={{ 
          position: "relative", 
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#fffdf9",
          border: "1.5px solid #2d2416",
          borderRadius: "16px",
          padding: "40px 32px",
          boxShadow: "0 6px 24px rgba(45, 36, 22, 0.06), 0 2px 8px rgba(45, 36, 22, 0.04)", 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          boxSizing: "border-box",
          transform: "rotate(0.5deg)" // Mismatched opposite rotation angle from the error card
        }}
      >
        {/* Decorative Tape Strip */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            left: "50%",
            transform: "translateX(-50%) rotate(-1deg)",
            width: "110px",
            height: "20px",
            backgroundColor: "#dfcbf2", // Soft purple tape accent for the closure screen
            opacity: 0.85,
            borderRadius: "2px",
            border: "1px dashed rgba(45,36,22,0.15)",
            zIndex: 2
          }}
        />

        {/* Warning Icon Container */}
        <div 
          style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "50%", 
            backgroundColor: "#fffdf0", 
            border: "1.5px dashed #ef6c00", // Warm orange boundary line accent
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <span style={{ fontSize: "22px", filter: "grayscale(0.2)" }}>🔒</span>
        </div>

        {/* Text Details Stack */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
          <h3 
            style={{ 
              fontFamily: "'Caveat', cursive", 
              fontSize: "32px", 
              fontWeight: 900, 
              color: "#2d2416", 
              margin: 0,
              lineHeight: 1.1
            }}
          >
            Too late! Form closed.
          </h3>
          <p 
            style={{ 
              fontFamily: "'Nunito', sans-serif", 
              fontSize: "14px", 
              fontWeight: "700", 
              color: "rgba(45, 36, 22, 0.6)", 
              margin: 0, 
              lineHeight: "1.5",
              padding: "0 4px"
            }}
          >
            The creator shut down responses but still shared the link anyway. They basically just collected your click data and wasted your time. Honestly, you should sue them.
          </p>
        </div>

        {/* Go Back Home Utility Link */}
        <button 
          onClick={() => router.push("/dashboard")}
          style={{ 
            backgroundColor: "#2d2416", // Solid contrast dark button style
            color: "#fffdf9", 
            fontFamily: "'Caveat', cursive, sans-serif", 
            fontSize: "20px", 
            fontWeight: "bold", 
            border: "none", 
            borderRadius: "8px", 
            padding: "10px 44px", 
            cursor: "pointer", 
            outline: "none",
            boxShadow: "0 4px 12px rgba(45, 36, 22, 0.15)",
            transition: "transform 0.1s ease",
            width: "fit-content"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          Retreat Safely
        </button>
      </div>
    </div>
  );

  // ── PASSWORD GATE ──
  // FIX: old check was `password === undefined` which showed the form even after a
  // wrong password was submitted. Now checks form.requiresPassword which is truthy
  // whenever the server hasn't returned a real form yet (wrong/missing password).
  if ((form as any).requiresPassword) {
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

  const allFields    = (form as any).fields ?? [];
  const activeFields = applyConditions(allFields, answers as Record<string, unknown>);
  const inputFields  = activeFields.filter((f: any) => f.type !== "divider" && f.type !== "section_title");

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const schema     = buildFieldSchema(inputFields as any);
    const validation = schema.safeParse(answers);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, issues] of Object.entries(validation.error.flatten().fieldErrors)) {
        fieldErrors[key] = (issues as string[])[0] ?? "Invalid";
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors above and try again.");
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/f/${slug}/submit`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          formVersionId: (form as any).currentVersionId,
          answers:       validation.data,
          metadata: {
            timeToCompleteMs: Date.now() - startTimeRef.current,
            referrer: typeof window !== "undefined" ? document.referrer : "",
          },
          __hp: "",
        }),
      });

      const data = await res.json();

      // FIX: was `alert(getErrorMessage(data))` — now uses toast + specific codes
      if (!res.ok) {
        if (data.code === "FORM_VERSION_OUTDATED") {
          toast.error("This form has been updated. Reloading...");
          setTimeout(() => window.location.reload(), 1500);
          return;
        }
        if (data.code === "FORM_EXPIRED" || data.code === "FORM_RESPONSE_LIMIT") {
          setFormClosed(true);
          return;
        }
        if (data.code === "VALIDATION_FAILED") {
          setErrors(data.errors ?? {});
          toast.error("Please fix the errors above.");
          return;
        }
        toast.error(getErrorMessage(data));
        return;
      }

      if (!hasSubmitted.current) hasSubmitted.current = true;

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/f/${slug}/success`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", overflow: "hidden" }}>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Image src="/formsType/scribbleFormBG.png" alt="Scribble Canvas Theme Border Frame" fill priority className="object-fill" />
      </div>

      {/* Responsive container */}
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
            <Moon
              size={24}
              style={{ cursor: "pointer", transition: "transform 0.1s ease" }}
              onClick={() => setIsTrickedOpen(true)}
              onMouseEnter={e => (e.currentTarget.style.transform = "rotate(-12deg) scale(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "rotate(0deg) scale(1)")}
            />
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
              {(form as any)?.title ?? "Untitled Form"}
            </h1>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", fontWeight: "700", color: "rgba(45,36,22,0.55)", margin: 0 }}>
              {(form as any)?.description ?? ""}
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
              <p style={{ textAlign: "center", color: "rgba(45,36,22,0.4)", fontFamily: "'Nunito', sans-serif", fontSize: "14px" }}>
                This form has no fields yet.
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
                  if (!hasStarted.current) hasStarted.current = true;
                }}
              />
            ))}
          </div>

          {/* Submit button */}
          {allFields.length > 0 && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", zIndex: 10, flexShrink: 0 }}>
              <ScribbleButton
                type="button"
                disabled={submitting}
                submitting={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit Response"}
              </ScribbleButton>
            </div>
          )}
        </div>
      </div>

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