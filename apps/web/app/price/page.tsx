// // apps/web/app/pricing/page.tsx
// import Link from "next/link";
// import { Button } from "~/components/ui/button";
// import { Card, CardContent } from "~/components/ui/card";
// import { Badge } from "~/components/ui/badge";
// import { CheckCircle, X, ArrowLeft } from "lucide-react";

// const PLANS = [
//   {
//     name: "Free",    price: "$0",  period: "forever", highlight: false, cta: "Get Started",    href: "/signup",
//     features: [
//       { label: "3 forms",               included: true },
//       { label: "100 responses/month",   included: true },
//       { label: "10 fields per form",    included: true },
//       { label: "Basic analytics",       included: true },
//       { label: "Custom slug",           included: false },
//       { label: "Password protection",   included: false },
//       { label: "CSV export",            included: false },
//       { label: "File uploads",          included: false },
//       { label: "Webhooks",              included: false },
//       { label: "API access",            included: false },
//     ],
//   },
//   {
//     name: "Creator", price: "$9",  period: "/month",  highlight: true,  cta: "Start Free Trial", href: "/signup",
//     features: [
//       { label: "20 forms",              included: true },
//       { label: "1,000 responses/month", included: true },
//       { label: "50 fields per form",    included: true },
//       { label: "Full analytics",        included: true },
//       { label: "Custom slug",           included: true },
//       { label: "Password protection",   included: true },
//       { label: "CSV export",            included: true },
//       { label: "File uploads",          included: true },
//       { label: "Webhooks",              included: false },
//       { label: "API access",            included: false },
//     ],
//   },
//   {
//     name: "Studio",  price: "$29", period: "/month",  highlight: false, cta: "Start Free Trial", href: "/signup",
//     features: [
//       { label: "Unlimited forms",       included: true },
//       { label: "Unlimited responses",   included: true },
//       { label: "Unlimited fields",      included: true },
//       { label: "Full analytics",        included: true },
//       { label: "Custom slug",           included: true },
//       { label: "Password protection",   included: true },
//       { label: "CSV export",            included: true },
//       { label: "File uploads",          included: true },
//       { label: "Webhooks",              included: true },
//       { label: "API access",            included: true },
//     ],
//   },
// ];

// export default function PricingPage() {
//   return (
//     <div className="min-h-screen bg-muted/20">
//       {/* Nav */}
//       <header className="border-b bg-background">
//         <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
//           <Button variant="ghost" size="sm" asChild>
//             <Link href="/"><ArrowLeft className="h-4 w-4 mr-1" />Home</Link>
//           </Button>
//           <span className="font-bold">ScribbleForms Pricing</span>
//         </div>
//       </header>

//       <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
//         <div className="text-center space-y-3">
//           <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
//           <p className="text-muted-foreground">Start free. No credit card required. Upgrade anytime.</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {PLANS.map(plan => (
//             <Card key={plan.name} className={plan.highlight ? "border-primary ring-1 ring-primary shadow-lg relative" : ""}>
//               {plan.highlight && (
//                 <div className="absolute -top-3 left-1/2 -translate-x-1/2">
//                   <Badge className="text-xs px-3">Most Popular</Badge>
//                 </div>
//               )}
//               <CardContent className="p-6 space-y-5">
//                 <div>
//                   <h2 className="font-bold text-xl">{plan.name}</h2>
//                   <div className="flex items-baseline gap-1 mt-1">
//                     <span className="text-3xl font-bold">{plan.price}</span>
//                     <span className="text-sm text-muted-foreground">{plan.period}</span>
//                   </div>
//                 </div>
//                 <Button className="w-full" variant={plan.highlight ? "default" : "outline"} asChild>
//                   <Link href={plan.href}>{plan.cta}</Link>
//                 </Button>
//                 <ul className="space-y-2.5">
//                   {plan.features.map(f => (
//                     <li key={f.label} className={`flex items-center gap-2 text-sm ${!f.included ? "text-muted-foreground" : ""}`}>
//                       {f.included
//                         ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
//                         : <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
//                       {f.label}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* FAQ */}
//         <div className="max-w-2xl mx-auto space-y-4">
//           <h2 className="text-xl font-bold text-center">FAQ</h2>
//           {[
//             { q: "Can I cancel anytime?",            a: "Yes, cancel anytime from your billing settings. No questions asked." },
//             { q: "Is there a free trial?",            a: "Creator and Studio plans include a 14-day free trial." },
//             { q: "What payment methods do you accept?", a: "All major credit cards via Stripe." },
//             { q: "Can I change plans later?",         a: "Upgrade or downgrade anytime from Settings → Billing." },
//           ].map(({ q, a }) => (
//             <Card key={q}>
//               <CardContent className="p-4">
//                 <p className="font-medium text-sm">{q}</p>
//                 <p className="text-sm text-muted-foreground mt-1">{a}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         <div className="text-center">
//           <p className="text-sm text-muted-foreground">Have questions? <Link href="/signup" className="underline">Contact us</Link></p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "~/components/Sidebar"; 
import { Search, Compass, PlusCircle, Check, X, ArrowLeft, HelpCircle, QrCode } from "lucide-react";

