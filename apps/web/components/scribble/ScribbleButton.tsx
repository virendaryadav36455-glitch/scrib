"use client";
import React from "react";

type ButtonVariant =
  | "purple"
  | "yellow"
  | "pink"
  | "green"
  | "cream"
  | "dark"
  | "ghost"
  | "secondary";

type ButtonSize = "sm" | "md" | "lg";

interface ScribbleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  variant?: ButtonVariant;
  size?: ButtonSize;

  onClick?: () => void;

  className?: string;
  style?: React.CSSProperties;

  icon?: React.ReactNode;
  iconPosition?: "left" | "right";

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  disabled?: boolean;
  loading?: boolean;

  type?: "button" | "submit" | "reset";

  fullWidth?: boolean;

  shadow?: boolean;
  doubleStroke?: boolean;

  wobble?: number;

  textRotate?: number;

  svgClassName?: string;
}

const variantColors: Record<
  ButtonVariant,
  { fill: string; stroke: string; text: string; shadow: string }
> = {
  purple: {
    fill: "#e0d4f7",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "rgba(145, 116, 189, 0.28)",
  },

  yellow: {
    fill: "#fbe98c",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "rgba(201, 176, 52, 0.25)",
  },

  pink: {
    fill: "#f9c8c8",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "rgba(214, 140, 140, 0.22)",
  },

  green: {
    fill: "#cff0d0",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "rgba(123, 180, 126, 0.24)",
  },

  cream: {
    fill: "#fefaf2",
    stroke: "#5a4a30",
    text: "#5a4a30",
    shadow: "rgba(90, 74, 48, 0.15)",
  },

  dark: {
    fill: "#2d2416",
    stroke: "#2d2416",
    text: "#fefaf2",
    shadow: "rgba(0,0,0,0.25)",
  },

  secondary: {
    fill: "#f3efe7",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "rgba(90, 74, 48, 0.12)",
  },

  ghost: {
    fill: "transparent",
    stroke: "#2d2416",
    text: "#2d2416",
    shadow: "transparent",
  },
};

const sizePad: Record<
  ButtonSize,
  {
    px: number;
    py: number;
    font: number;
    h: number;
  }
> = {
  sm: {
    px: 12,
    py: 5,
    font: 14,
    h: 32,
  },

  md: {
    px: 16,
    py: 7,
    font: 16,
    h: 38,
  },

  lg: {
    px: 22,
    py: 10,
    font: 18,
    h: 46,
  },
};

/** Generates a wobbly closed rect path for a given w×h */
function wobbleRect(
  w: number,
  h: number,
  seed = 1,
  wobble = 3.5
): string {
  const r = (i: number) => {
    const x =
      Math.sin(seed * 127 + i * 311) *
      43758.5;

    return (
      (x - Math.floor(x) - 0.5) *
      wobble
    );
  };

  const tl: [number, number] = [r(0), r(1)];
  const tr: [number, number] = [r(2), r(3)];
  const br: [number, number] = [r(4), r(5)];
  const bl: [number, number] = [r(6), r(7)];

  return [
    `M${4 + tl[0]} ${3 + tl[1]}`,

    `Q${w * 0.3 + r(8)} ${1 + r(9)}
     ${w * 0.6 + r(10)} ${2 + r(11)}`,

    `Q${w - 5 + tr[0]} ${1 + tr[1]}
     ${w - 3 + tr[0]} ${4 + tr[1]}`,

    `Q${w - 1 + r(12)}
     ${h * 0.4 + r(13)}
     ${w - 2 + r(14)}
     ${h * 0.7 + r(15)}`,

    `Q${w - 3 + br[0]}
     ${h - 4 + br[1]}
     ${w - 5 + br[0]}
     ${h - 2 + br[1]}`,

    `Q${w * 0.6 + r(16)}
     ${h - 1 + r(17)}
     ${w * 0.3 + r(18)}
     ${h - 2 + r(19)}`,

    `Q${5 + bl[0]}
     ${h - 1 + bl[1]}
     ${3 + bl[0]}
     ${h - 4 + bl[1]}`,

    `Q${1 + r(20)}
     ${h * 0.6 + r(21)}
     ${2 + r(22)}
     ${h * 0.3 + r(23)}`,

    `Z`,
  ].join(" ");
}

export function ScribbleButton({
  children,

  variant = "purple",
  size = "md",

  onClick,

  className = "",
  style = {},

  icon,
  iconPosition = "left",

  leftIcon,
  rightIcon,

  disabled = false,
  loading = false,

  type = "button",

  fullWidth = false,

  shadow = true,
  doubleStroke = true,

  wobble = 3.5,

  textRotate = -1,

  svgClassName = "",

  ...props
}: ScribbleButtonProps) {
  const {
    fill,
    stroke,
    text,
    shadow: shadowColor,
  } = variantColors[variant];

  const {
    px,
    py,
    font,
    h,
  } = sizePad[size];

  const minW =
    font *
      (typeof children === "string"
        ? children.length * 0.55
        : 4) +
    px * 2 +
    20;

  const w = Math.max(minW, 70);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      onClick={onClick}
      className={className}
      style={{
        position: "relative",

        display: "inline-flex",

        alignItems: "center",
        justifyContent: "center",

        gap: 6,

        fontFamily:
          "'Patrick Hand', 'Caveat', cursive",

        fontSize: font,
        fontWeight: 600,

        color: text,

        background: "transparent",
        border: "none",

        cursor:
          disabled || loading
            ? "not-allowed"
            : "pointer",

        padding: `${py}px ${px}px`,

        minWidth: w,
        height: h,

        width: fullWidth
          ? "100%"
          : undefined,

        opacity:
          disabled || loading
            ? 0.5
            : 1,

        transition:
          "transform 0.1s ease, filter 0.1s ease",

        filter: shadow
          ? `drop-shadow(2px 2px 0 ${shadowColor})`
          : undefined,

        userSelect: "none",

        WebkitTapHighlightColor:
          "transparent",

        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          (
            e.currentTarget as HTMLElement
          ).style.transform =
            "translateY(-1px) rotate(-0.3deg)";
        }
      }}
      onMouseLeave={(e) => {
        (
          e.currentTarget as HTMLElement
        ).style.transform = "";
      }}
      onMouseDown={(e) => {
        (
          e.currentTarget as HTMLElement
        ).style.transform =
          "scale(0.97)";
      }}
      onMouseUp={(e) => {
        (
          e.currentTarget as HTMLElement
        ).style.transform = "";
      }}
      {...props}
    >
      {/* SVG wobble background */}

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={svgClassName}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Main Fill */}

        <path
          d={wobbleRect(
            w,
            h,
            font + px,
            wobble
          )}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeLinejoin="miter"
        />

        {/* Extra Scribble Border */}

        {doubleStroke && (
          <path
            d={wobbleRect(
              w,
              h,
              font + px + 2,
              wobble + 0.8
            )}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            opacity={0.65}
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        )}
      </svg>

      {/* Content */}

      {loading ? (
        <span
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          Loading...
        </span>
      ) : (
        <>
          {(leftIcon ||
            (icon &&
              iconPosition === "left")) && (
            <span
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {leftIcon || icon}
            </span>
          )}

          <span
            style={{
              position: "relative",
              zIndex: 1,
              transform: `rotate(${textRotate}deg)`,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {children}
          </span>

          {(rightIcon ||
            (icon &&
              iconPosition === "right")) && (
            <span
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {rightIcon || icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}