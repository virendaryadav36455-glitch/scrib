"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon, FormPageIcon, ResponsesIcon, AnalyticsIcon,
  ThemeIcon, SettingsGearIcon, StarIcon, CrownIcon,
  BulbIcon, PlantIcon, PuzzleIcon,
} from "../icons";
import { useLogout } from "~/hooks/api";
import { LogoutIcon } from "../icons";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon },
  { href: "/dashboard/forms", label: "Forms", icon: FormPageIcon },
  { href: "/dashboard/responses", label: "Responses", icon: ResponsesIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/dashboard/themes", label: "Themes", icon: ThemeIcon },
  { href: "/dashboard/integrations", label: "Integrations", icon: PuzzleIcon },
];

const BOTTOM = [
  { href: "/dashboard/settings", label: "Settings", icon: SettingsGearIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const logoutMut = useLogout();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 200, minWidth: 200, background: "rgba(252,244,229,0.92)",
        borderRight: "1.5px solid rgba(30,22,8,0.15)",
        display: "flex", flexDirection: "column", padding: "18px 12px 16px",
        height: "100vh", position: "sticky", top: 0, overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: "none", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M11 2l2.5 5.5H19l-4.8 3.6 1.8 5.9L11 14l-5 2.9 1.8-5.9L3 7.5h5.5z"
              fill="#b8a0e8" stroke="#7a50b8" strokeWidth="0.8"/>
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--ink-1)" }}>
            ScribbleForms
          </span>
        </div>
        <svg viewBox="0 0 160 7" height="6" style={{ width: 160, display: "block", marginLeft: 26, marginTop: 1 }}>
          <path d="M2 3.5 Q40 1 80 3.5 Q120 6 158 3" stroke="#b8a0e8" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </Link>

      {/* Divider */}
      <svg viewBox="0 0 176 6" height="6" style={{ width: "100%", margin: "10px 0 8px" }}>
        <path d="M0 3 Q44 1 88 3 Q132 5 176 3" stroke="rgba(30,22,8,0.18)" strokeWidth="1.2" fill="none"/>
      </svg>

      {/* Section label */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)",
        textTransform: "uppercase", margin: "0 0 5px 4px", fontFamily: "var(--font-body)" }}>
        Build
      </p>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 9, padding: "7px 10px",
                borderRadius: 8, position: "relative", cursor: "pointer",
                background: active ? "var(--yellow)" : "transparent",
                transition: "background 0.12s",
              }}>
                {active && (
                  <div style={{
                    position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
                    width: 4, height: 18, background: "var(--ink-1)", borderRadius: 2,
                  }}/>
                )}
                <Icon size={17} stroke={active ? "var(--ink-1)" : "var(--ink-3)"}/>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: 16,
                  color: active ? "var(--ink-1)" : "var(--ink-2)",
                  fontWeight: active ? 700 : 500,
                }}>
                  {label}
                </span>
                {active && (
                  <StarIcon size={12} stroke="var(--ink-2)" style={{ marginLeft: "auto" }}/>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <svg viewBox="0 0 176 6" height="5" style={{ width: "100%", margin: "8px 0" }}>
        <path d="M0 3 Q44 1.5 88 3 Q132 4.5 176 3" stroke="rgba(30,22,8,0.12)" strokeWidth="1" fill="none"/>
      </svg>

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)",
        textTransform: "uppercase", margin: "0 0 4px 4px", fontFamily: "var(--font-body)" }}>
        Settings
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 9, padding: "7px 10px",
                borderRadius: 8, background: active ? "var(--yellow)" : "transparent",
              }}>
                <Icon size={17} stroke={active ? "var(--ink-1)" : "var(--ink-3)"}/>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16,
                  color: active ? "var(--ink-1)" : "var(--ink-2)", fontWeight: active ? 700 : 500 }}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}

        <button onClick={() => logoutMut.mutate()} style={{
          display: "flex", alignItems: "center", gap: 9, padding: "7px 10px",
          borderRadius: 8, background: "transparent", border: "none", cursor: "pointer",
          width: "100%", textAlign: "left",
        }}>
          <LogoutIcon size={17} stroke="var(--ink-3)"/>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-2)" }}>
            Logout
          </span>
        </button>
      </nav>

      {/* Upgrade card */}
      <div style={{ marginTop: "auto" }}>
        <div style={{
          background: "var(--lavender)", borderRadius: 12, padding: "11px 12px",
          position: "relative", transform: "rotate(-0.5deg)",
          boxShadow: "2px 3px 0 rgba(30,22,8,0.09)", marginBottom: 10,
        }}>
          <div style={{
            position: "absolute", top: -7, left: 10, width: 32, height: 11,
            background: "#c8e2fa", borderRadius: 2, transform: "rotate(-2deg)", opacity: 0.85,
          }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <CrownIcon size={14} stroke="#7a50b8"/>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "#6c3483" }}>
              Upgrade to Pro
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.4, margin: 0 }}>
            Unlock webhooks, API keys & more!
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <PlantIcon size={28} stroke="var(--ink-3)"/>
        </div>
      </div>
    </aside>
  );
}