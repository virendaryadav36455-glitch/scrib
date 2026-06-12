// "use client";
// import { useState } from "react";
// import { useThemeList } from "~/hooks/api";
// import { ScribbleCard } from "~/components/scribble/ScribbleCard";
// import { ScribbleButton } from "~/components/scribble/ScribbleButton";
// import { ScribbleBadge, SkeletonScribble } from "~/components/scribble/ScribbleUI";
// import { ScribbleDivider } from "~/components/scribble/ScribbleDecorations";
// import { PlusIcon, SearchIcon, CrownIcon, StarIcon } from "~/components/icons";
// import { ScribbleInput } from "~/components/scribble/ScribbleInput";

// /* ── Theme SVG Illustrations ── */
// const THEME_ILLUSTRATIONS: Record<string, React.ReactNode> = {
//   "anime-dreams": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffd6e7"/><stop offset="100%" stopColor="#ffb3c8"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#ag)"/>
//       <path d="M30 145L30 80" stroke="#8b5e3c" strokeWidth="4" strokeLinecap="round"/>
//       <circle cx="30" cy="72" r="18" fill="rgba(255,180,210,.7)"/>
//       <circle cx="18" cy="80" r="12" fill="rgba(255,160,195,.6)"/>
//       <circle cx="42" cy="76" r="14" fill="rgba(255,190,215,.65)"/>
//       <ellipse cx="60" cy="50" rx="4" ry="2" fill="rgba(255,180,210,.7)" transform="rotate(-20 60 50)"/>
//       <ellipse cx="80" cy="30" rx="3" ry="1.5" fill="rgba(255,180,210,.7)" transform="rotate(15 80 30)"/>
//       <rect x="75" y="55" width="8" height="80" rx="2" fill="#c0392b" stroke="#922b21" strokeWidth="1"/>
//       <rect x="137" y="55" width="8" height="80" rx="2" fill="#c0392b" stroke="#922b21" strokeWidth="1"/>
//       <path d="M68 58Q110 42 152 58" stroke="#c0392b" strokeWidth="8" strokeLinecap="round" fill="none"/>
//       <path d="M72 68Q110 57 148 68" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" fill="none"/>
//       <rect x="100" y="120" width="20" height="5" rx="1" fill="#e8d5b0"/>
//       <rect x="96" y="127" width="28" height="5" rx="1" fill="#e0c89a"/>
//       <circle cx="176" cy="28" r="14" fill="rgba(255,220,100,.5)" stroke="rgba(255,180,50,.4)" strokeWidth="1"/>
//     </svg>
//   ),
//   "cyberpunk": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="cpg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a2e"/><stop offset="100%" stopColor="#0a1628"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#cpg)"/>
//       <rect x="0" y="70" width="28" height="75" fill="#1e1040"/>
//       <rect x="24" y="45" width="32" height="100" fill="#180d38"/>
//       <rect x="68" y="35" width="35" height="110" fill="#200e48"/>
//       <rect x="117" y="40" width="28" height="105" fill="#1e0c44"/>
//       <rect x="155" y="38" width="30" height="107" fill="#1c0a40"/>
//       <rect x="8" y="55" width="5" height="4" fill="#00ffcc" opacity=".6"/>
//       <rect x="8" y="63" width="5" height="4" fill="#ff00ff" opacity=".5"/>
//       <rect x="75" y="42" width="5" height="4" fill="#00ffcc" opacity=".6"/>
//       <rect x="120" y="46" width="5" height="4" fill="#00ffcc" opacity=".5"/>
//       <path d="M0 110Q55 106 110 110Q165 114 220 110" stroke="#00ffcc" strokeWidth="1.5" opacity=".6"/>
//       <path d="M80 20Q100 15 120 20L118 26Q100 30 82 26Z" fill="#9900cc" opacity=".7"/>
//       <text x="143" y="30" fontSize="7" fill="#ff00ff" fontFamily="monospace" opacity=".9">NEON</text>
//     </svg>
//   ),
//   "nature-walk": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e6c9"/><stop offset="100%" stopColor="#a5d6a7"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#ng)"/>
//       <path d="M0 95L40 40 80 95Z" fill="rgba(130,180,130,.5)"/>
//       <path d="M30 95L80 30 130 95Z" fill="rgba(100,160,100,.6)"/>
//       <path d="M80 95L140 20 200 95Z" fill="rgba(80,140,80,.55)"/>
//       <path d="M40 40L48 55 32 55Z" fill="white" opacity=".7"/>
//       <path d="M80 30L90 52 70 52Z" fill="white" opacity=".8"/>
//       <path d="M140 20L152 46 128 46Z" fill="white" opacity=".75"/>
//       <path d="M0 100Q55 94 110 100Q165 106 220 100L220 145 0 145Z" fill="#6a994e"/>
//       <path d="M10 100L16 70 22 100Z" fill="#2d6a4f"/>
//       <path d="M8 88L16 60 24 88Z" fill="#40916c"/>
//       <path d="M175 100L181 68 187 100Z" fill="#2d6a4f"/>
//       <path d="M185 100L193 65 201 100Z" fill="#40916c"/>
//       <path d="M90 28Q95 24 100 28" stroke="#2d6a4f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
//       <path d="M108 22Q113 18 118 22" stroke="#2d6a4f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
//       <circle cx="185" cy="22" r="12" fill="rgba(255,220,80,.5)" stroke="rgba(255,180,30,.4)" strokeWidth="1"/>
//     </svg>
//   ),
//   "sticky-notes": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="stg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff9c4"/><stop offset="100%" stopColor="#fff3e0"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#stg)"/>
//       <rect x="20" y="25" width="70" height="70" rx="3" fill="#fbe98c" stroke="#d4c17a" strokeWidth="1" transform="rotate(-4 55 60)"/>
//       <path d="M25 43h60M25 54h60M25 65h50M25 76h40" stroke="rgba(90,74,48,.2)" strokeWidth="1" transform="rotate(-4 55 60)"/>
//       <rect x="42" y="20" width="28" height="10" rx="2" fill="rgba(249,200,200,.7)" transform="rotate(-4 56 25)"/>
//       <rect x="95" y="15" width="60" height="55" rx="3" fill="#f9c8c8" stroke="#e8a0a0" strokeWidth="1" transform="rotate(5 125 42)"/>
//       <path d="M102 30h46M102 40h46M102 50h36" stroke="rgba(200,80,80,.15)" strokeWidth="1" transform="rotate(5 125 42)"/>
//       <rect x="145" y="60" width="58" height="65" rx="3" fill="#cff0d0" stroke="#a0d8a0" strokeWidth="1" transform="rotate(-3 174 92)"/>
//       <path d="M152 76h44M152 87h44M152 98h34" stroke="rgba(45,138,62,.15)" strokeWidth="1" transform="rotate(-3 174 92)"/>
//       <rect x="20" y="95" width="48" height="42" rx="3" fill="#e0d4f7" stroke="#b8a8e0" strokeWidth="1" transform="rotate(3 44 116)"/>
//       <path d="M170 30l1.5 3.5H175l-3 2.3 1.1 3.7L170 37l-3.6 2.5 1.1-3.7L165 33.5h3.5z" stroke="#f5a623" strokeWidth="1.2" fill="rgba(251,233,140,.5)"/>
//     </svg>
//   ),
//   "midnight-writer": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d0d1a"/><stop offset="100%" stopColor="#1a1a2e"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#mg)"/>
//       <circle cx="20" cy="15" r="1" fill="white" opacity=".8"/>
//       <circle cx="50" cy="8" r="1.2" fill="white" opacity=".7"/>
//       <circle cx="90" cy="12" r="0.8" fill="white" opacity=".9"/>
//       <circle cx="170" cy="10" r="1.2" fill="white" opacity=".8"/>
//       <circle cx="16" cy="28" r="16" fill="#d4af37" opacity=".8"/>
//       <circle cx="24" cy="22" r="13" fill="#1a1a2e"/>
//       <path d="M0 100Q55 96 110 100Q165 104 220 100L220 145 0 145Z" fill="#2c1810"/>
//       <rect x="140" y="95" width="5" height="38" rx="2" fill="#b8860b"/>
//       <path d="M142 95Q150 75 160 70" stroke="#b8860b" strokeWidth="4" strokeLinecap="round" fill="none"/>
//       <path d="M152 65L168 62L172 76L156 79Z" fill="#daa520" stroke="#b8860b" strokeWidth="1"/>
//       <circle cx="162" cy="72" r="22" fill="rgba(255,220,100,.08)"/>
//       <path d="M60 105Q80 100 100 105L98 125Q80 128 62 125Z" fill="#1e3a5f" stroke="#2d5986" strokeWidth="1"/>
//       <rect x="100" y="106" width="38" height="17" rx="1" fill="#1a2f4a" opacity=".8"/>
//     </svg>
//   ),
//   "ocean-breeze": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#90caf9"/><stop offset="40%" stopColor="#bbdefb"/><stop offset="100%" stopColor="#1565c0"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#og)"/>
//       <ellipse cx="40" cy="20" rx="25" ry="12" fill="rgba(255,255,255,.7)"/>
//       <ellipse cx="160" cy="15" rx="20" ry="10" fill="rgba(255,255,255,.6)"/>
//       <path d="M0 80Q20 72 40 80Q60 88 80 80Q100 72 120 80Q140 88 160 80Q180 72 200 80Q210 84 220 80L220 145 0 145Z" fill="#1976d2" opacity=".5"/>
//       <path d="M0 95Q25 86 50 95Q75 104 100 95Q125 86 150 95Q175 104 200 95Q210 99 220 95L220 145 0 145Z" fill="#1565c0" opacity=".65"/>
//       <path d="M0 112Q30 104 60 112Q90 120 120 112Q150 104 180 112Q200 116 220 112L220 145 0 145Z" fill="#0d47a1" opacity=".8"/>
//       <path d="M10 88Q30 70 50 82Q40 78 20 90Z" fill="rgba(255,255,255,.4)"/>
//       <path d="M90 28Q95 24 100 28" stroke="#1565c0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
//       <path d="M108 20Q113 16 118 20" stroke="#1565c0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
//       <path d="M150 95Q160 90 170 95" stroke="rgba(255,255,200,.4)" strokeWidth="3" strokeLinecap="round"/>
//       <circle cx="30" cy="118" r="3" fill="rgba(255,255,255,.3)"/>
//       <circle cx="180" cy="120" r="3" fill="rgba(255,255,255,.3)"/>
//     </svg>
//   ),
//   "sketchbook": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f8f6f0"/><stop offset="100%" stopColor="#ede9de"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#skg)"/>
//       <line x1="20" y1="40" x2="200" y2="40" stroke="rgba(100,140,200,.2)" strokeWidth="1"/>
//       <line x1="20" y1="54" x2="200" y2="54" stroke="rgba(100,140,200,.2)" strokeWidth="1"/>
//       <line x1="20" y1="68" x2="200" y2="68" stroke="rgba(100,140,200,.2)" strokeWidth="1"/>
//       <line x1="20" y1="82" x2="200" y2="82" stroke="rgba(100,140,200,.2)" strokeWidth="1"/>
//       <path d="M22 28Q26 26 26 30Q26 34 22 34Q18 34 18 30Q18 26 22 26" stroke="#9a8060" strokeWidth="1.5" fill="none"/>
//       <path d="M22 44Q26 42 26 46Q26 50 22 50Q18 50 18 46Q18 42 22 42" stroke="#9a8060" strokeWidth="1.5" fill="none"/>
//       <rect x="50" y="35" width="70" height="80" rx="4" fill="white" stroke="#9a8060" strokeWidth="1.5"/>
//       <path d="M55 50h60M55 62h60M55 74h40M55 86h50M55 98h30" stroke="rgba(90,74,48,.2)" strokeWidth="1"/>
//       <rect x="55" y="47" width="8" height="8" rx="1.5" stroke="#9a8060" strokeWidth="1"/>
//       <path d="M56.5 51l2 2 3-3" stroke="#2d8a3e" strokeWidth="1.2" strokeLinecap="round"/>
//       <path d="M170 30l1.5 3.5H175l-3 2.3 1.1 3.7L170 37l-3.6 2.5 1.1-3.7L165 33.5h3.5z" stroke="#7c5cbf" strokeWidth="1" fill="rgba(224,212,247,.5)"/>
//     </svg>
//   ),
//   "custom": (
//     <svg viewBox="0 0 220 145" fill="none" style={{ width: "100%", height: "100%" }}>
//       <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f3e5f5"/><stop offset="100%" stopColor="#e8eaf6"/></linearGradient></defs>
//       <rect width="220" height="145" fill="url(#cg)"/>
//       <ellipse cx="100" cy="85" rx="52" ry="40" fill="rgba(255,255,255,.7)" stroke="#9a8060" strokeWidth="1.5"/>
//       <circle cx="68" cy="72" r="10" fill="#ef5350" opacity=".8"/>
//       <circle cx="90" cy="62" r="10" fill="#ff9800" opacity=".8"/>
//       <circle cx="114" cy="62" r="10" fill="#ffeb3b" opacity=".8"/>
//       <circle cx="134" cy="72" r="10" fill="#4caf50" opacity=".8"/>
//       <circle cx="138" cy="94" r="10" fill="#2196f3" opacity=".8"/>
//       <ellipse cx="88" cy="100" rx="12" ry="14" fill="rgba(255,255,255,.9)" stroke="#9a8060" strokeWidth="1"/>
//       <rect x="150" y="30" width="6" height="50" rx="2" fill="#8d6e63" transform="rotate(30 153 55)"/>
//       <path d="M143 22L155 28L152 35L140 29Z" fill="#7c5cbf" opacity=".8" transform="rotate(30 148 29)"/>
//       <path d="M40 50l1.5 3.5H45l-3 2.3 1.1 3.7L40 57l-3.6 2.5 1.1-3.7L35 53.5h3.5z" fill="#ffeb3b" stroke="#d48a00" strokeWidth=".8"/>
//       <path d="M175 50l1.2 2.8H179l-2.5 1.9.9 3.1L175 56l-3.1 1.8.9-3.1L171 52.8h2.8z" fill="#f06292" stroke="#c04070" strokeWidth=".8"/>
//     </svg>
//   ),
// };

