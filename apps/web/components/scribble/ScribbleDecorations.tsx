'use client';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  color?: string;
  width?: string | number;
  strokeWidth?: number;
};

export function ScribbleDivider({
  color = 'rgba(30,22,8,0.18)',
  width = '100%',
  strokeWidth = 1.5,
  className = '',
  style,
  ...props
}: Props) {
  return (
    <div
      className={className}
      style={{ width, ...style }}
      {...props}
    >
      <svg
        viewBox="0 0 400 8"
        height="8"
        style={{ width: '100%', display: 'block' }}
        fill="none"
      >
        <path
          d="M0 4 Q20 1.5 40 4 Q60 6.5 80 3.5 Q100 1 120 4.5 Q140 7 160 3 Q180 0.5 200 4 Q220 7 240 3.5 Q260 0.5 280 4.5 Q300 7 320 3 Q340 0.5 360 4 Q380 7 400 4"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* Wobbly underline for headings */
export function ScribbleUnderline({ color='#b8a0e8', width=120 }) {
  return (
    <svg viewBox={`0 0 ${width} 6`} height="6" style={{width,display:'block'}} fill="none">
      <path
        d={`M2 3 Q${width*0.3} 1 ${width*0.5} 3 Q${width*0.7} 5 ${width-2} 3`}
        stroke={color} strokeWidth="2.2" strokeLinecap="round"
      />
    </svg>
  );
}

/* Decorative star sparkle */
export function SparkleIcon({ size=16, color='#f5c842' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.5 3.5H13L10.5 7l1 3.5L8 9l-3.5 1.5 1-3.5L3 5h3.5z"
        fill={color} stroke="rgba(30,22,8,0.3)" strokeWidth="0.8" strokeLinejoin="round"/>
    </svg>
  );
}

/* Tape decorative strip */
export function TapeStrip({ color='#f2a0b8', rotation='-3deg', width=52, height=14 }) {
  return (
    <div style={{transform:`rotate(${rotation})`,display:'inline-block'}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path
          d={`M2 3 L4 1 L${width-4} 1.2 L${width-2} 3 L${width-2} ${height-3} L${width-4} ${height-1} L4 ${height-1.2} L2 ${height-3} Z`}
          fill={color} fillOpacity="0.78" stroke="rgba(30,22,8,0.12)" strokeWidth="0.7"
        />
        {[10,22,34,46].filter(x=>x<width-6).map(x=>(
          <line key={x} x1={x} y1="3" x2={x-2} y2={height-3} stroke="white" strokeWidth="0.5" strokeOpacity="0.35"/>
        ))}
      </svg>
    </div>
  );
}

/* Pin SVG */
export function PinSVG({ color='#e57373', size=18 }) {
  return (
    <svg width={size} height={size*1.3} viewBox="0 0 18 24">
      <circle cx="9" cy="8" r="7" fill={color} stroke="#8b2020" strokeWidth="1"/>
      <circle cx="7" cy="6" r="2" fill="white" fillOpacity="0.4"/>
      <line x1="9" y1="15" x2="9" y2="24" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/* Page outer wobbly border */
export function OuterBorder() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 w-full h-full"
      style={{zIndex:100}}
      fill="none"
      preserveAspectRatio="none"
    >
      <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)"
        rx="4" stroke="rgba(30,22,8,0.22)" strokeWidth="2"
        strokeDasharray="none" fill="none"
        style={{
          vectorEffect:'non-scaling-stroke',
          filter:'url(#wobble)',
        }}
      />
      <filter id="wobble">
        <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" result="noise" seed="2"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
  );
}