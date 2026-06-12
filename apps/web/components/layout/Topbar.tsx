"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BellIcon } from "~/components/icons";
import { useMe , useLogout } from "~/hooks/api";
import { useUIStore } from "~/store/ui.store";
import { ScribbleBadge } from "../scribble/ScribbleUI";

export function Topbar() {
  const { data: me } = useMe();
  const { autosaveStatus } = useUIStore();
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const t = setInterval(() => { setShake(true); setTimeout(() => setShake(false), 500); }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", padding: "0 24px",
      borderBottom: "1.5px solid rgba(30,22,8,0.12)",
      background: "rgba(252,244,229,0.6)", backdropFilter: "blur(4px)",
      position: "sticky", top: 0, zIndex: 50, gap: 12,
    }}>
      {/* Autosave */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink-3)" }}>
        {autosaveStatus === "saving" && <span>Saving...</span>}
        {autosaveStatus === "saved" && (
          <span style={{ color: "var(--ok)", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 4" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            All changes saved
          </span>
        )}
        {autosaveStatus === "error" && <span style={{ color: "var(--fail)" }}>Save failed</span>}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Bell */}
      <div style={{ position: "relative", cursor: "pointer", animation: shake ? "bellShake 0.5s ease" : "none" }}>
        <style>{`@keyframes bellShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-15deg)}75%{transform:rotate(15deg)}}`}</style>
        <BellIcon size={22} stroke="var(--ink-2)"/>
      </div>

      {/* User */}
      {me && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--lavender)", border: "1.5px solid var(--ink-2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink-1)",
          }}>
            {me.fullName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.1 }}>
              {me.fullName}
            </span>
            <ScribbleBadge type={me.plan} label={me.plan.charAt(0).toUpperCase() + me.plan.slice(1)}/>
          </div>
        </div>
      )}
    </header>
  );
}