// const SYSTEM_THEMES = [
//   { id: "1", slug: "anime-dreams", name: "Anime Dreams", desc: "Vibrant anime vibes for fans and dreamers.", colors: ["#f48fb1","#9c27b0","#ff9800","#212121"], badge: "POPULAR", badgeColor: "#e0d4f7", badgeText: "#7c5cbf", bgStart: "#ffd6e7", bgEnd: "#ffe4ec", action: "Apply Theme", actionVariant: "purple" as const },
//   { id: "2", slug: "sketchbook", name: "Sketchbook", desc: "Clean and hand-drawn. Simple and elegant.", colors: ["#9e9e9e","#607d8b","#90a4ae","#efebe9"], badge: "ACTIVE", badgeColor: "#cff0d0", badgeText: "#2d8a3e", bgStart: "#f8f6f0", bgEnd: "#ede9de", action: "Customize", actionVariant: "primary" as const },
//   { id: "3", slug: "cyberpunk", name: "Cyber Punk", desc: "Neon lights, dark mode and futuristic feel.", colors: ["#9c27b0","#00bcd4","#e91e63","#212121"], badge: null, bgStart: "#1a0a2e", bgEnd: "#0a1628", action: "Apply Theme", actionVariant: "purple" as const },
//   { id: "4", slug: "nature-walk", name: "Nature Walk", desc: "Earthy greens and calm vibes of nature.", colors: ["#558b2f","#8d6e63","#ffd54f","#90a4ae"], badge: null, bgStart: "#c8e6c9", bgEnd: "#a5d6a7", action: "Apply Theme", actionVariant: "green" as const },
//   { id: "5", slug: "sticky-notes", name: "Sticky Notes", desc: "Fun and playful sticky notes everywhere!", colors: ["#fbc02d","#f48fb1","#64b5f6","#81c784"], badge: null, bgStart: "#fff9c4", bgEnd: "#fff3e0", action: "Apply Theme", actionVariant: "primary" as const },
//   { id: "6", slug: "midnight-writer", name: "Midnight Writer", desc: "Dark, focused, and easy on the eyes.", colors: ["#37474f","#455a64","#607d8b","#78909c"], badge: null, bgStart: "#0d0d1a", bgEnd: "#1a1a2e", action: "Apply Theme", actionVariant: "purple" as const },
//   { id: "7", slug: "ocean-breeze", name: "Ocean Breeze", desc: "Cool blues and peaceful vibes.", colors: ["#1565c0","#1976d2","#90caf9","#e3f2fd"], badge: null, bgStart: "#bbdefb", bgEnd: "#e3f2fd", action: "Apply Theme", actionVariant: "secondary" as const },
//   { id: "8", slug: "custom", name: "Create Your Own", desc: "Mix colors, fonts and vibes to build something totally yours.", colors: null, badge: null, bgStart: "#f3e5f5", bgEnd: "#e8eaf6", action: "Start Designing", actionVariant: "purple" as const, isCustom: true },
// ];

