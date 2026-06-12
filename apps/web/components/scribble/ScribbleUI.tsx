'use client';
import { DotIcon, SpinnerIcon } from '~/components/icons';
import { cn } from '~/lib/utils';

/* ── Badge ── */
const BADGE_MAP: Record<string,{bg:string;text:string;dot:string}> = {
  published: {bg:'#d4f5d4',text:'#1a6b1a',dot:'#2d7d46'},
  draft:     {bg:'#fff5d0',text:'#6b5200',dot:'#a07820'},
  archived:  {bg:'#e8e8e8',text:'#555',dot:'#888'},
  popular:   {bg:'#f0e8ff',text:'#5a3fa0',dot:'#b8a0e8'},
  active:    {bg:'#d4f5ff',text:'#185fa5',dot:'#7ec8e3'},
  new:       {bg:'#ffe8f0',text:'#8a1a4a',dot:'#f2a0b8'},
  pro:       {bg:'#b8a0e8',text:'#1e1608',dot:'#7a60c0'},
  free:      {bg:'#f5c842',text:'#1e1608',dot:'#c09010'},
  unlisted:  {bg:'#f0e8d8',text:'#6b5d44',dot:'#aaa'},
  public:    {bg:'#d4f5d4',text:'#1a6b1a',dot:'#2d7d46'},
  paused:    {bg:'#fde8c0',text:'#8b5e00',dot:'#c07820'},
};

export function ScribbleBadge({type,label,className}:{type:string;label?:string;className?:string}) {
  const s = BADGE_MAP[type] ?? BADGE_MAP.draft;
  const text = label ?? type.charAt(0).toUpperCase()+type.slice(1);
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5',className)}
      style={{background:s!.bg,color:s!.text,fontSize:11,borderRadius:20,
        border:'1px solid rgba(30,22,8,0.1)',fontFamily:'var(--font-display)',fontWeight:700}}>
      <DotIcon size={6} fill={s!.dot}/> {text}
    </span>
  );
}

/* ── Progress Bar ── */
export function ScribbleProgressBar({value,max=100,color='purple',height=8,className}:{
  value:number;max?:number;color?:'purple'|'green'|'yellow'|'blue';height?:number;className?:string;
}) {
  const pct = Math.min(100,Math.max(0,(value/max)*100));
  const COLORS = {purple:'#b8a0e8',green:'#8dc97a',yellow:'#f5c842',blue:'#7ec8e3'};
  return (
    <div className={cn('relative w-full rounded-full overflow-hidden',className)} style={{height,background:'rgba(30,22,8,0.08)'}}>
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
        style={{width:`${pct}%`,background:COLORS[color]}}/>
    </div>
  );
}

/* ── Spinner ── */
export { SpinnerIcon as ScribbleSpinner };

/* ── Skeleton ── */
export function SkeletonScribble({height=80,className}:{height?:number;className?:string}) {
  return (
    <div className={cn('relative overflow-hidden rounded',className)} style={{height}}>
      <div className="absolute inset-0" style={{
        background:'linear-gradient(90deg, rgba(30,22,8,0.04) 25%, rgba(30,22,8,0.08) 50%, rgba(30,22,8,0.04) 75%)',
        backgroundSize:'200% 100%',
        animation:'shimmer 1.8s ease-in-out infinite',
      }}/>
      <style>{`@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ── Toggle ── */
export function ScribbleToggle({checked,onChange,size='md',disabled}:{
  checked:boolean;onChange:(v:boolean)=>void;size?:'sm'|'md';disabled?:boolean;
}) {
  const W = size==='sm' ? 34 : 42;
  const H = size==='sm' ? 19 : 24;
  const K = size==='sm' ? 13 : 18;
  return (
    <button type="button"
      onClick={()=>!disabled&&onChange(!checked)}
      className={cn('relative flex-shrink-0',disabled&&'opacity-50 cursor-not-allowed')}
      style={{width:W,height:H,cursor:disabled?'not-allowed':'pointer'}}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
        <rect x="1.5" y="1.5" width={W-3} height={H-3} rx={H/2}
          fill={checked ? '#8dc97a' : '#e8ddd0'} stroke="#1e1608" strokeWidth="1.4"/>
      </svg>
      <div className="absolute rounded-full bg-white transition-all duration-200"
        style={{
          width:K,height:K,top:(H-K)/2,
          left: checked ? W-K-3 : 3,
          boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
        }}/>
    </button>
  );
}

/* ── Checkbox ── */
export function ScribbleCheckbox({checked,onChange,label,disabled}:{
  checked:boolean;onChange:(v:boolean)=>void;label?:string;disabled?:boolean;
}) {
  return (
    <button type="button"
      onClick={()=>!disabled&&onChange(!checked)}
      className={cn('flex items-center gap-2 cursor-pointer',disabled&&'opacity-50 cursor-not-allowed')}
      style={{fontFamily:'var(--font-body)'}}
    >
      <div className="relative" style={{width:20,height:20,flexShrink:0}}>
        <svg viewBox="0 0 20 20" width={20} height={20} className="absolute inset-0">
          <path d="M2 10 Q2 2.5 10 2 Q17.5 2.5 18 10 Q17.5 17.5 10 18 Q2.5 17.5 2 10Z"
            fill={checked ? '#8dc97a' : '#fdf8ef'} stroke="#1e1608" strokeWidth="1.5"/>
        </svg>
        {checked && (
          <svg viewBox="0 0 20 20" width={20} height={20} className="absolute inset-0">
            <path d="M5 10 L8 13.5 L15 6" stroke="#1e1608" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label && <span className="text-sm" style={{color:'var(--ink-2)'}}>{label}</span>}
    </button>
  );
}

/* ── Toast ── */
export function ScribbleToast({type='success',message,onClose}:{type?:'success'|'error'|'info';message:string;onClose?:()=>void}) {
  const colors = {success:{bg:'#d4f5d4',border:'#2d7d46',icon:'✓'},error:{bg:'#ffe0dd',border:'#c0392b',icon:'✕'},info:{bg:'#d4e8ff',border:'#1565c0',icon:'i'}};
  const c = colors[type];
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded shadow-md" style={{background:c.bg,border:`1.5px solid ${c.border}`,fontFamily:'var(--font-body)'}}>
      <span style={{color:c.border,fontWeight:'bold'}}>{c.icon}</span>
      <span className="text-sm flex-1" style={{color:'var(--ink-1)'}}>{message}</span>
      {onClose && <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100" style={{color:'var(--ink-2)'}}>✕</button>}
    </div>
  );
}