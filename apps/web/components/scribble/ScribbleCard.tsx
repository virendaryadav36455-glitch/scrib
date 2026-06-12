"use client";

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  ScribbleCard  —  Hand-drawn sticky-note component   ║
 * ║  Next.js 15 / React 18 — no external dependencies   ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * QUICK USAGE
 * ───────────
 *   <ScribbleCard color="yellow" attachment={{ type:"pin", position:"top-center", pinColor:"purple" }}>
 *     <p>Hello world</p>
 *   </ScribbleCard>
 *
 * PROPS CHEAT SHEET
 * ─────────────────
 *  color          — yellow | pink | green | blue | purple | orange | cream | white
 *  width / height — number | string
 *  padding        — number | string (CSS)
 *  rotate         — number degrees | "auto" (±1.5°) | "none"
 *  shadow         — boolean
 *  hoverLift      — boolean
 *  dogEar         — boolean  (bottom-right folded corner)
 *  bookFold       — boolean  (top-left corner fold — like a book)
 *  attachment     — { type:"pin"|"tape"|"none", position:"top-center"|"top-left"|"top-right", tapeColor, pinColor, double }
 *  slots          — { topLeft, topRight, bottomLeft, bottomRight, center } — ReactNode placed at corners
 *  wobble         — { passes, amp, strokeWidth } — control edge drawing
 *  border         — { color, width }
 *  seed           — number (deterministic jitter)
 *  className / style / contentStyle
 *  onClick
 */

import React, {
  CSSProperties,
  ReactNode,
  useRef,
  useLayoutEffect,
  useState,
  useMemo,
} from "react";

/* ════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════ */

export type CardColor = "yellow"|"pink"|"green"|"blue"|"purple"|"orange"|"cream"|"white";
export type TapeColor = "blue"|"pink"|"yellow"|"green"|"purple"|"orange";
export type PinColor  = "purple"|"red"|"blue"|"yellow"|"green"|"pink";
export type AttachPosition = "top-center"|"top-left"|"top-right";

export interface AttachmentConfig {
  type?:      "none"|"pin"|"tape";
  position?:  AttachPosition;
  tapeColor?: TapeColor;
  pinColor?:  PinColor;
  /** Show a second tape/pin next to the first */
  double?: boolean;
}

export interface SlotConfig {
  topLeft?:     ReactNode;
  topRight?:    ReactNode;
  bottomLeft?:  ReactNode;
  bottomRight?: ReactNode;
  center?:      ReactNode;
}

export interface WobbleConfig {
  /** How many re-draw passes (default 3) — more = more "drawn repeatedly" feel */
  passes?:      number;
  /** Jitter amplitude px (default 2.0) */
  amp?:         number;
  /** Stroke width base (default 0.85) */
  strokeWidth?: number;
}

export interface ScribbleCardProps {
  children?:     ReactNode;
  color?:        CardColor;
  width?:        number|string;
  height?:       number|string;
  padding?:      number|string;
  rotate?:       number|"auto"|"none";
  shadow?:       boolean;
  hoverLift?:    boolean;
  dogEar?:       boolean;
  bookFold?:     boolean;
  attachment?:   AttachmentConfig;
  slots?:        SlotConfig;
  wobble?:       WobbleConfig;
  border?:       { color?: string; width?: number };
  seed?:         number;
  className?:    string;
  style?:        CSSProperties;
  contentStyle?: CSSProperties;
  onClick?:      () => void;
}

/* ════════════════════════════════════════════════════════
   COLOR MAPS
════════════════════════════════════════════════════════ */

const BG: Record<CardColor,string> = {
  yellow:"#fbe98c", pink:"#f9c8c8",  green:"#cff0d0", blue:"#c8e2fa",
  purple:"#e0d4f7", orange:"#fdd9a0",cream:"#fefaf2", white:"#fffdf7",
};

const TAPE_BG: Record<TapeColor,string> = {
  blue:"#c8e2fa", pink:"#f9c8c8", yellow:"#fbe98c",
  green:"#cff0d0", purple:"#e0d4f7", orange:"#fdd9a0",
};