// const FILTER_TABS = ["All Themes","My Themes","Minimal","Anime","Nature","Fun","Professional"];

// function ThemeCard({ theme, index }: { theme: typeof SYSTEM_THEMES[0]; index: number }) {
//   const isDark = theme.bgStart.startsWith("#0") || theme.bgStart.startsWith("#1");
//   const nameColor = isDark ? "white" : "var(--ink-1)";
//   const descColor = isDark ? "rgba(255,255,255,0.7)" : "var(--ink-2)";

//   return (
//     <div style={{
//       borderRadius: 14, overflow: "hidden", position: "relative", cursor: "pointer",
//       boxShadow: "3px 4px 0 rgba(30,22,8,0.09), 5px 7px 0 rgba(30,22,8,0.05)",
//       transition: "transform 0.15s", border: theme.isCustom ? "2px dashed rgba(124,92,191,0.4)" : undefined,
//     }}
//       onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
//       onMouseLeave={e => (e.currentTarget.style.transform = "none")}
//     >
//       {/* Tape */}
//       <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%) rotate(-2deg)", zIndex: 10, pointerEvents: "none" }}>
//         <svg width="44" height="13" viewBox="0 0 44 13">
//           <path d="M2 3 L4 1 L40 1.2 L42 3 L42 10 L40 12 L4 11.8 L2 10 Z"
//             fill={["#f9c8c8","#fdd9a0","#c8e2fa","#cff0d0","#e0d4f7"][index % 5]} fillOpacity="0.82"/>
//         </svg>
//       </div>

