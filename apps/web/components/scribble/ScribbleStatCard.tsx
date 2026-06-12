function pseudorand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function generateRoughPath(w: number, h: number, seed: number, amp: number = 2.5): string {
  const points = [
    [2, 2], [w * 0.1, 1], [w * 0.2, 2], [w * 0.35, 1], [w * 0.5, 3], [w * 0.65, 1], [w * 0.8, 2], [w * 0.9, 1], [w - 2, 2],
    [w - 1, h * 0.15], [w - 2, h * 0.35], [w - 1, h * 0.55], [w - 2, h * 0.75], [w - 1, h * 0.9], [w - 2, h - 2],
    [w * 0.9, h - 1], [w * 0.75, h - 2], [w * 0.6, h - 1], [w * 0.45, h - 2], [w * 0.3, h - 1], [w * 0.15, h - 2], [2, h - 2],
    [1, h * 0.85], [2, h * 0.65], [1, h * 0.45], [2, h * 0.2]
  ];

  return points.reduce((acc, pt, i) => {
    const rndX = (pseudorand(seed + i * 7) - 0.5) * amp;
    const rndY = (pseudorand(seed + i * 13) - 0.5) * amp;
    const x = (pt[0]! + rndX).toFixed(1);
    const y = (pt[1]! + rndY).toFixed(1);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "") + " Z";
}



export function ScribbleStatCard({ label, value, percentage, subColor, rotation, attachment, children }: {
  label: string; value: string; percentage?: string; subColor?: string; rotation: string; attachment: "purple-pin" | "red-pin" | "blue-tape" | "orange-tape"; children?: React.ReactNode;
}) {
  return (
    <div style={{
      position: "relative", flex: 1, minWidth: 140, padding: "14px 18px 16px",
      background: subColor, borderRadius: 6, transform: `rotate(${rotation})`,
      boxShadow: "3px 4px 0 rgba(45,36,22,0.12)", transition: "transform 0.2s"
    }}>
      {/* Absolute Pins / Sticker Configuration */}
      <div style={{ position: "absolute", top: attachment.includes("pin") ? -10 : -7, left: "50%", transform: "translateX(-50%)", zIndex: 12 }}>
        {attachment === "purple-pin" && (
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><circle cx="7" cy="7" r="6" fill="#7c5cbf" stroke="#2d2416" strokeWidth="1.2"/><path d="M7 13 L7 20" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round"/></svg>
        )}
        {attachment === "red-pin" && (
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none"><circle cx="7" cy="7" r="6" fill="#e05c5c" stroke="#2d2416" strokeWidth="1.2"/><path d="M7 13 L7 20" stroke="#2d2416" strokeWidth="1.5" strokeLinecap="round"/></svg>
        )}
        {attachment === "blue-tape" && (
          <div style={{ width: 36, height: 14, background: "#c8e2fa", borderRadius: 2, opacity: 0.7, transform: "rotate(-3deg)" }} />
        )}
        {attachment === "orange-tape" && (
          <div style={{ width: 36, height: 14, background: "#fdd9a0", borderRadius: 2, opacity: 0.7, transform: "rotate(2deg)" }} />
        )}
      </div>

      {/* Structural SVG Border Overlay: Clean, Lighter, Thinner Line Layers */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 200 130" preserveAspectRatio="none">
        <path d={generateRoughPath(200, 130, 101, 2.5)} stroke="#2d2416" strokeWidth="0.7" fill="none" strokeOpacity="0.35"/>
        <path d={generateRoughPath(200, 130, 202 + 25, 1.8)} stroke="#2d2416" strokeWidth="0.5" fill="none" strokeOpacity="0.25"/>
        <path d={generateRoughPath(200, 130, 303 + 50, 1.2)} stroke="#2d2416" strokeWidth="0.4" fill="none" strokeOpacity="0.15"/>
        <path d={generateRoughPath(200, 130, 404 + 75, 0.8)} stroke="#2d2416" strokeWidth="0.4" fill="none" strokeOpacity="0.10"/>
      </svg>

      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "#5a4a30", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 32, fontWeight: 700, color: "#2d2416", lineHeight: 1 }}>{value}</div>
      
      {percentage && (
        <div style={{ 
          fontFamily: "'Caveat', cursive", fontSize: 15, fontWeight: 600, marginTop: 4,
          color: label === "Completed" ? "#2d8a3e" : label === "In Progress" ? "#c86b00" : "#e05c5c"
        }}>{percentage}</div>
      )}
      {children}
    </div>
  );
}