const PLANS = [
  {
    name: "Free Tier",
    price: "$0",
    period: "forever",
    accentColor: "#dfcbf2",
    tapeColor: "#ffccd5",
    features: [
      { label: "3 active forms", included: true },
      { label: "100 responses / mo", included: true },
      { label: "10 fields per pad", included: true },
      { label: "Basic chart analytics", included: true },
      { label: "Custom URL slug", included: false },
      { label: "Password vaults", included: false },
      { label: "CSV data export", included: false },
      { label: "API web hooks", included: false },
    ],
  },
  {
    name: "Creator Pro",
    price: "$9",
    period: "per month",
    accentColor: "#ffd6db",
    tapeColor: "#c8e6c9",
    isPopular: true,
    features: [
      { label: "20 active forms", included: true },
      { label: "1,000 responses / mo", included: true },
      { label: "50 fields per pad", included: true },
      { label: "Full metrics suite", included: true },
      { label: "Custom URL slug", included: true },
      { label: "Password vaults", included: true },
      { label: "CSV data export", included: true },
      { label: "API web hooks", included: false },
    ],
  },
  {
    name: "Studio Desk",
    price: "$29",
    period: "per month",
    accentColor: "#e1f5fe",
    tapeColor: "#e1bee7",
    features: [
      { label: "Unlimited forms", included: true },
      { label: "Infinite responses", included: true },
      { label: "Uncapped field grids", included: true },
      { label: "Full metrics suite", included: true },
      { label: "Custom URL slug", included: true },
      { label: "Password vaults", included: true },
      { label: "CSV data export", included: true },
      { label: "API web hooks", included: true },
    ],
  },
];