//       {/* Badge */}
//       {theme.badge && (
//         <div style={{ position: "absolute", top: 10, right: 10, zIndex: 6, background: (theme as any).badgeColor, color: (theme as any).badgeText, fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 12 }}>
//           {theme.badge}
//         </div>
//       )}

//       {/* SVG Illustration */}
//       <div style={{ height: 148, background: `linear-gradient(180deg, ${theme.bgStart}, ${theme.bgEnd})`, position: "relative", overflow: "hidden" }}>
//         {THEME_ILLUSTRATIONS[theme.slug] ?? (
//           <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <span style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "rgba(30,22,8,0.2)" }}>✦</span>
//           </div>
//         )}
//       </div>

//       {/* Card body */}
//       <div style={{ padding: "12px 14px 14px", background: `${theme.bgEnd}ec` }}>
//         <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: nameColor, margin: "0 0 3px" }}>{theme.name}</h3>
//         <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: descColor, margin: "0 0 10px", lineHeight: 1.3 }}>{theme.desc}</p>

//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           {/* Color dots */}
//           <div style={{ display: "flex", gap: 5 }}>
//             {theme.colors ? theme.colors.map(c => (
//               <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "1.5px solid rgba(30,22,8,0.2)" }}/>
//             )) : (
//               <div style={{ display: "flex", gap: 4 }}>
//                 {["#ef5350","#ffeb3b","#4caf50","#2196f3"].map(c => (
//                   <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: "1px solid rgba(30,22,8,0.15)" }}/>
//                 ))}
//               </div>
//             )}
//           </div>

