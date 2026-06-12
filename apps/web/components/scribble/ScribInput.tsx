"use client";
import React, { ReactNode, CSSProperties } from "react";
import { ScribbleContainer } from "./ScribbleEngine";

/* ── SCRIBBLE INPUT ── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: CSSProperties;
}

export function ScribbleCustomInput({
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <ScribbleContainer
      fill="#fffdf7"
      amp={1.8}
      passes={2}
      sw={0.9}
      style={{ width: "100%", ...containerStyle }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          minHeight: 38,
        }}
      >
        {leftIcon && (
          <div
            style={{
              marginRight: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: 14,
            color: "var(--ink-1)",
            ...style,
          }}
        />

        {rightIcon && (
          <div
            style={{
              marginLeft: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
    </ScribbleContainer>
  );
}

/* ── SCRIBBLE BUTTON ── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  bg?: string;
  leftIcon?: ReactNode;
}
export function ScribbleCustomButton({ children, bg = "#e0d4f7", leftIcon, style, ...props }: ButtonProps) {
  return (
    <button {...props} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", outline: "none", ...style }}>
      <ScribbleContainer fill={bg} amp={1.5} passes={3} sw={1.1} style={{ padding: "8px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
          {leftIcon && leftIcon}
          {children}
        </div>
      </ScribbleContainer>
    </button>
  );
}