'use client';

import {
  useRef,
  useLayoutEffect,
  useState,
  forwardRef,
} from 'react';

import rough from 'roughjs';
import { cn } from '~/lib/utils';
import { WarningIcon } from '~/components/icons';

interface ScribbleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  roughness?: number;
  wrapClassName?: string;
}

export const ScribbleInput = forwardRef<
  HTMLInputElement,
  ScribbleInputProps
>(
  (
    {
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      roughness = 0.7,
      className,
      wrapClassName,
      ...props
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    const [dims, setDims] = useState({
      w: 0,
      h: 0,
    });

    const [focused, setFocused] = useState(false);

    // FIXED RESIZE OBSERVER
    useLayoutEffect(() => {
      if (!wrapRef.current) return;

      const obs = new ResizeObserver(([entry]) => {
        const newW = Math.floor(entry!.contentRect.width);
        const newH = Math.floor(entry!.contentRect.height);

        setDims((prev) => {
          if (prev.w === newW && prev.h === newH) {
            return prev;
          }

          return {
            w: newW,
            h: newH,
          };
        });
      });

      obs.observe(wrapRef.current);

      return () => obs.disconnect();
    }, []);

    // DRAW BORDER
    useLayoutEffect(() => {
      if (!svgRef.current) return;
      if (dims.w < 4 || dims.h < 4) return;

      const svg = svgRef.current;

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      const rc = rough.svg(svg);

      const strokeColor = error
        ? '#c0392b'
        : focused
        ? '#b8a0e8'
        : 'rgba(30,22,8,0.22)';

      const node = rc.rectangle(
        2,
        2,
        dims.w - 4,
        dims.h - 4,
        {
          roughness,
          strokeWidth: focused ? 2 : 1.4,
          fill: 'transparent',
          stroke: strokeColor,
        }
      );

      svg.appendChild(node);
    }, [dims, focused, error, roughness]);

    return (
      <div
        className={cn(
          'flex flex-col gap-1 w-full',
          wrapClassName
        )}
      >
        {label && (
          <label
            className="text-sm font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--ink-2)',
            }}
          >
            {label}
          </label>
        )}

        <div
          ref={wrapRef}
          className="relative overflow-hidden"
        >
          <svg
            ref={svgRef}
            width={dims.w}
            height={dims.h}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 0,
            }}
          />

          {leftIcon && (
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10"
              style={{
                color: 'var(--ink-3)',
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'relative w-full bg-transparent outline-none',
              'py-2.5 text-base',
              leftIcon ? 'pl-8 pr-3' : 'pl-3',
              rightIcon ? 'pr-8' : '',
              className
            )}
            style={{
              zIndex: 1,
              fontFamily: 'var(--font-body)',
              color: 'var(--ink-1)',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10"
              style={{
                color: 'var(--ink-3)',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-xs flex items-center gap-1"
            style={{
              color: 'var(--fail)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <WarningIcon
              size={12}
              stroke="#c0392b"
            />
            {error}
          </p>
        )}

        {helpText && !error && (
          <p
            className="text-xs"
            style={{
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

ScribbleInput.displayName = 'ScribbleInput';

/* Textarea variant */
interface ScribbleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  roughness?: number;
}

export const ScribbleTextarea = forwardRef<HTMLTextAreaElement, ScribbleTextareaProps>(
  ({label,error,roughness=0.7,className,...props},ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [dims, setDims] = useState({w:0,h:0});
    const [focused, setFocused] = useState(false);

    useLayoutEffect(() => {
      const obs = new ResizeObserver(([e]) =>
        setDims({w:Math.floor(e!.contentRect.width),h:Math.floor(e!.contentRect.height)})
      );
      if (wrapRef.current) obs.observe(wrapRef.current);
      return () => obs.disconnect();
    }, []);

    useLayoutEffect(() => {
      if (!svgRef.current || dims.w < 4) return;
      const rc = rough.svg(svgRef.current);
      while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      const strokeColor = error ? '#c0392b' : focused ? '#b8a0e8' : 'rgba(30,22,8,0.22)';
      svgRef.current.appendChild(rc.rectangle(1.5,1.5,dims.w-3,dims.h-3,{
        roughness, strokeWidth:focused?2:1.4,
        fill:'#fdf8ef', fillStyle:'solid', stroke:strokeColor,
      }));
    }, [dims,focused,error,roughness]);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-bold" style={{fontFamily:'var(--font-display)',color:'var(--ink-2)'}}>{label}</label>}
        <div ref={wrapRef} className="relative">
          <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0}} width={dims.w} height={dims.h}/>
          <textarea
            ref={ref}
            className={cn('relative w-full bg-transparent outline-none resize-none px-3 py-2.5 text-base',className)}
            style={{zIndex:1,fontFamily:'var(--font-body)',color:'var(--ink-1)'}}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            {...props}
          />
        </div>
        {error && <p className="text-xs flex items-center gap-1" style={{color:'var(--fail)'}}><WarningIcon size={12}/>{error}</p>}
      </div>
    );
  }
);
ScribbleTextarea.displayName = 'ScribbleTextarea';