//           <ScribbleButton color={theme.actionVariant} size="sm">
//             {theme.action}
//           </ScribbleButton>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function ThemesPage() {
//   const [activeFilter, setActiveFilter] = useState("All Themes");
//   const [search, setSearch] = useState("");
//   const { data: themes, isLoading } = useThemeList();

//   const displayThemes = SYSTEM_THEMES.filter(t =>
//     !search || t.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div style={{ padding: "20px 28px 32px" }}>
//       {/* Header */}
//       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--ink-1)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
//             Themes
//             <svg width="24" height="18" viewBox="0 0 28 20" fill="none">
//               <path d="M2 14Q5 10 8 12Q11 14 13 9Q15 4 18 7Q21 10 24 6" stroke="#7c5cbf" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
//             </svg>
//           </h1>
//           <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
//             Make your forms <span style={{ textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "var(--purple)" }}>beautiful</span>. Choose a theme or create your own.
//             <span style={{ marginLeft: 6 }}>
//               <StarIcon size={14} fill="#f5a623" stroke="#d48a00"/>
//             </span>
//           </p>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--purple)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
//             <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--purple)" }}/>
//             New theme just dropped!
//           </div>
//           <ScribbleButton variant="purple" leftIcon={<PlusIcon size={16}/>}>
//             Create Theme
//           </ScribbleButton>
//         </div>
//       </div>

