// "use client";
// import { useState } from "react";
// import { useMe, useUpdateProfile } from "~/hooks/api";
// import { ScribbleCard } from "~/components/scribble/ScribbleCard";
// import { ScribbleButton } from "~/components/scribble/ScribbleButton";
// import { ScribbleInput } from "~/components/scribble/ScribbleInput";
// import { ScribbleToggle, ScribbleBadge } from "~/components/scribble/ScribbleUI";
// import { ScribbleDivider } from "~/components/scribble/ScribbleDecorations";
// import { SettingsGearIcon, KeyIcon, CrownIcon, WarningIcon, BulbIcon } from "~/components/icons";
// import Link from "next/link";
// import { ArrowLeftIcon } from "~/components/icons";

// const TABS = [
//   { id: "profile", label: "Profile", icon: "👤" },
//   { id: "account", label: "Account", icon: "🔒" },
//   { id: "notifications", label: "Notifications", icon: "🔔" },
//   { id: "apikeys", label: "API Keys", icon: "🔑" },
//   { id: "billing", label: "Billing", icon: "💳" },
//   { id: "danger", label: "Danger Zone", icon: "⚠️" },
// ];

// function ProfileTab() {
//   const { data: me } = useMe();
//   const updateProfile = useUpdateProfile();
//   const [fullName, setFullName] = useState(me?.fullName ?? "");
//   const [darkMode, setDarkMode] = useState(false);
//   const [animations, setAnimations] = useState(true);
//   const [emailNotifs, setEmailNotifs] = useState(true);
//   const [weeklyReports, setWeeklyReports] = useState(true);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//       {/* Profile Info */}
//       <div>
//         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
//           <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--lavender)", border: "2px solid var(--ink-1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
//             <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>
//               {(me?.fullName ?? "?").charAt(0).toUpperCase()}
//             </span>
//             <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: "var(--yellow)", border: "1.5px solid var(--ink-1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 9L4 7l5 2-2-5 2-2-6 1-1 6z" stroke="var(--ink-1)" strokeWidth="1.2" strokeLinecap="round"/></svg>
//             </div>
//           </div>
//           <div>
//             <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--ink-1)", margin: 0 }}>{me?.fullName}</p>
//             <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", margin: 0 }}>{me?.email}</p>
//             <ScribbleBadge type={me?.plan ?? "free"} label={(me?.plan ?? "free").charAt(0).toUpperCase() + (me?.plan ?? "free").slice(1)} className="mt-1"/>
//           </div>
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
//           <ScribbleInput label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"/>
//           <ScribbleInput label="Email" value={me?.email ?? ""} disabled placeholder="your@email.com"/>
//         </div>
//       </div>

//       <ScribbleDivider/>

//       {/* Workspace Preferences */}
//       <div>
//         <div style={{ display: "inline-block", background: "var(--purple)", borderRadius: 8, padding: "4px 12px", marginBottom: 14 }}>
//           <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-1)" }}>Workspace Preferences</span>
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//           <ScribbleInput label="Workspace Name" defaultValue="My Workspace" placeholder="My Workspace"/>
//           <div>
//             <label style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-2)", display: "block", marginBottom: 4 }}>Timezone</label>
//             <select style={{ width: "100%", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 15, border: "1.5px solid rgba(30,22,8,0.22)", borderRadius: 8, background: "#fdf8ef", color: "var(--ink-1)" }}>
//               <option>UTC+5:30 India Standard Time</option>
//               <option>UTC+0 GMT</option>
//               <option>UTC-5 Eastern Time</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <ScribbleDivider/>

