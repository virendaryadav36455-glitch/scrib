"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Palette, 
  Settings, 
  GitBranch, 
  Layers, 
  Sparkles,
  NotebookIcon,
  DollarSign
} from "lucide-react";
import { AnalyticsIcon, FormsIcon, HomeIcon, ResponsesIcon } from "./icons";

interface SidebarProps {
  activeTab?: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname();

  const buildItems = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Form", href: "/dashboard/forms", icon: FormsIcon },
    // { name: "Design", href: "/design", icon: Palette },
    // { name: "explore", href: "/explore", icon: Sparkles },
    {name : "response" , href: "/dashboard/response" , icon : ResponsesIcon},
    {name : "analytics" , href: "/dashboard/analytics" , icon : AnalyticsIcon}
  ];

  const helpItems = [
    // { name: "Settings", href: "/settings", icon: Settings },
    { name: "Price", href: "/price", icon: DollarSign }
  ];

  const isItemActive = (item: { name: string; href: string }) => {
    if (activeTab) return activeTab.toLowerCase() === item.name.toLowerCase();
    return pathname === item.href;
  };

  return (
    <div 
      style={{ 
        width: "200px", 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        paddingTop: "24px", 
        paddingBottom: "4px", 
        userSelect: "none",
        fontFamily: "'Nunito', sans-serif",
        boxSizing: "border-box"
      }}
    >
      {/* ── LOGO SECTION ── */}
      <div style={{ marginBottom: "12px", paddingLeft: "4px", flexShrink: 0 }}>
        <h1 
          style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            color: "#1a150e", 
            position: "relative", 
            letterSpacing: "0.02em",
            fontFamily: "'Caveat', cursive",
            margin: 0
          }}
        >
          <Link href="/dashboard" style={{ textDecoration: "none", color: "#1a150e" }}>
            ScribbleForms
          </Link>
          <span 
            style={{ 
              position: "absolute", 
              bottom: "-4px", 
              left: 0, 
              width: "110px", 
              height: "2px", 
              backgroundColor: "rgba(99, 76, 201, 0.5)", 
              borderRadius: "9999px", 
              display: "block" 
            }}
          />
        </h1>
      </div>

      {/* ── MAIN VERTICAL LAYOUT SCROLL SYSTEM ── 
          This wrapper column prevents elements from jumping around when scaling
      */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "40px", width: "100%" }}>
        
        {/* ── BUILD SECTION ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <span 
            style={{ 
              fontSize: "11px", 
              fontWeight: "bold", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              color: "rgba(45, 36, 22, 0.4)", 
              paddingLeft: "8px", 
              marginBottom: "4px" 
            }}
          >
            Build
          </span>
          
          {buildItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  position: "relative",
                  textAlign: "left",
                  textDecoration: "none",
                  color: isActive ? "#2d2416" : "rgba(45, 36, 22, 0.7)",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box"
                }}
              >
                {isActive && (
                  <div 
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#fce09b",
                      opacity: 0.85,
                      borderRadius: "6px",
                      zIndex: -1,
                      clipPath: "polygon(1% 5%, 99% 2%, 96% 95%, 4% 98%)"
                    }}
                  />
                )}
                <Icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span style={{ textTransform: "capitalize" }}>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* ── HELP / EXTRA OPTIONS SECTION ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <span 
            style={{ 
              fontSize: "11px", 
              fontWeight: "bold", 
              textTransform: "uppercase", 
              letterSpacing: "0.05em", 
              color: "rgba(45, 36, 22, 0.4)", 
              paddingLeft: "8px", 
              marginBottom: "4px" 
            }}
          >
            Help
          </span>
          
          {helpItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  position: "relative",
                  textAlign: "left",
                  textDecoration: "none",
                  color: isActive ? "#2d2416" : "rgba(45, 36, 22, 0.7)",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box"
                }}
              >
                {isActive && (
                  <div 
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#fce09b",
                      opacity: 0.85,
                      borderRadius: "6px",
                      zIndex: -1,
                      clipPath: "polygon(2% 3%, 98% 6%, 95% 97%, 3% 94%)"
                    }}
                  />
                )}
                <Icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── STICKY PURPLE NOTE IMAGE ANCHORED AT ABSOLUTE BOTTOM ── */}
      <div 
        style={{ 
          position: "relative", 
          marginTop: "130px", 
          width: "172px", 
          height: "172px", 
          alignSelf: "center",
          marginRight: "auto",
          marginLeft: "auto",
          filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.05))",
          flexShrink: 0
        }}
      >
        <Image
          src="/formBuilderNote.png"
          alt="Need help? We're here for you!"
          fill
          priority
          style={{ objectFit: "contain" }}
        />
        
        <button 
          onClick={() => alert("haaa haa i tricked u. u are alone from starting")}
          style={{ 
            position: "absolute", 
            bottom: "22px", 
            left: "20px", 
            width: "95px", 
            height: "28px", 
            borderRadius: "6px", 
            cursor: "pointer", 
            opacity: 0,
            border: "none",
            background: "transparent"
          }}
          aria-label="Chat with us"
        />
      </div>

    </div>
  );
}