//       <ScribbleDivider className="mb-5"/>

//       {/* Filter row */}
//       <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
//         {FILTER_TABS.map(tab => (
//           <button key={tab} onClick={() => setActiveFilter(tab)}
//             style={{
//               fontFamily: "var(--font-display)", fontSize: 14, padding: "6px 14px",
//               borderRadius: 20, border: "1.5px solid",
//               borderColor: activeFilter === tab ? "rgba(124,92,191,0.7)" : "rgba(30,22,8,0.18)",
//               background: activeFilter === tab ? "var(--lavender)" : "transparent",
//               color: "var(--ink-1)", cursor: "pointer", fontWeight: activeFilter === tab ? 700 : 500,
//               transition: "all 0.12s",
//             }}
//           >
//             {tab}
//           </button>
//         ))}

//         <div style={{ marginLeft: "auto", width: 180 }}>
//           <ScribbleInput placeholder="Search themes..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<SearchIcon size={15}/>}/>
//         </div>
//       </div>

//       <ScribbleDivider style={{ marginBottom: 20, opacity: 0.5 }}/>

//       {/* Theme grid */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
//         {displayThemes.map((theme, i) => (
//           <ThemeCard key={theme.id} theme={theme} index={i}/>
//         ))}
//       </div>

//       {/* Upgrade banner */}
//       <div style={{ position: "relative", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 18,
//         background: "rgba(184,160,232,0.25)", border: "1.5px dashed rgba(124,92,191,0.4)" }}>
//         <div style={{ position: "absolute", top: -9, left: 22, width: 46, height: 13, background: "var(--blue)", borderRadius: 2, opacity: 0.85, transform: "rotate(-2deg)" }}/>

//         <svg width="36" height="30" viewBox="0 0 40 34" fill="none">
//           <path d="M3 26L7 10 14 18 20 4 26 18 33 10 37 26Z" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(251,233,140,.6)"/>
//           <path d="M3 26h34" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round"/>
//         </svg>

//         <div style={{ flex: 1 }}>
//           <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-1)", margin: "0 0 2px" }}>
//             Unlock premium themes and create unlimited custom themes with <strong>ScribbleForms Pro!</strong>
//           </p>
//         </div>

//         <ScribbleButton variant="purple">Upgrade to Pro →</ScribbleButton>
//       </div>
//     </div>
//   );
// }

export default function ThemesPage() {
  return <div style={{ padding: "2rem" }}><h1>Themes</h1><p>Coming soon.</p></div>;
}