export default function PricingPage() {
  const [scale, setScale] = useState(0.8);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── PLAYFUL LOADING SCROLL SIMULATION ───
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1250;
      const scaleY = window.innerHeight / 900;
      const computed = Math.min(scaleX, scaleY, 0.8);
      setScale(computed < 0.45 ? 0.45 : computed);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "#fdf6ed", width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", inset: 0, zIndex: 99999 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <div style={{ position:"relative", width: "64px", height: "64px" }}>
            <svg width="64" height="64" viewBox="0 0 70 70" fill="none" style={{ animation: "scaffoldScale 1.5s infinite ease-in-out" }}>
              <circle cx="35" cy="35" r="28" stroke="#9462f5" strokeWidth="1.5" strokeDasharray="5 5" />
              <path d="M22 35 L31 44 L48 24" stroke="#2d2416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "24px", color: "#2d2416" }}>Calculating paper margins...</p>
        </div>
        <style>{`@keyframes scaffoldScale { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 0.4; } }`}</style>
      </div>
    );
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
      {/* SCALE WRAPPER */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "125vw", 
          height: "125vh", 
          display: "flex",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* SIDEBAR NAVIGATION COLUMN */}
        <div style={{ width: "240px", height: "100%", paddingLeft: "65px", paddingTop: "24px", flexShrink: 0 }}>
          <Sidebar activeTab="Price" />
        </div>

        {/* WORKSPACE CENTRAL CANVAS */}
        <div style={{ flex: 1, height: "100%", padding: "45px 60px 45px 170px", display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
          
          {/* TOP HEADER MARGIN */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "65px",marginTop:"8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#1a150e", fontFamily: "'Caveat', cursive" }}>
                  Workspace Ledger & Plans
                </h2>
                <span style={{ fontSize: "20px" }}>💎</span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "rgba(45, 36, 22, 0.6)", fontWeight: 500 }}>
                Simple, transparent options sketched with no surprise charges. Upgrade whenever you need more space.
              </p>
            </div>
            
            {/* Hanging boy image deco element context layer */}
            {/* <div style={{ position: "relative", width: "120px", height: "120px", marginRight: "40px", pointerEvents: "none" }}>
              <Image src="/form/holdingBoy.png" alt="" fill style={{ objectFit: "contain" }} />
            </div> */}
          </div>

          {/* ─── DRAFTING BOARD CARDS DECK ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px", alignContent: "start", marginTop: "10px" }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  backgroundColor: "#fffdf9",
                  border: "1.5px solid #2d2416",
                  borderRadius: "16px",
                  padding: "30px 24px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  boxSizing: "border-box",
                  height:"580px"
                }}
              >
                {/* Visual Stick-On Placement Tape Decoration */}
                <div
                  style={{
                    position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-1deg)",
                    width: "85px", height: "18px", backgroundColor: plan.tapeColor, opacity: 0.7,
                    border: "1px dashed rgba(45,36,22,0.15)", borderRadius: "2px"
                  }}
                />

                {/* Popular Star Tag Banner */}
                {plan.isPopular && (
                  <div style={{ position: "absolute", top: "12px", right: "14px", background: "#7c4dff", color: "#fff", fontFamily: "'Caveat', cursive", fontSize: "12px", fontWeight: "bold", padding: "2px 8px", borderRadius: "6px", border: "1px solid #2d2416", transform: "rotate(3deg)" }}>
                    Popular Choice ★
                  </div>
                )}

                {/* Upper Module: Header Financial Labels */}
                <div>
                  <h3 style={{ fontFamily: "'Caveat', cursive", fontSize: "28px", fontWeight: 900, color: "#2d2416", margin: 0 }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "24px" }}>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: "#2d2416", fontFamily: "'Nunito', sans-serif" }}>{plan.price}</span>
                    <span style={{ fontSize: "13px", color: "rgba(45,36,22,0.5)", fontWeight: 700 }}>/ {plan.period}</span>
                  </div>
                </div>

                {/* Middle Module: Checkbox Features Field Grid Stack */}
                <div style={{ borderTop: "1px dashed rgba(45,36,22,0.12)", paddingTop: "34px", flex: 1 }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.features.map((feat) => (
                      <li key={feat.label} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: feat.included ? "#2d2416" : "rgba(45,36,22,0.4)" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "4px", backgroundColor: feat.included ? plan.accentColor : "rgba(0,0,0,0.03)", border: `1px solid ${feat.included ? "#2d2416" : "rgba(0,0,0,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {feat.included ? <Check size={11} strokeWidth={3} color="#2d2416" /> : <X size={10} color="rgba(0,0,0,0.2)" />}
                        </div>
                        <span style={{ fontFamily: "'Nunito', sans-serif" }}>{feat.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lower Module: Tactical Action Trigger Button */}
                <button
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    width: "100%", padding: "10px 0", cursor: "pointer", outline: "none",
                    fontFamily: "'Caveat', cursive", fontSize: "20px", fontWeight: "bold",
                    backgroundColor: plan.isPopular ? "#9462f5" : "#fff",
                    color: plan.isPopular ? "#fff" : "#2d2416",
                    border: "1.5px solid #2d2416", borderRadius: "8px",
                    boxShadow: "2px 2px 0px #2d2416", transition: "transform 0.1s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  Select Plan Template →
                </button>
              </div>
            ))}
          </div>

          {/* LOWER MODULE: HAND-DRAWN FAQ CORNER BOX */}
          <div style={{ marginTop: "32px", padding: "18px 24px", backgroundColor: "#fffdf9", border: "1.5px dashed #c8b8a0", borderRadius: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold", color: "#2d2416", display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={14} color="#7c4dff" /> Can I cancel anytime?</p>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(45,36,22,0.6)", fontWeight: 600, lineHeight: 1.4 }}>Yes, cancel instantly from billing settings inside your account workspace canvas dashboard dashboard window.</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "bold", color: "#2d2416", display: "flex", alignItems: "center", gap: "6px" }}><HelpCircle size={14} color="#7c4dff" /> What payment infrastructure is attached?</p>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(45,36,22,0.6)", fontWeight: 600, lineHeight: 1.4 }}>We handle transaction structures securely backed via Stripe verification APIs using all major international credit cards.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── DYNAMIC PAYMENT INTERCEPT GATEWAY MODAL OVERLAY ─── */}
      {selectedPlan && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(45, 36, 22, 0.25)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, padding: "20px" }}>
          <div style={{ position: "relative", width: "460px", padding: "40px 32px 32px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            
            {/* Sketch Border Wrapper framing card coordinates cleanly */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, overflow: "visible", filter: "drop-shadow(5px 6px 0px #2d2416)" }} viewBox="0 0 440 260" preserveAspectRatio="none" fill="none">
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" fill="#fffdf9" />
              <path d="M12 6 C150 4, 300 8, 426 5 C434 7, 436 15, 434 130 C435 210, 433 248, 424 252 C300 256, 120 253, 14 254 C6 252, 4 235, 5 130 C4 45, 6 8, 12 6 Z" stroke="#2d2416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Close trigger anchor */}
            <div onClick={() => setSelectedPlan(null)} style={{ position: "absolute", top: "14px", right: "20px", fontFamily: "'Caveat', cursive", fontSize: "24px", fontWeight: "bold", color: "#2d2416", cursor: "pointer", zIndex: 2, userSelect: "none" }}>✕</div>
            
            <div style={{ fontSize: "38px", zIndex: 1, position: "relative", lineHeight: 1 }}>💸</div>
            <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: "32px", fontWeight: "900", color: "#2d2416", margin: 0, zIndex: 1, position: "relative" }}>Chindi QR Code Gate!</h2>
            
            {/* Custom Interactive Prompts Content Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", zIndex: 1, position: "relative", padding: "0 4px" }}>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "13px", fontWeight: "800", color: "#e64a19", margin: 0, lineHeight: 1.4 }}>
                The developer has done a chindi work by adding the QRCODE here.
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: "700", color: "rgba(45,36,22,0.6)", margin: 0, lineHeight: 1.4 }}>
                Let me tell u this: making a payment on this will NOT provide any kind of features given in the card!
              </p>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "11px", fontStyle: "italic", fontWeight: "700", color: "#7c4dff", margin: "4px 0 0 0" }}>
                I am again repeating, save your cash buddy... 
              </p>
            </div>

            {/* ── EMPTY DATA IMAGE PLACEHOLDER FOR QR CODE ASSET ── */}
            <div 
              style={{ 
                width: "140px", 
                height: "140px", 
                backgroundColor: "#fff", 
                border: "1.5px dashed #2d2416", 
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                position: "relative",
                // backgroundColor: "rgba(45,36,22,0.02)",
                overflow: "hidden"
              }}
            >
              <img src="/Qrcode.png" alt="Payment QR asset" style={{ width: "100%", height: "100%" }} />
              {/* <QrCode size={40} strokeWidth={1} color="rgba(45,36,22,0.3)" /> */}
              {/* <span style={{ fontSize: "10px", color: "rgba(45,36,22,0.4)", fontWeight: "bold", fontFamily: "'Nunito', sans-serif", marginTop: "6px" }}>QR ASSET HOLDER</span> */}
            </div>

            <button 
              onClick={() => setSelectedPlan(null)} 
              style={{ backgroundColor: "#2d2416", color: "#fffdf9", fontFamily: "'Caveat', cursive", fontSize: "18px", fontWeight: "bold", border: "none", borderRadius: "6px", padding: "6px 28px", cursor: "pointer", outline: "none", zIndex: 1, position: "relative", boxShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}