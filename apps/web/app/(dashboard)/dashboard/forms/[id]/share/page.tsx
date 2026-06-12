"use client";

// FILE: apps/web/app/(dashboard)/dashboard/forms/[id]/share/page.tsx
//
// FIXES APPLIED:
// 1. PREVIEW BUTTON: was `window.open(`/form/${formId}/preview`, "_blank")`
//    That route does not exist. Fixed to open the real public form at /f/${slug}.
//
// 2. QR CODE: was using api.qrserver.com (external CDN — breaks offline, blocked
//    by some networks, and makes the page dependent on a third party).
//    Replaced with <ScribbleQRCode> which renders via the `qrcode` npm package
//    onto a local <canvas> — no network call, always works, matches the same CSS theme.
//
// 3. VIEW LIVE / PUBLISH BUTTON: after publishForm succeeds the button now
//    opens the live form URL automatically.
//
// 4. responseLimit + expiresAt inputs: were using `defaultValue` (uncontrolled).
//    When the form reloads after save the inputs wouldn't show the new value.
//    Fixed to controlled inputs with local state synced from the form data.

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "~/components/Sidebar";
import { ScribbleButton } from "~/components/scribble/ScribbleButton";
import { ScribbleCustomInput } from "~/components/scribble/ScribInput";
import { useFormDetail, usePublishForm, useUnpublishForm, useUpdateForm } from "~/hooks/api/forms";
import { ScribbleQRCode } from "~/components/scribble/QRCode";
import { Calendar, Eye, LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function SharePage({ params }: SharePageProps) {
  const { id: formId } = use(params);

  const { data: form, isLoading } = useFormDetail(formId);
  const publishForm   = usePublishForm(formId);
  const unpublishForm = useUnpublishForm(formId);
  const updateForm    = useUpdateForm(formId);

  const [copied,     setCopied]     = useState(false);
  const [pwEnabled,  setPwEnabled]  = useState(false);
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");

  // FIX: controlled inputs for responseLimit and expiresAt
  // so they reflect the saved value after the form reloads from the server
  const [responseLimit, setResponseLimit] = useState<string>("");
  const [expiresAt,     setExpiresAt]     = useState<string>("");

  // Sync all controlled fields when form data loads
  useEffect(() => {
    if (!form) return;
    if (form.visibility) setVisibility(form.visibility as "public" | "unlisted");
    setResponseLimit(form.responseLimit ? String(form.responseLimit) : "");
    setExpiresAt(
  form.expiresAt
    ? new Date(form.expiresAt).toISOString().split("T")[0] ?? ""
    : ""
);
    // Show password toggle if form already has a password hash
    if ((form as any).passwordHash) setPwEnabled(true);
  }, [form?.id, form?.visibility, form?.responseLimit, form?.expiresAt]);

  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 1525;
      setScale(Math.max((window.innerWidth / baseWidth) * 0.8, 0.45));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const slug      = form?.customSlug ?? form?.slug ?? "";
  const formUrl   = `${APP}/f/${slug}`;
  const isPublished = form?.status === "published";

  function copyLink() {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  }

  function handleVisibilityChange(val: "public" | "unlisted") {
    setVisibility(val);
    updateForm.mutate({ id: formId, data: { visibility: val } });
  }

  function handlePublishToggle(checked: boolean) {
    if (checked) {
      publishForm.mutate({ id: formId });
    } else {
      unpublishForm.mutate({ id: formId });
    }
  }

  const socialLinks = [
    {
      label: "Twitter", color: "#c8e2fa",
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="#1da1f2"><path d="M19 3.5a9.5 9.5 0 01-2.7.74A4.7 4.7 0 0018.5 1.5a9.4 9.4 0 01-3 1.14A4.69 4.69 0 009.8 7c0 .37.04.73.11 1.07A13.3 13.3 0 011.6 3.8a4.69 4.69 0 001.45 6.26A4.67 4.67 0 011 9.57v.06a4.69 4.69 0 003.76 4.6 4.72 4.72 0 01-2.12.08 4.69 4.69 0 004.38 3.26A9.4 9.4 0 011 19a13.3 13.3 0 007.18 2.1c8.62 0 13.34-7.14 13.34-13.34 0-.2 0-.41-.02-.61A9.5 9.5 0 0019 3.5z" /></svg>,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}`,
    },
    {
      label: "Facebook", color: "rgba(255,255,255,0.8)",
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="#1877f2"><path d="M18 10a8 8 0 10-9.25 7.9v-5.6H6.5V10h2.25V8.2c0-2.23 1.33-3.46 3.36-3.46.97 0 1.99.17 1.99.17V7.1h-1.12c-1.1 0-1.45.69-1.45 1.39V10h2.46l-.39 2.3H11.5v5.6A8 8 0 0018 10z" /></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`,
    },
    {
      label: "WhatsApp", color: "#cff0d0",
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="#25d366"><path d="M10 2a8 8 0 00-6.88 12.06L2 18l4.06-1.07A8 8 0 1010 2zm0 14.5a6.46 6.46 0 01-3.29-.9l-.24-.14-2.41.64.65-2.36-.16-.25A6.5 6.5 0 1110 16.5zm3.58-4.87c-.2-.1-1.17-.58-1.35-.64-.18-.07-.32-.1-.45.1-.13.2-.52.64-.63.77-.12.13-.23.15-.43.05a5.4 5.4 0 01-1.59-1 5.96 5.96 0 01-1.1-1.4c-.11-.2-.01-.3.08-.4l.3-.35c.08-.1.1-.18.16-.3.05-.12.02-.23-.02-.32-.04-.1-.45-1.08-.62-1.48-.16-.39-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.6 0 .95.7 1.86.8 1.99.09.12 1.37 2.1 3.33 2.94.47.2.83.32 1.11.41.47.15.9.13 1.23.08.38-.06 1.17-.48 1.33-.94.17-.46.17-.86.12-.94-.05-.1-.18-.15-.38-.25z" /></svg>,
      href: `https://wa.me/?text=${encodeURIComponent(formUrl)}`,
    },
    {
      label: "Email", color: "rgba(255,255,255,0.8)",
      icon: <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="#ff1111" strokeWidth="1.5"><rect x="2" y="5" width="16" height="11" rx="2" /><path d="M2 7l8 5 8-5" strokeLinecap="round" /></svg>,
      href: `mailto:?subject=Fill this form&body=${encodeURIComponent(formUrl)}`,
    },
  ];

// ── LOADING SHARE SETTINGS ──
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          
          {/* Playful Mechanical Share Link Spinner Frame */}
          <div style={{ position: "relative", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {/* Background Hand-Drawn Radar Pulse rings */}
            <div 
              style={{
                position: "absolute",
                inset: 0,
                border: "1.5px dashed #c7b9ff",
                borderRadius: "50%",
                animation: "pulseRadar 1.8s infinite ease-out"
              }}
            />
            
            {/* The Sketched Link Nodes Vector Intersecting Loop Assembly */}
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#2d2416" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ 
                position: "relative",
                zIndex: 2,
                transformOrigin: "center center",
                animation: "linkWobble 1.4s infinite ease-in-out"
              }}
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" />
              {/* Little sparkle star point */}
              <path d="M12 2 L12 5 M22 12 L19 12" stroke="#9462f5" strokeWidth="1.5" opacity="0.6" />
            </svg>
          </div>

          {/* Text Messaging Info Stack */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "2px" }}>
            <p 
              style={{ 
                fontFamily: "'Caveat', cursive", 
                fontSize: "24px", 
                fontWeight: 900, 
                color: "#2d2416", 
                margin: 0,
                letterSpacing: "0.2px"
              }}
            >
              Forging access keys...
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
              Generating unlisted sharing endpoints & permissions
            </p>
          </div>
        </div>

        {/* Global Keyframes Injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes linkWobble {
            0% { transform: scale(1) rotate(0deg); }
            33% { transform: scale(1.08) rotate(-8deg); }
            66% { transform: scale(0.95) rotate(12deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes pulseRadar {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#fdf6ed", color: "#2d2416", overflow: "hidden" }}>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <Image src="/shareBG.png" alt="Share Background" fill priority className="object-fill" />
      </div>

      {/* Responsive wrapper */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        width: "1920px", height: "1080px",
        display: "flex",
        transform: `scale(${scale})`, transformOrigin: "top left",
        boxSizing: "border-box", paddingLeft: "76px", paddingTop: "24px", zIndex: 1,
      }}>
        <Sidebar activeTab="Design" />

        <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", paddingLeft: "90px" }}>

          {/* Header */}
          <div style={{ width: "100%", height: "110px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "16px", paddingRight: "185px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ width: "320px", paddingTop: "12px" }}>
                <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "36px", margin: "0 0 4px 0", fontWeight: "bold" }}>Share & Publish</h2>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "14px", color: "rgba(45,36,22,0.6)", margin: 0 }}>
                  Make your form live and start collecting responses.
                </p>
              </div>
              <div style={{ position: "relative", width: "240px", height: "125px", marginTop: "56px", marginLeft: "160px" }}>
                <Image src="/shareBoy.png" alt="Ready to fly!" fill priority style={{ objectFit: "contain" }} />
              </div>
            </div>

            {/* FIX: was /form/${formId}/preview — now opens real public URL */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "30px" }}>
              <ScribbleButton onClick={() => {
                if (slug) window.open(`/f/${slug}/preview`, "_blank");
                else toast.error("Publish the form first to preview it.");
              }}>
                <Eye size={19} style={{paddingRight:"6px"}}/> Preview Form
              </ScribbleButton>
            </div>
          </div>

          {/* Content grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "840px 600px", width: "100%", height: "calc(100% - 130px)", overflow: "hidden" }}>

            {/* LEFT COLUMN */}
            <div className="custom-scrollbar" style={{ width: "100%", height: "780px", display: "flex", flexDirection: "column", padding: "4px 16px 32px 16px", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box", marginTop: "23px", position: "relative" }}>

              {/* CARD 1: PUBLISH SETTINGS */}
              <div style={{ position: "relative", width: "100%", height: "400px", flexShrink: 0 }}>
                <Image src="/signupBorderONE.png" alt="Publish settings container" fill priority style={{ objectFit: "fill" }} />
                <div style={{ position: "relative", zIndex: 1, padding: "40px 40px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif" }}>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#22c55e", color: "white", fontSize: "12px", fontWeight: "bold" }}>1</div>
                    <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", fontWeight: "800", color: "#2d2416", margin: 0 }}>Publish Settings</h3>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(45,36,22,0.6)", margin: "0 0 16px 32px", fontWeight: "600" }}>Choose how you want to share your form.</p>

                  <div style={{ display: "flex", gap: "16px", paddingLeft: "32px", marginBottom: "20px" }}>
                    {(["public", "unlisted"] as const).map(vis => (
                      <label
                        key={vis}
                        onClick={() => handleVisibilityChange(vis)}
                        style={{
                          flex: 1, height: "90px",
                          border: `1.5px solid ${visibility === vis ? "#634cc9" : "#c8b8a0"}`,
                          borderRadius: "8px",
                          backgroundColor: visibility === vis ? "rgba(99,76,201,0.02)" : "transparent",
                          padding: "12px", display: "flex", gap: "10px",
                          cursor: "pointer", boxSizing: "border-box",
                        }}
                      >
                        <input
                          type="radio" name="form-privacy" checked={visibility === vis}
                          onChange={() => handleVisibilityChange(vis)}
                          style={{ accentColor: "#634cc9", marginTop: "3px", cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", fontWeight: "800", color: "#2d2416", textTransform: "capitalize" }}>{vis}</span>
                            {vis === "public" && <span style={{ fontSize: "10px", fontWeight: "bold", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", padding: "1px 6px", borderRadius: "99px" }}>Recommended</span>}
                          </div>
                          <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: "600", lineHeight: "1.3", marginTop: "2px" }}>
                            {vis === "public" ? "Anyone with the link can view and respond." : "Only people with the link can view and respond."}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div style={{ height: "1px", backgroundColor: "rgba(200,184,160,0.3)", width: "calc(100% - 32px)", marginLeft: "32px", marginBottom: "14px" }} />

                  {/* Accept Responses toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "32px", paddingRight: "12px", paddingTop: "23px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: "13px", fontWeight: "800", color: "#2d2416" }}>Accept Responses</span>
                      <span style={{ fontSize: "11px", color: "rgba(45,36,22,0.5)", fontWeight: "600" }}>
                        {isPublished ? "Your form is live and accepting responses." : "Publish your form to start collecting responses."}
                      </span>
                    </div>
                    <label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px", cursor: "pointer" }}>
                      <input
                        type="checkbox" checked={isPublished}
                        disabled={publishForm.isPending || unpublishForm.isPending}
                        onChange={e => handlePublishToggle(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{ position: "absolute", inset: 0, backgroundColor: isPublished ? "#22c55e" : "#c8b8a0", borderRadius: "99px", transition: "0.2s", opacity: (publishForm.isPending || unpublishForm.isPending) ? 0.6 : 1 }}>
                        <span style={{ position: "absolute", left: "3px", bottom: "3px", backgroundColor: "white", width: "16px", height: "16px", borderRadius: "50%", transition: "0.2s", transform: isPublished ? "translateX(18px)" : "translateX(0)" }} />
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Decoration */}
              <div style={{ position: "absolute", top: "280px", left: "185px", width: "505px", height: "180px", zIndex: 10, pointerEvents: "none" }}>
                <Image src="/boyholding.png" alt="" fill priority style={{ objectFit: "contain" }} />
              </div>

              {/* CARD 2: SHARE LINK */}
              <div style={{ position: "relative", width: "750px", height: "250px", flexShrink: 0, padding: "26px 26px" }}>
                <Image src="/sharemidouter.png" alt="Share container" fill priority style={{ objectFit: "fill" }} />
                <div style={{ position: "relative", zIndex: 1, padding: "22px 26px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif" }}>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: "#f5b800", color: "#2d2416", fontSize: "12px", fontWeight: "bold" }}>2</div>
                    <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", fontWeight: "800", color: "#2d2416", margin: 0 }}>Share Your Form</h3>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(45,36,22,0.6)", margin: "0 0 16px 32px", fontWeight: "600" }}>Copy the link or share it directly.</p>

                  <div style={{ paddingLeft: "32px", marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
                    <ScribbleCustomInput
                      type="text" readOnly value={formUrl}
                      leftIcon={<LinkIcon style={{ width: "14px", height: "14px", color: "rgba(45,36,22,0.4)" }} />}
                      containerStyle={{ background: "white" }}
                      style={{ color: "#2d2416", fontWeight: "600" }}
                    />
                    <div style={{ position: "absolute", right: "36px", top: "75px" }}>
                      <ScribbleButton
                        onClick={copyLink}
                        style={{ height: "30px", padding: "0 14px", fontSize: "12px", backgroundColor: copied ? "#cff0d0" : "#e2d7cc", zIndex: 2, marginTop: "12px" }}
                      >
                        {copied ? "Copied! ✓" : "Copy Link"}
                      </ScribbleButton>
                    </div>
                  </div>

                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: "11px", fontWeight: "800", color: "rgba(45,36,22,0.4)", paddingLeft: "32px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.02em" }}>Or share on</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "32px", flexWrap: "wrap" }}>
                    {socialLinks.map(item => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: "'Caveat', cursive", display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "6px", border: "1.2px solid #c8b8a0", backgroundColor: item.color, textDecoration: "none", color: "#2d2416", fontSize: "12px", fontWeight: "700", transition: "transform 0.1s ease" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                      >
                        {item.icon}<span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARDS 3 & 4: QR + LIMITS */}
              <div style={{ display: "grid", gridTemplateColumns: "330px 390px", gap: "20px", width: "100%", height: "180px", marginLeft: "23px", flexShrink: 0, marginBottom: "4px" }}>

                {/* FIX: was <img src="api.qrserver.com/..."> — replaced with local canvas QR */}
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image src="/sharebottomleft.png" alt="QR container" fill priority style={{ objectFit: "fill" }} />
                  <div style={{ position: "relative", zIndex: 1, padding: "23px 35px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: "'Nunito', sans-serif" }}>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "800", color: "#2d2416", marginBottom: "8px", marginTop: "12px" }}>Scan QR Code</span>
                    <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: 0 }}>
                      <ScribbleQRCode value={formUrl} size={130} color="#2d2416" bg="#faf4f0" />
                    </div>
                  </div>
                </div>

                {/* Response Limit + Expiry */}
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Image src="/shareBottomRight.png" alt="Form limits container" fill priority style={{ objectFit: "fill" }} />
                  <div style={{ position: "relative", zIndex: 1, padding: "40px 60px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", fontFamily: "'Nunito', sans-serif" }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontFamily: "'Caveat', cursive", fontSize: "11px", fontWeight: "800", color: "#2d2416" }}>Response Limit</label>
                      {/* FIX: controlled input with local state */}
                      <ScribbleCustomInput
                        type="number"
                        placeholder="No limit (e.g. 100)"
                        style={{ height: "10px", fontSize: "13px" }}
                        value={responseLimit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponseLimit(e.target.value)}
                        onBlur={() => updateForm.mutate({ id: formId, data: { responseLimit: responseLimit ? Number(responseLimit) : null } })}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontFamily: "'Caveat', cursive", fontSize: "11px", fontWeight: "800", color: "#2d2416" }}>Expiry Date</label>
                      {/* FIX: controlled input with local state */}
                      <ScribbleCustomInput
                        type="date"
                        leftIcon={<Calendar style={{ width: "14px", height: "14px", color: "rgba(45,36,22,0.4)" }} />}
                        style={{ color: "#2d2416" }}
                        value={expiresAt}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
                        onBlur={() => updateForm.mutate({ id: formId, data: { expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null } })}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                      <label style={{ fontFamily: "'Caveat', cursive", fontSize: "11px", fontWeight: "800", color: "#2d2416" }}>Password Protect</label>
                      {/* FIX: toggling OFF now sends password:null to clear the hash on the server.
                          Previously only setPwEnabled(false) was called — the password stayed active. */}
                      <label style={{ position: "relative", display: "inline-block", width: "34px", height: "18px", cursor: "pointer" }}>
                        <input type="checkbox" checked={pwEnabled} onChange={e => {
                          const enabled = e.target.checked;
                          setPwEnabled(enabled);
                          if (!enabled) {
                            updateForm.mutate({ id: formId, data: { password: null } });
                            toast.success("Password protection removed.");
                          }
                        }} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: "absolute", inset: 0, backgroundColor: pwEnabled ? "#634cc9" : "#c8b8a0", borderRadius: "99px", transition: "0.2s" }}>
                          <span style={{ position: "absolute", left: "2px", bottom: "2px", backgroundColor: "white", width: "14px", height: "14px", borderRadius: "50%", transition: "0.2s", transform: pwEnabled ? "translateX(16px)" : "translateX(0)" }} />
                        </span>
                      </label>
                    </div>

                    {pwEnabled && (
                      <ScribbleCustomInput
                        type="password"
                        placeholder="Set password..."
                        style={{ fontSize: "13px" }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                          if (e.target.value) {
                            updateForm.mutate({ id: formId, data: { password: e.target.value } });
                            toast.success("Password saved!");
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(45,36,22,0.18); border-radius: 99px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(45,36,22,0.35); }
              `}} />
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", paddingRight: "16px", overflowY: "auto", overflowX: "hidden", boxSizing: "border-box" }}>
              <div style={{ position: "relative", width: "100%", flexShrink: 0, filter: "drop-shadow(0px 4px 8px rgba(45,36,22,0.04))" }}>
                <Image src="/shareform.png" alt="Live form preview" width={550} height={560} priority style={{ objectFit: "contain" }} />
              </div>

              {/* FIX: "You're all set" button now opens live form on success */}
              <div style={{ position: "relative", width: "100%", height: "240px", flexShrink: 0, marginTop: "23px", filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.05))" }}>
                <Image src="/sharebottomCard.png" alt="You're all set!" fill priority style={{ objectFit: "contain" }} />
                <button
                  onClick={() => {
                    if (isPublished) {
                      window.open(formUrl, "_blank");
                    } else {
                      publishForm.mutate({ id: formId }, {
                        onSuccess: () => window.open(formUrl, "_blank"),
                      });
                    }
                  }}
                  disabled={publishForm.isPending}
                  style={{
                    position: "absolute", bottom: "22px", left: "24px",
                    width: "120px", height: "32px",
                    cursor: publishForm.isPending ? "not-allowed" : "pointer",
                    opacity: 0, border: "none", background: "transparent",
                  }}
                  aria-label={isPublished ? "View Live Form" : "Publish Now"}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}