//       {/* Preferences */}
//       <div>
//         <div style={{ display: "inline-block", background: "var(--yellow)", borderRadius: 8, padding: "4px 12px", marginBottom: 14 }}>
//           <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-1)" }}>Preferences</span>
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
//           {[
//             { label: "Dark Mode", sub: "Switch between light and dark themes.", val: darkMode, set: setDarkMode, icon: "🌙" },
//             { label: "Email Notifications", sub: "Receive important updates via email.", val: emailNotifs, set: setEmailNotifs, icon: "📧" },
//             { label: "Animations", sub: "Enable smooth animations across the app.", val: animations, set: setAnimations, icon: "✨" },
//             { label: "Weekly Reports", sub: "Get a summary of your form analytics.", val: weeklyReports, set: setWeeklyReports, icon: "📊" },
//           ].map(item => (
//             <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <span style={{ fontSize: 16 }}>{item.icon}</span>
//                 <div>
//                   <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-1)", margin: 0 }}>{item.label}</p>
//                   <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", margin: 0 }}>{item.sub}</p>
//                 </div>
//               </div>
//               <ScribbleToggle checked={item.val} onChange={item.set}/>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
//         <ScribbleButton color="primary" loading={updateProfile.isPending}
//           onClick={() => updateProfile.mutate({ fullName })}
//           rightIcon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8l4.5 4.5L14 4" stroke="var(--ink-1)" strokeWidth="1.8" strokeLinecap="round"/></svg>}>
//           Save Changes
//         </ScribbleButton>
//       </div>
//     </div>
//   );
// }

// function ApiKeysTab() {
//   const [keys] = useState([
//     { id: "1", name: "Production Key", prefix: "sf_live_ab12", lastUsed: "May 16, 2024", createdAt: "Jan 1, 2024" },
//     { id: "2", name: "Dev Key", prefix: "sf_test_cd34", lastUsed: "May 10, 2024", createdAt: "Mar 15, 2024" },
//   ]);
//   const [showCreate, setShowCreate] = useState(false);
//   const [newKeyName, setNewKeyName] = useState("");

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div>
//           <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink-1)", margin: "0 0 4px" }}>API Keys</h3>
//           <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)", margin: 0 }}>Manage your API keys for programmatic access.</p>
//         </div>
//         <ScribbleButton color="purple" size="sm" leftIcon={<KeyIcon size={14}/>} onClick={() => setShowCreate(true)}>
//           Create New Key
//         </ScribbleButton>
//       </div>

//       {showCreate && (
//         <ScribbleCard color="cream" shadow="sm" padding={24}>
//           <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>New API Key</p>
//           <div style={{ display: "flex", gap: 10 }}>
//             <ScribbleInput placeholder="Key name (e.g. Production)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}/>
//             <ScribbleButton color="primary" size="sm">Create</ScribbleButton>
//             <ScribbleButton color="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</ScribbleButton>
//           </div>
//         </ScribbleCard>
//       )}

//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {keys.map(key => (
//           <ScribbleCard key={key.id} color="white" shadow="sm" padding="p-4">
//             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//               <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <KeyIcon size={18} stroke="var(--ink-2)"/>
//               </div>
//               <div style={{ flex: 1 }}>
//                 <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-1)", margin: 0 }}>{key.name}</p>
//                 <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", margin: 0 }}>
//                   {key.prefix}... · Last used {key.lastUsed}
//                 </p>
//               </div>
//               <ScribbleButton color="danger" size="sm">Revoke</ScribbleButton>
//             </div>
//           </ScribbleCard>
//         ))}
//       </div>
//     </div>
//   );
// }

// function BillingTab() {
//   const { data: me } = useMe();
//   const planColors = { free: "yellow", creator: "pink", studio: "lavender" } as const;
//   const planColor = planColors[me?.plan ?? "free"];

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <ScribbleCard color={planColor} tape="yellow" shadow="md" padding="p-5">
//         <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
//           <CrownIcon size={22} stroke="var(--ink-2)"/>
//           <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--ink-1)", margin: 0 }}>
//             {(me?.plan ?? "free").charAt(0).toUpperCase() + (me?.plan ?? "free").slice(1)} Plan
//           </h3>
//           <ScribbleBadge type={me?.plan ?? "free"}/>
//         </div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
//           {[
//             { label: "Forms Used", val: "3 / 5", pct: 60 },
//             { label: "Responses This Month", val: "87 / 100", pct: 87 },
//           ].map(item => (
//             <div key={item.label}>
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                 <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-2)" }}>{item.label}</span>
//                 <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700 }}>{item.val}</span>
//               </div>
//               <div style={{ height: 8, background: "rgba(30,22,8,0.1)", borderRadius: 6 }}>
//                 <div style={{ height: "100%", width: `${item.pct}%`, background: item.pct > 80 ? "var(--fail)" : "var(--ok)", borderRadius: 6 }}/>
//               </div>
//             </div>
//           ))}
//         </div>
//         {me?.plan === "free" && (
//           <Link href="/pricing">
//             <ScribbleButton variant="purple">Upgrade to Creator →</ScribbleButton>
//           </Link>
//         )}
//       </ScribbleCard>
//     </div>
//   );
// }

