'use client';
import { useEffect, useState } from 'react';

interface MascotProps {
  size?: number;
  speech?: string;
  className?: string;
}

export function Mascot({ size = 70, speech, className }: MascotProps) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`relative flex items-end gap-3 ${className ?? ''}`}>
      {speech && (
        <div className="relative mb-2" style={{
          background:'white', border:'1.6px solid #1e1608', borderRadius:14,
          padding:'8px 13px', fontFamily:'var(--font-display)', fontSize:14,
          lineHeight:1.3, boxShadow:'2px 2px 0 rgba(30,22,8,0.08)', maxWidth:170,
        }}>
          {speech}
          <div style={{
            position:'absolute', bottom:-10, left:18,
            borderLeft:'8px solid transparent', borderRight:'4px solid transparent',
            borderTop:'10px solid #1e1608',
          }}/>
          <div style={{
            position:'absolute', bottom:-6, left:20, zIndex:1,
            borderLeft:'6px solid transparent', borderRight:'3px solid transparent',
            borderTop:'8px solid white',
          }}/>
        </div>
      )}
      <svg width={size} height={size * 1.1} viewBox="0 0 70 76" fill="none" style={{flexShrink:0}}>
        {/* Hair */}
        <path d="M22 18 Q23 8 35 6 Q47 8 48 18 Q46 10 35 9 Q24 10 22 18Z" fill="#1e1608"/>
        {[-8,-4,0,4,8].map((x,i)=>(
          <line key={i} x1={35+x} y1={10} x2={35+x-2} y2={4+(i%2)*3} stroke="#1e1608" strokeWidth="1.8" strokeLinecap="round"/>
        ))}
        {/* Head */}
        <ellipse cx="35" cy="24" rx="14" ry="13" fill="white" stroke="#1e1608" strokeWidth="1.8"/>
        {/* Eyes */}
        {blink ? (
          <>
            <line x1="29" y1="23" x2="33" y2="23" stroke="#1e1608" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="37" y1="23" x2="41" y2="23" stroke="#1e1608" strokeWidth="1.5" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <circle cx="31" cy="23" r="2.2" fill="#1e1608"/>
            <circle cx="39" cy="23" r="2.2" fill="#1e1608"/>
            <circle cx="31.8" cy="22.2" r="0.7" fill="white"/>
            <circle cx="39.8" cy="22.2" r="0.7" fill="white"/>
          </>
        )}
        {/* Mouth */}
        <path d="M31 28 Q35 32 39 28" stroke="#1e1608" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Neck */}
        <path d="M31 37 L33 41 M39 37 L37 41" stroke="#1e1608" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Body */}
        <rect x="26" y="38" width="18" height="20" rx="5" fill="white" stroke="#1e1608" strokeWidth="1.8"/>
        {/* Arms */}
        <line x1="26" y1="42" x2="16" y2="50" stroke="#1e1608" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="42" x2="54" y2="50" stroke="#1e1608" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Legs */}
        <line x1="31" y1="58" x2="28" y2="72" stroke="#1e1608" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="39" y1="58" x2="42" y2="72" stroke="#1e1608" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Feet */}
        <ellipse cx="27" cy="73" rx="5" ry="2.8" fill="white" stroke="#1e1608" strokeWidth="1.5"/>
        <ellipse cx="43" cy="73" rx="5" ry="2.8" fill="white" stroke="#1e1608" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}