const PIN_CLR: Record<PinColor,{head:string;shine:string}> = {
  purple:{head:"#7c5cbf",shine:"rgba(255,255,255,.38)"},
  red:   {head:"#e05c5c",shine:"rgba(255,255,255,.35)"},
  blue:  {head:"#4a7fcc",shine:"rgba(255,255,255,.35)"},
  yellow:{head:"#d4a017",shine:"rgba(255,255,255,.30)"},
  green: {head:"#3d9b5c",shine:"rgba(255,255,255,.32)"},
  pink:  {head:"#d4608a",shine:"rgba(255,255,255,.35)"},
};

/* ════════════════════════════════════════════════════════
   DRAWING ENGINE
════════════════════════════════════════════════════════ */

function rng(s:number,i:number):number {
  const x=Math.sin(s*9301+i*49297+233711)*43758.5453;
  return x-Math.floor(x);
}

function wobblePts(W:number,H:number,seed:number,amp:number){
  const r=(i:number)=>(rng(seed,i)-.5)*amp*2;
  return[
    [3.5+r(0),   2+r(1)],   [W*.28+r(2), 1+r(3)],    [W*.52+r(4), 1.6+r(5)],
    [W*.74+r(6), 1+r(7)],   [W-3.5+r(8), 2+r(9)],    [W-1.5+r(10),H*.28+r(11)],
    [W-1.8+r(12),H*.62+r(13)],[W-2.5+r(14),H-2.5+r(15)],[W*.74+r(16),H-1.2+r(17)],
    [W*.48+r(18),H-1.8+r(19)],[W*.26+r(20),H-1.2+r(21)],[3+r(22),  H-2.5+r(23)],
    [1.5+r(24),  H*.62+r(25)],[1.5+r(26), H*.28+r(27)],
  ];
}

function drawWobbleEdge(
  canvas:HTMLCanvasElement, W:number, H:number,
  opts:{fill:string;passes:number;amp:number;sw:number;seed:number;strokeColor?:string}
){
  const dpr=window.devicePixelRatio||1;
  canvas.width=(W+8)*dpr; canvas.height=(H+8)*dpr;
  canvas.style.width=`${W+8}px`; canvas.style.height=`${H+8}px`;
  const ctx=canvas.getContext("2d")!;
  ctx.scale(dpr,dpr); ctx.clearRect(0,0,W+8,H+8);
  ctx.save(); ctx.translate(4,4);

  // fill
  const fp=wobblePts(W,H,opts.seed,opts.amp*.5);
  ctx.beginPath(); ctx.moveTo(fp[0]![0]!,fp[0]![1]!);
  for(let i=1;i<fp.length;i++){
    const p=fp[i-1]!,c=fp[i]!;
    ctx.quadraticCurveTo(p[0]!,p[1]!,(p[0]!+c[0]!)/2,(p[1]!+c[1]!)/2);
  }
  ctx.quadraticCurveTo(fp[fp.length-1]![0]!,fp[fp.length-1]![1]!,fp[0]![0]!,fp[0]![1]!);
  ctx.closePath(); ctx.fillStyle=opts.fill; ctx.fill();

  // stroke passes
  for(let p=0;p<opts.passes;p++){
    const jit=(p-opts.passes/2)*.28;
    const alpha=0.09+p*.088;
    const sw=opts.sw*(0.62+p*.12);
    const pts=wobblePts(W,H,opts.seed+p*19,opts.amp);
    ctx.beginPath(); ctx.moveTo(pts[0]![0]!,pts[0]![1]!+jit);
    for(let i=1;i<pts.length;i++){
      const prev=pts[i-1]!,curr=pts[i]!;
      ctx.quadraticCurveTo(prev[0]!,prev[1]!+jit,(prev[0]!+curr[0]!)/2,(prev[1]!+curr[1]!)/2+jit);
    }
    ctx.quadraticCurveTo(pts[pts.length-1]![0]!,pts[pts.length-1]![1]!+jit,pts[0]![0]!,pts[0]![1]!+jit);
    ctx.closePath();
    ctx.strokeStyle=opts.strokeColor??`rgba(30,22,8,${alpha})`;
    ctx.lineWidth=sw; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.setLineDash([]); ctx.stroke();
  }
  ctx.restore();
}

