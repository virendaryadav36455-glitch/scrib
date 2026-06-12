"use client";
import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe, useSignup } from "~/hooks/api/auth"; // Your actual production signup hook
import { ScribbleButton } from "~/components/scribble/ScribbleButton";
import { ScribbleCustomButton, ScribbleCustomInput } from "~/components/scribble/ScribInput";

// ── VALIDATION RULES SCHEMA MATCHING BACKEND STANDARDS ──
const signupValidationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

type SignupFormValues = z.infer<typeof signupValidationSchema>;

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const SignupPage: NextPage = () => {
  const signupMut = useSignup();
  const user = useMe();
  
  // Controls the dynamic window matrix sizing (Responsive Anchor)
  const [scaleFactor, setScaleFactor] = useState(0.85);

  // ✅ ADDING STATE FOR PASSWORD VISIBILITY (Solves the "Cannot find name 'showPass'" error)
  const [showPass, setShowPass] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    function handleResize() {
      const baseWidth = 1440;
      const baseHeight = 900;
      
      const scaleX = window.innerWidth / baseWidth;
      const scaleY = window.innerHeight / baseHeight;
      
      // Chooses the best fit scaling metric to maintain proportions without clipping
      let bestScale = Math.min(scaleX, scaleY);
      
      // Enforce safe boundaries for extreme monitor polarities
      if (bestScale > 1.1) bestScale = 1.1;
      if (bestScale < 0.65) bestScale = 0.65;

      setScaleFactor(bestScale);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── HOOK FORM UTILITIES ASSEMBLED WITH ZOD SCHEMA RESOLVER ──
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupValidationSchema)
  });

  const onSubmitHandler = handleSubmit((data) => {
    signupMut.mutate(data);
  });

  return (
    <div 
      style={{
        display: 'flex',
        backgroundColor: '#fcf4e4',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Nunito', sans-serif",
        color: '#1e1608',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* 🛡️ CROSS-BROWSER CSS OVERRIDES FOR RENDERING EQUALITY (Normalized Chrome & Brave) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scribble-viewport-lock-matrix, .scribble-viewport-lock-matrix * {
          box-sizing: border-box !important;
        }

        /* Standardizes input behavior against Brave/Chrome shields variations */
        .scribble-form-field-input input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          appearance: none !important;
        }
      `}} />

      {/* ── GLOBAL ALIGNED NOTEBOOK BACKDROP CONTAINER ── */}
      <div 
        className="scribble-viewport-lock-matrix"
        style={{
          width: '1440px',
          height: '900px',
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {/* Background Notebook Ring Sketch Base Sheet asset */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image 
            src="/signupBG.png" 
            alt="Notebook Backdrop Sheet" 
            fill 
            style={{ objectFit: 'fill' }} 
            priority 
          />
        </div>

        {/* ── LEFT WORKING AREA SECTION ── */}
        <div style={{ position: 'absolute', left: '110px', top: '100px', width: '560px', display: 'flex', flexDirection: 'column', zIndex: 5, gap: '24px' }}>
          
          {/* Main Brand Logo & Title Node */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
           <Link href={user ? "/dashboard" : "/"}>
  <div
    style={{
      fontFamily: "'Caveat', cursive",
      fontSize: "24px",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
    }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2l2.5 5.5H19l-4.8 3.6 1.8 5.9L11 14l-5 2.9 1.8-5.9L3 7.5h5.5z"
        fill="#7c5cbf"
        stroke="#5a3a9f"
        strokeWidth=".8"
      />
    </svg>
    ScribbleForms
  </div>
</Link>
            
            <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '38px', fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
              Welcome! Let's get started 👋
            </h1>
            
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#5a4a30', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Fill in your details below to join the community.</span>
              <svg width="18" height="15" viewBox="0 0 22 18" fill="none" stroke="#7c5cbf" strokeWidth="1.7">
                <path d="M17 3Q22 8 20 14 18 18 14 17" strokeLinecap="round"/>
                <path d="M11 14l3 3 2-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Left illustration asset Box (Absolutely scaled character boy) */}
          <div style={{ position: 'relative', width: '100%', height: '560px', pointerEvents: 'none' }}>
            <Image 
              src="/signupSideCardtrans.png" 
              alt="Mascot illustration scene layout" 
              fill
              style={{ objectFit: 'contain' }} 
              priority
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: FORM NOTEPAD CARD WRAPPER ── */}
        <div style={{ position: 'absolute', right: '80px', top: '150px', width: '660px', height: '680px', zIndex: 6, display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{
              backgroundImage: "url('/signupcard.png')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              // maxWidth: '520px',
              height: '100%',
              padding: '70px 240px 30px 50px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: '32px', fontWeight: 700, color: '#1e1608', margin: '0 0 16px 0' }}>Signup</h1>

            <form onSubmit={onSubmitHandler} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '14px', alignItems: 'flex-start', textAlign: 'left' }}>
              
              {/* Field: Full Name */}
              <div className="scribble-form-field-input" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <label style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 600, color: '#5a4a30', marginBottom: '4px' }}>
                  Your Name
                </label>
                <ScribbleCustomInput
                  {...register('fullName')}
                  type="text"
                  placeholder="Alice Johnson"
                  disabled={signupMut.isPending}
                  containerStyle={{ width: '100%' }}
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#1e1608' }}
                />
                {errors.fullName && (
                  <span style={{ fontFamily: "'Caveat', cursive", color: '#bf3939', fontSize: '13px', marginTop: '2px' }}>
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              {/* Field: Email Address */}
              <div className="scribble-form-field-input" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <label style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 600, color: '#5a4a30', marginBottom: '4px' }}>
                  Email address
                </label>
                <ScribbleCustomInput
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  disabled={signupMut.isPending}
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                      <rect x="2" y="5" width="16" height="11" rx="2" />
                      <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                    </svg>
                  }
                  containerStyle={{ width: '100%' }}
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#1e1608' }}
                />
                {errors.email && (
                  <span style={{ fontFamily: "'Caveat', cursive", color: '#bf3939', fontSize: '13px', marginTop: '2px' }}>
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Field: Password (Special validation rules displayed via placeholder) */}
              <div className="scribble-form-field-input" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <label style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 600, color: '#5a4a30', marginBottom: '4px' }}>
                  Password
                </label>
                <ScribbleCustomInput
                  {...register('password')}
                  // ✅ Variable now exists in scope
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  disabled={signupMut.isPending}
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                      <rect x="5" y="9" width="10" height="9" rx="2" />
                      <path d="M7 9V7a3 3 0 016 0v2" strokeLinecap="round" />
                    </svg>
                  }
                  // ✅ Interactive element to toggle the state variable
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#5a4a30',
                        fontFamily: "'Caveat', cursive",
                        fontSize: '14px'
                      }}
                    >
                      {showPass ? 'hide' : 'show'}
                    </button>
                  }
                  containerStyle={{ width: '100%' }}
                  // ✅ Styling now updates based on state
                  style={{ fontFamily: "'Caveat', cursive", fontSize: showPass ? '18px' : '14px', letterSpacing: showPass ? 'normal' : '3px', color: '#1e1608' }}
                />
                {errors.password && (
                  <span style={{ fontFamily: "'Caveat', cursive", color: '#bf3939', fontSize: '13px', marginTop: '2px' }}>
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Primary Action Button (Displays Loading State during API call) */}
              <ScribbleCustomButton
                type="button"
                onClick={() => setShowGoogleModal(true)}
                bg="#f8de7e"
                disabled={signupMut.isPending}
                style={{ width: '100%', marginTop: '10px', cursor: signupMut.isPending ? 'not-allowed' : 'pointer' }}
              >
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: '22px', fontWeight: 700, height: "38px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',paddingBottom:"13px" }}>
                  {signupMut.isPending ? "Creating account…" : "Create Account"}
                  {!signupMut.isPending && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M4 10h12M12 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </ScribbleCustomButton>

              {/* Divider sketch row asset with 'or' label */}
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '6px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'6\'%3E%3Cpath d=\'M0 3 Q 10 0, 20 3 T 40 3 T 60 3 T 80 3 T 100 3\' fill=\'none\' stroke=\'%239a8060\' stroke-width=\'1.2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', opacity: 0.2 }} />
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: '14px', color: '#9a8060', padding: '0 8px', userSelect: 'none' }}>or</span>
                <div style={{ flex: 1, height: '6px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'6\'%3E%3Cpath d=\'M0 3 Q 10 0, 20 3 T 40 3 T 60 3 T 80 3 T 100 3\' fill=\'none\' stroke=\'%239a8060\' stroke-width=\'1.2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', opacity: 0.2 }} />
              </div>

              {/* Google Auth Option Button linked to Production redirect */}
              <ScribbleButton 
                type="button" 
                // onClick={() => window.location.href = `${API}/auth/google/redirect`}
                onClick={() => setShowGoogleModal(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Caveat', cursive", fontSize: '18px', fontWeight: 600, color: '#1e1608', padding: '8px 16px', cursor: signupMut.isPending ? 'not-allowed' : 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </ScribbleButton>
            </form>

            <div style={{ textAlign: 'center', fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#5a4a30', marginTop: '16px', width: '100%' }}>
              Already a community member? <Link href="/login" style={{ color: '#7c5cbf', fontWeight: 700, textDecoration: 'underline' }}>Login Here →</Link>
            </div>
          </div>
        </div>

        {/* Secure Data Storage Footer Row Disclaimer Notification Panel */}
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#9a8060', display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', bottom: '25px', right: '110px', zIndex: 10 }}>
          <svg width="20" height="22" viewBox="0 0 34 38" fill="none" style={{ flexShrink: 0 }}>
            <rect x="4" y="16" width="26" height="20" rx="5" fill="rgba(200,226,250,0.5)" stroke="#5a4a30" strokeWidth="1.6"/>
            <path d="M9 16V11a8 8 0 0116 0v5" stroke="#5a4a30" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <span>We keep your data locked up tight!</span>
        </div>

      </div>

      {showGoogleModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
    }}
    onClick={() => setShowGoogleModal(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "420px",
        background: "#fffdf7",
        border: "2px solid #2d2416",
        borderRadius: "18px",
        padding: "28px",
        boxShadow: "6px 6px 0px #2d2416",
        textAlign: "center",
        transform: "rotate(-0.5deg)",
      }}
    >
      <div
        style={{
          fontSize: "46px",
          marginBottom: "10px",
        }}
      >
        🚧
      </div>

      <h2
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "34px",
          margin: "0 0 10px 0",
          color: "#2d2416",
        }}
      >
        Google Signup Disabled
      </h2>

      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "15px",
          color: "#5a4a30",
          lineHeight: 1.6,
          marginBottom: "22px",
        }}
      >
        The developer is not accepting Google signups right now.
        <br />
        He joined another hackathon and is making questionable life choices.
      </p>

      <button
        onClick={() => setShowGoogleModal(false)}
        style={{
          background: "#f8de7e",
          border: "2px solid #2d2416",
          borderRadius: "10px",
          padding: "10px 24px",
          cursor: "pointer",
          fontFamily: "'Caveat', cursive",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        Got it ✨
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default SignupPage;