// function DangerTab() {
//   return (
//     <div>
//       <ScribbleCard color="pink" shadow="sm" padding="p-5">
//         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
//           <WarningIcon size={20} stroke="var(--fail)"/>
//           <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--fail)", margin: 0 }}>Danger Zone</h3>
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(192,57,43,0.15)" }}>
//             <div>
//               <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-1)", margin: 0 }}>Export All Data</p>
//               <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", margin: 0 }}>Download all your forms, responses and analytics.</p>
//             </div>
//             <ScribbleButton variant="secondary" size="sm">Export ZIP</ScribbleButton>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
//             <div>
//               <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--fail)", margin: 0 }}>Delete Account</p>
//               <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink-3)", margin: 0 }}>Permanently delete your account and all data. This cannot be undone.</p>
//             </div>
//             <ScribbleButton variant="danger" size="sm">Delete Account</ScribbleButton>
//           </div>
//         </div>
//       </ScribbleCard>
//     </div>
//   );
// }

// export default function SettingsPage() {
//   const [activeTab, setActiveTab] = useState("profile");

//   const tabContent: Record<string, React.ReactNode> = {
//     profile: <ProfileTab/>,
//     apikeys: <ApiKeysTab/>,
//     billing: <BillingTab/>,
//     danger: <DangerTab/>,
//     account: (
//       <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-3)", padding: "20px 0" }}>
//         Account security settings coming soon.
//       </div>
//     ),
//     notifications: (
//       <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-3)", padding: "20px 0" }}>
//         Notification preferences coming soon.
//       </div>
//     ),
//   };

//   return (
//     <div style={{ padding: "20px 28px 32px" }}>
//       {/* Header */}
//       <div style={{ marginBottom: 8 }}>
//         <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--ink-1)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
//           Settings
//           <svg width="22" height="16" viewBox="0 0 24 18" fill="none">
//             <path d="M2 14Q6 10 10 12Q14 14 18 8" stroke="#b8a0e8" strokeWidth="2" strokeLinecap="round"/>
//           </svg>
//         </h1>
//         <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
//           Customize your workspace and preferences.
//         </p>
//       </div>

//       <ScribbleDivider className="mb-5"/>

//       <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
//         {/* Left nav */}
//         <ScribbleCard color="white" shadow="sm" padding="p-3">
//           <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             {TABS.map(tab => (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   display: "flex", alignItems: "center", gap: 9, padding: "8px 10px",
//                   borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left",
//                   background: activeTab === tab.id ? "var(--lavender)" : "transparent",
//                   fontFamily: "var(--font-display)", fontSize: 15,
//                   color: tab.id === "danger" ? "var(--fail)" : activeTab === tab.id ? "var(--ink-1)" : "var(--ink-2)",
//                   fontWeight: activeTab === tab.id ? 700 : 500,
//                   position: "relative",
//                 }}
//               >
//                 {activeTab === tab.id && (
//                   <div style={{ position: "absolute", left: -3, top: "50%", transform: "translateY(-50%)", width: 3.5, height: 16, background: "var(--purple)", borderRadius: 2 }}/>
//                 )}
//                 <span style={{ fontSize: 14 }}>{tab.icon}</span>
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </ScribbleCard>

//         {/* Right content */}
//         <ScribbleCard color="white" shadow="md" padding="p-6">
//           {tabContent[activeTab] ?? null}
//         </ScribbleCard>
//       </div>

//       {/* Footer */}
//       <div style={{ textAlign: "center", padding: "16px 0 0", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)" }}>
//         <svg width="14" height="14" viewBox="0 0 20 20" fill="#e05c5c" stroke="#c04040" strokeWidth="1" style={{ verticalAlign: "middle", marginRight: 4 }}>
//           <path d="M10 17C10 17 2 12 2 7C2 4.8 3.8 3 6 3C7.7 3 9.1 4 10 5.3C10.9 4 12.3 3 14 3C16.2 3 18 4.8 18 7C18 12 10 17 10 17Z"/>
//         </svg>
//         Your data is safe with us. We never share your information.
//       </div>
//     </div>
//   );
// }

export default function SettingsPage() {
  return <div style={{ padding: "2rem" }}><h1>Settings</h1><p>Coming soon.</p></div>;
}