/* ════════════════════════════════════════════════════════
   TAPE  SVG
════════════════════════════════════════════════════════ */

export function TapeStrip({color,rotate=0,double:isDouble=false}:{color:TapeColor;rotate?:number;double?:boolean}){
  const bg=TAPE_BG[color];
  const strip=(key:number,dy=0)=>(
    <svg key={key} width="54" height="18" viewBox="0 0 54 18" fill="none"
      style={{transform:`rotate(${rotate+dy*3}deg)`,display:"block"}}>
      <path d="M3 4.5 Q4 1.5 8 1.2 L46 1.8 Q50 2 51 4.8 L51 13.2 Q50 16 46 16.2 L8 15.8 Q4 15.5 3 13 Z"
        fill={bg} fillOpacity="0.9" stroke="rgba(30,22,8,0.10)" strokeWidth="0.7"/>
      {[10,20,30,40].map(x=>(
        <line key={x} x1={x} y1="3.5" x2={x-2} y2="14.5" stroke="white" strokeWidth="0.7" strokeOpacity="0.3"/>
      ))}
      <path d="M3 13 Q15 14.8 27 14 Q39 13.2 51 13" stroke="rgba(30,22,8,0.06)" strokeWidth="0.7" fill="none"/>
      <path d="M3 4.8 Q14 3.2 27 4 Q40 4.8 51 4.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none"/>
    </svg>
  );
  if(!isDouble) return strip(0);
  return <div style={{display:"flex",flexDirection:"column",gap:3}}>{strip(0,0)}{strip(1,1)}</div>;
}

/* ════════════════════════════════════════════════════════
   PIN  SVG
════════════════════════════════════════════════════════ */

export function PinSVG({color,double:isDouble=false}:{color:PinColor;double?:boolean}){
  const{head,shine}=PIN_CLR[color];
  const pin=(key:number,rot=0)=>(
    <svg key={key} width="20" height="28" viewBox="0 0 20 28" fill="none"
      style={{transform:`rotate(${rot}deg)`,display:"block"}}>
      <circle cx="10" cy="9" r="8.5" fill={head}/>
      <ellipse cx="7.5" cy="6" rx="3" ry="2" fill={shine} transform="rotate(-25 7.5 6)"/>
      <circle cx="10" cy="9" r="8.5" stroke="rgba(30,22,8,0.30)" strokeWidth="1.2"/>
      <path d="M10 17.5 Q9.5 21 10 26" stroke="rgba(30,22,8,0.55)" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="10" cy="17.5" rx="4" ry="1.2" fill="rgba(30,22,8,0.09)"/>
    </svg>
  );
  if(!isDouble) return pin(0,0);
  return <div style={{display:"flex",gap:4,alignItems:"flex-end"}}>{pin(0,-8)}{pin(1,6)}</div>;
}

/* ════════════════════════════════════════════════════════
   CORNER FOLDS
════════════════════════════════════════════════════════ */

function DogEar({bg}:{bg:string}){
  return(
    <div style={{position:"absolute",right:0,bottom:0,width:26,height:26,pointerEvents:"none",zIndex:5,overflow:"hidden"}}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M0 26 L26 0 L26 26 Z" fill="rgba(30,22,8,0.09)"/>
        <path d="M5 26 L26 5 L26 26 Z" fill={bg} opacity="0.75" stroke="rgba(30,22,8,0.13)" strokeWidth="0.7"/>
        <path d="M5 26 L26 5" stroke="rgba(30,22,8,0.12)" strokeWidth="0.6"/>
      </svg>
    </div>
  );
}

function BookFold({bg}:{bg:string}){
  return(
    <div style={{position:"absolute",left:0,top:0,width:22,height:22,pointerEvents:"none",zIndex:5,overflow:"hidden"}}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M0 0 L22 22 L0 22 Z" fill="rgba(30,22,8,0.06)"/>
        <path d="M0 0 L18 0 L0 18 Z" fill={bg} opacity="0.72" stroke="rgba(30,22,8,0.12)" strokeWidth="0.7"/>
        <path d="M0 18 L18 0" stroke="rgba(30,22,8,0.10)" strokeWidth="0.6"/>
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ATTACHMENT
════════════════════════════════════════════════════════ */

function Attachment({cfg,rotation}:{cfg:AttachmentConfig;rotation:number}){
  const{type="none",position="top-center",tapeColor="blue",pinColor="purple",double:isDouble=false}=cfg;
  if(type==="none") return null;
  const posStyle:CSSProperties=
    position==="top-center"
      ?{top:type==="pin"?-15:-10,left:"50%",transform:"translateX(-50%)"}
    :position==="top-left"
      ?{top:type==="pin"?-14:-9,left:isDouble?8:14}
      :{top:type==="pin"?-14:-9,right:isDouble?8:14};
  return(
    <div style={{position:"absolute",zIndex:20,pointerEvents:"none",...posStyle}}>
      {type==="tape"&&<TapeStrip color={tapeColor} rotate={position==="top-left"?-4:position==="top-right"?3:-1.5} double={isDouble}/>}
      {type==="pin"&&<PinSVG color={pinColor} double={isDouble}/>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SLOT
════════════════════════════════════════════════════════ */

function Slot({children,position}:{children:ReactNode;position:"tl"|"tr"|"bl"|"br"|"center"}){
  const posMap:Record<string,CSSProperties>={
    tl:{top:10,left:10},tr:{top:10,right:10},bl:{bottom:12,left:10},br:{bottom:12,right:10},
    center:{top:"50%",left:"50%",transform:"translate(-50%,-50%)"},
  };
  return(
    <div style={{position:"absolute",zIndex:6,pointerEvents:"none",opacity:.75,...posMap[position]}}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN  ScribbleCard
════════════════════════════════════════════════════════ */

export function ScribbleCard({
  children, color="yellow", width, height, padding=20,
  rotate="auto", shadow=true, hoverLift=false,
  dogEar=false, bookFold=false,
  attachment={type:"none"}, slots={},
  wobble={}, border={}, seed=42,
  className="", style={}, contentStyle={}, onClick,
}:ScribbleCardProps){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const containerRef=useRef<HTMLDivElement>(null);
  const[dims,setDims]=useState({w:0,h:0});
  const[hovered,setHovered]=useState(false);

  const tiltDeg=useMemo(()=>{
    if(rotate==="none") return 0;
    if(rotate==="auto") return(rng(seed,99)-.5)*2.4;
    return rotate as number;
  },[rotate,seed]);

  useLayoutEffect(()=>{
    const el=containerRef.current; if(!el) return;
    const obs=new ResizeObserver(([entry])=>{
      const{width:w,height:h}=entry!.contentRect;
      setDims({w:Math.floor(w),h:Math.floor(h)});
    });
    obs.observe(el); return()=>obs.disconnect();
  },[]);

  useLayoutEffect(()=>{
    const c=canvasRef.current;
    if(!c||dims.w<8||dims.h<8) return;
    drawWobbleEdge(c,dims.w,dims.h,{
      fill:BG[color], passes:wobble.passes??3,
      amp:wobble.amp??2.0, sw:wobble.strokeWidth??0.85, seed,
    });
  },[dims,color,wobble.passes,wobble.amp,wobble.strokeWidth,seed]);

  const bg=BG[color];
  const shadowVal=shadow
    ?hovered&&hoverLift
      ?"6px 8px 0 rgba(30,22,8,0.15),3px 4px 0 rgba(30,22,8,0.07)"
      :"4px 5px 0 rgba(30,22,8,0.11),2px 3px 0 rgba(30,22,8,0.05)"
    :"none";

  return(
    <div ref={containerRef} className={className} onClick={onClick}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        position:"relative",display:"inline-block",width,height,
        transform:hovered&&hoverLift?"rotate(0deg) translateY(-4px)":`rotate(${tiltDeg}deg)`,
        transition:"transform 0.2s ease,box-shadow 0.2s ease",
        boxShadow:shadowVal,cursor:onClick?"pointer":"default",
        overflow:"visible",borderRadius:4,...style,
      }}>
      <Attachment cfg={attachment} rotation={tiltDeg}/>
      <canvas ref={canvasRef} style={{position:"absolute",top:-4,left:-4,pointerEvents:"none",zIndex:2,borderRadius:8}}/>
      <div style={{position:"relative",backgroundColor:bg,borderRadius:4,width:"100%",height:height?"100%":undefined,overflow:"hidden"}}>
        {/* ruled lines */}
        <div style={{position:"absolute",inset:0,backgroundImage:`repeating-linear-gradient(180deg,transparent 0px,transparent 23px,rgba(30,22,8,0.032) 23px,rgba(30,22,8,0.032) 24px)`,borderRadius:"inherit",pointerEvents:"none",zIndex:0}}/>
        {dogEar  &&<DogEar   bg={bg}/>}
        {bookFold&&<BookFold bg={bg}/>}
        {slots.topLeft    &&<Slot position="tl">{slots.topLeft}</Slot>}
        {slots.topRight   &&<Slot position="tr">{slots.topRight}</Slot>}
        {slots.bottomLeft &&<Slot position="bl">{slots.bottomLeft}</Slot>}
        {slots.bottomRight&&<Slot position="br">{slots.bottomRight}</Slot>}
        {slots.center     &&<Slot position="center">{slots.center}</Slot>}
        <div style={{position:"relative",zIndex:4,padding:typeof padding==="number"?padding:padding,height:height?"100%":undefined,...contentStyle}}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DECORATION  SVGs  (re-export)
════════════════════════════════════════════════════════ */

export function TrendUpSVG({width=58}:{width?:number}){
  const H=34;
  return(
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} fill="none">
      <line x1="4" y1={H-6} x2={width-4} y2={H-6} stroke="rgba(30,22,8,0.10)" strokeWidth="0.6"/>
      <line x1="4" y1={H-14} x2={width-4} y2={H-14} stroke="rgba(30,22,8,0.07)" strokeWidth="0.5" strokeDasharray="2 2"/>
      {[0,1,2].map(p=>(
        <path key={p} d={`M4 ${H-8+(p-1)*.3} Q${width*.3} ${H-16+p*.2} ${width*.55} ${H-22+(p-1)*.25} Q${width*.78} ${H-28+p*.15} ${width-6} ${H-31+(p-1)*.3}`}
          stroke={`rgba(30,22,8,${.22+p*.12})`} strokeWidth={.72+p*.11} strokeLinecap="round" fill="none"/>
      ))}
      <path d={`M${width-10} ${H-34} L${width-5} ${H-31} L${width-9} ${H-27}`} stroke="rgba(30,22,8,0.42)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function StarSVG({size=22,fill="none",stroke="rgba(30,22,8,0.55)"}:{size?:number;fill?:string;stroke?:string}){
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.9 6.1H22l-5.8 4.4 2.1 7.4L12 16.4l-6.3 3.5 2.1-7.4L2 8.1h7.1z"/>
    </svg>
  );
}

export function CrownSVG({size=24,stroke="rgba(30,22,8,0.55)"}:{size?:number;stroke?:string}){
  return(
    <svg width={size} height={size*.75} viewBox="0 0 32 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20 L5 6 L11 13 L16 2 L21 13 L27 6 L30 20 Z" fill="rgba(251,233,140,0.55)"/>
      <path d="M2 20 h28"/>
      <circle cx="16" cy="2" r="1.5" fill={stroke}/>
      <circle cx="5" cy="6" r="1.2" fill={stroke}/>
      <circle cx="27" cy="6" r="1.2" fill={stroke}/>
    </svg>
  );
}

export function HeartSVG({size=18,fill="rgba(224,92,92,0.55)",stroke="rgba(200,60,60,0.6)"}:{size?:number;fill?:string;stroke?:string}){
  return(
    <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} stroke={stroke} strokeWidth="1">
      <path d="M10 17C10 17 2 11 2 6C2 3.8 3.8 2 6 2C7.7 2 9.1 3 10 4.3C10.9 3 12.3 2 14 2C16.2 2 18 3.8 18 6C18 11 10 17 10 17Z"/>
    </svg>
  );
}

export function CheckSVG({size=18}:{size?:number}){
  return(
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 10 Q2 2 10 2 Q18 2 18 10 Q18 18 10 18 Q2 18 2 10 Z" fill="rgba(207,240,208,0.8)" stroke="rgba(45,140,62,0.55)" strokeWidth="1.2"/>
      <path d="M6 10l3 3 6-6" stroke="rgba(30,120,50,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SmileySVG({size=22}:{size?:number}){
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="rgba(251,233,140,0.6)" stroke="rgba(30,22,8,0.40)" strokeWidth="1.2"/>
      <circle cx="9" cy="10" r="1.2" fill="rgba(30,22,8,0.6)"/>
      <circle cx="15" cy="10" r="1.2" fill="rgba(30,22,8,0.6)"/>
      <path d="M8.5 14.5 Q12 17.5 15.5 14.5" stroke="rgba(30,22,8,0.55)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function PaperPlaneSVG({size=36}:{size?:number}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M4 4 L36 18 L20 22 L16 36 Z" fill="rgba(255,255,255,0.7)" stroke="rgba(30,22,8,0.45)" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M36 18 L20 22" stroke="rgba(30,22,8,0.30)" strokeWidth="0.8"/>
      <path d="M20 22 L24 14" stroke="rgba(30,22,8,0.25)" strokeWidth="0.7" strokeDasharray="2 2"/>
    </svg>
  );
}

export function EyeSVG({size=28}:{size?:number}){
  return(
    <svg width={size} height={size*.65} viewBox="0 0 32 21" fill="none">
      {[0,1,2].map(p=>(
        <path key={p} d={`M2 ${10+(p-1)*.3} Q8 ${2+p*.2} 16 ${1.5+(p-1)*.25} Q24 ${2+p*.15} 30 ${10+(p-1)*.3} Q24 ${18+p*.1} 16 ${19+(p-1)*.2} Q8 ${18+p*.1} 2 ${10+(p-1)*.3} Z`}
          stroke={`rgba(30,22,8,${.20+p*.12})`} strokeWidth={.7+p*.1} fill="none" strokeLinecap="round"/>
      ))}
      <circle cx="16" cy="10" r="5" fill="rgba(30,22,8,0.12)" stroke="rgba(30,22,8,0.40)" strokeWidth="1"/>
      <circle cx="16" cy="10" r="2.5" fill="rgba(30,22,8,0.30)"/>
      <circle cx="14.5" cy="8.5" r="1" fill="white" opacity="0.5"/>
    </svg>
  );
}

export function ClockSVG({size=28}:{size?:number}){
  return(
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" fill="rgba(255,255,255,0.4)" stroke="rgba(30,22,8,0.40)" strokeWidth="1.2"/>
      <path d="M14 8 V14 L18 17" stroke="rgba(30,22,8,0.55)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14" cy="14" r="1.2" fill="rgba(30,22,8,0.5)"/>
    </svg>
  );
}

export function ProgressBar({value,color="rgba(124,92,191,0.45)",bg="rgba(30,22,8,0.08)"}:{value:number;color?:string;bg?:string}){
  return(
    <div style={{width:"100%",height:6,borderRadius:3,background:bg,overflow:"hidden",marginTop:6}}>
      <div style={{width:`${Math.min(100,Math.max(0,value))}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.6s ease"}}/>
    </div>
  );
}