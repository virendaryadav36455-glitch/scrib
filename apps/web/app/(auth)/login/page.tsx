'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from '~/hooks/api/auth'; 
import { ScribbleButton } from '~/components/scribble/ScribbleButton';
import { ScribbleCustomButton, ScribbleCustomInput } from '~/components/scribble/ScribInput';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";

const loginValidationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginValidationSchema>;

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function LoginPage() {
  const loginMut = useLogin();
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  // Base scale state variable
  const [scaleFactor, setScaleFactor] = useState(0.90);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // ── FIXED RESPONSIVE ASPECT MATRICES ──
      // Tracks the ideal ratio using 1440x900 base canvas guides
      let targetScale = (width / 1440) * 1.02;
      if (targetScale > 1.05) targetScale = 1.05;
      if (targetScale < 0.65) targetScale = 0.65; // Extended floor limit lets it scale smoothly down on tabs/small screens

      if (height < 900) {
        const heightScale = (height / 900) * 1.02; 
        if (heightScale < targetScale) {
          targetScale = Math.max(0.65, heightScale); 
        }
      }
      setScaleFactor(targetScale);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidationSchema)
  });

  const onSubmit = handleSubmit((data) => {
    loginMut.mutate(data);
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
        // @ts-ignore
        '--global-scale': scaleFactor
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Global Notebook Base Frame Wrapper */}
      <div style={{
        display: 'flex',
        width: '1440px', // Locked pixel baseline context guarantees components stick exactly where they belong
        height: '900px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'center center',
        transition: 'transform 0.05s linear'
      }}>
        
        {/* Background Notebook Base Backdrop Layer Asset */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image 
            src="/loginBG.png" 
            alt="Hand-drawn open notebook ring backdrop sketch" 
            fill 
            style={{ objectFit: 'fill' }} 
            priority 
          />
        </div>

        {/* Left Side Column Workspace Panel */}
        <div style={{
          flex: '1.15',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px 20px 20px 80px',
          zIndex: 1,
          position: 'relative'
        }}>
          {/* Brand Header Label */}
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'calc(26px * var(--global-scale))',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            marginTop: "5px"
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 2l2.5 5.5H19l-4.8 3.6 1.8 5.9L11 14l-5 2.9 1.8-5.9L3 7.5h5.5z" fill="#7c5cbf" stroke="#5a3a9f" strokeWidth=".8"/>
            </svg>
            ScribbleForms
          </div>
          
          <h1 style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'calc(40px * var(--global-scale))',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 0 4px 0'
          }}>Welcome back, Creator! 👋</h1>
          
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'calc(20px * var(--global-scale))',
            color: '#5a4a30',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Login to continue building <span style={{ textDecoration: 'underline', textDecorationStyle: 'wavy', textDecorationColor: '#7c5cbf', textUnderlineOffset: '3px' }}>amazing</span> forms.
            <svg width="18" height="15" viewBox="0 0 22 18" fill="none" stroke="#7c5cbf" strokeWidth="1.7">
              <path d="M17 3Q22 8 20 14 18 18 14 17" strokeLinecap="round"/>
              <path d="M11 14l3 3 2-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>

          {/* Core Hand Drawn Content Form Frame Asset Card Layer */}
          <div style={{
            backgroundImage: "url('/logininnerborder.png')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            padding: '45px 40px 35px 40px',
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            height: "600px",
            boxSizing: 'border-box'
          }}>
            
            <form onSubmit={onSubmit}>
              {/* Username/Email Interactive Field Wrapper */}
              <div style={{ marginBottom: '16px' ,width:"400px" , marginLeft:"70px" , marginTop:"60px"}}>
                <label
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'calc(18px * var(--global-scale))',
                    color: '#5a4a30',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Email address
                </label>

                <ScribbleCustomInput
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  disabled={loginMut.isPending}
                  leftIcon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="5" width="16" height="11" rx="2" />
                      <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                    </svg>
                  }
                  containerStyle={{
                    width: '100%',
                  }}
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'calc(20px * var(--global-scale))',
                    color: '#1e1608',
                  }}
                />

                {errors.email && (
                  <span
                    style={{
                      fontFamily: "'Caveat', cursive",
                      color: '#bf3939',
                      fontSize: 'calc(14px * var(--global-scale))',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Interactive Field Wrapper */}
<div
  style={{
    marginBottom: "18px",
    width: "400px",
    marginLeft: "70px",
    marginTop: "20px",
  }}
>
  <label
    style={{
      fontFamily: "'Caveat', cursive",
      fontSize: "calc(18px * var(--global-scale))",
      color: "#5a4a30",
      display: "block",
      marginBottom: "6px",
    }}
  >
    Password
  </label>

  <ScribbleCustomInput
    {...register("password")}
    type={showPass ? "text" : "password"}
    placeholder="••••••••"
    disabled={loginMut.isPending}
    leftIcon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="5" y="9" width="10" height="9" rx="2" />
        <path
          d="M7 9V7a3 3 0 016 0v2"
          strokeLinecap="round"
        />
      </svg>
    }
    rightIcon={
      <button
        type="button"
        onClick={() => setShowPass(!showPass)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7c5cbf",
          padding: "0",
        }}
      >
        {showPass ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    }
    style={{
      fontFamily: "'Caveat', cursive",
      fontSize: showPass
        ? "calc(20px * var(--global-scale))"
        : "calc(15px * var(--global-scale))",
      letterSpacing: showPass ? "normal" : "4px",
    }}
  />

  {errors.password && (
    <span
      style={{
        fontFamily: "'Caveat', cursive",
        color: "#bf3939",
        fontSize: "calc(14px * var(--global-scale))",
        marginTop: "4px",
        display: "block",
      }}
    >
      {errors.password.message}
    </span>
  )}
</div>

              {/* Utility Form Configuration Row Block */}
              {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 12px',marginLeft:"70px" ,width:"400px"}}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Caveat', cursive", fontSize: 'calc(18px * var(--global-scale))', color: '#5a4a30', cursor: 'pointer', userSelect: 'none' }} onClick={() => !loginMut.isPending && setRemember(!remember)}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    {remember ? (
                      <>
                        <path d="M2 10Q2 2.5 10 2 17.5 2.5 18 10 17.5 17.5 10 18 2.5 17.5 2 10Z" fill="#cff0d0" stroke="#2d8a3e" strokeWidth="1.4"/>
                        <path d="M6 10l3 3 5-5" stroke="#2d8a3e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      <path d="M2 10Q2 2.5 10 2 17.5 2.5 18 10 17.5 17.5 10 18 2.5 17.5 2 10Z" fill="none" stroke="#9a8060" strokeWidth="1.4"/>
                    )}
                  </svg>
                  Remember me
                </label>
                <Link href="/forgot-password" style={{ fontFamily: "'Caveat', cursive", fontSize: 'calc(18px * var(--global-scale))', color: '#7c5cbf', textDecoration: 'underline' }}>Forgot password?</Link>
              </div> */}

              {/* Primary Action Yellow Scribble Dashboard Login Button Block */}
              <ScribbleCustomButton
                type="submit"
                bg="#f8de7e"
                disabled={loginMut.isPending}
                style={{
                  width: '400px',
                  marginTop: '10px',
                  marginLeft:"70px",
                  cursor: loginMut.isPending ? 'not-allowed' : 'pointer',
                  opacity: loginMut.isPending ? 0.8 : 1
                }}
              >
                <span
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'calc(24px * var(--global-scale))',
                    fontWeight: 700,
                    height:"40px",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom:"12px"
                  }}
                >
                  {loginMut.isPending ? "Signing in..." : "Login to Dashboard"}

                  {!loginMut.isPending && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M4 10h12M12 5l5 5-5 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </ScribbleCustomButton>

              {/* Wavy Horizontal Splitter Row Decoration */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', width: '400px', marginLeft: '70px' }}>
                <div style={{ flex: 1, height: '6px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'6\'%3E%3Cpath d=\'M0 3 Q 10 0, 20 3 T 40 3 T 60 3 T 80 3 T 100 3\' fill=\'none\' stroke=\'%239a8060\' stroke-width=\'1.2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', opacity: 0.3 }}></div>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 'calc(16px * var(--global-scale))', color: '#9a8060', padding: '0 10px' }}>or</span>
                <div style={{ flex: 1, height: '6px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'6\'%3E%3Cpath d=\'M0 3 Q 10 0, 20 3 T 40 3 T 60 3 T 80 3 T 100 3\' fill=\'none\' stroke=\'%239a8060\' stroke-width=\'1.2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat-x', opacity: 0.3 }}></div>
              </div>

              {/* White Scribbly Google Auth Connector Button linking back directly to API Redirect */}
              <ScribbleButton 
                type="button" 
                // onClick={() => window.location.href = `${API}/auth/google/redirect`}
                onClick={() => setShowGoogleModal(true)}
                style={{
                  width: '400px',
                  marginLeft:"70px",
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: "'Caveat', cursive",
                  fontSize: 'calc(20px * var(--global-scale))',
                  fontWeight: 600,
                  color: '#1e1608',
                  background: 'none',
                  border: 'none',
                  padding: '9px 16px',
                  cursor: loginMut.isPending ? 'not-allowed' : 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
  <path
    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    fill="#4285F4"
  />
  <path
    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    fill="#34A853"
  />
  <path
    d="M5.84 14.09A7.96 7.96 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
    fill="#FBBC05"
  />
  <path
    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    fill="#EA4335"
  />
</svg>
                <span style={{ position: 'relative', zIndex: 2, fontSize: 'calc(20px * var(--global-scale))' }}>Continue with Google</span>
              </ScribbleButton>

            </form>

            <div style={{ textAlign: 'center', fontFamily: "'Caveat', cursive", fontSize: 'calc(18px * var(--global-scale))', color: '#5a4a30', marginTop: '24px' }}>
              Don't have an account? <Link href="/signup" style={{ color: '#7c5cbf', fontWeight: 700, textDecoration: 'underline' }}>Sign up here</Link>
            </div>
          </div>
        </div>

        {/* Right Side Column Space Layout Container */}
        <div style={{
          flex: '0.85',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '40px 40px 40px 20px',
          zIndex: 1,
          position: 'relative'
        }}>
          
          {/* Floating Character Boy Mascot Section Element Component Layer */}
          <div style={{ 
            position: 'absolute', 
            top: '4%', 
            right: '20%', 
            width: '90%',
            maxWidth: '600px', 
            height: '85%',
            maxHeight: '700px',
            pointerEvents: 'none'
          }}>
            <Image 
              src="/login boy.png" 
              alt="Hand-drawn open notebook creator character landscape profile" 
              fill
              style={{ objectFit: 'contain' }} 
              priority
            />
          </div>

          {/* Bottom Secure Data Storage Footer Row Disclaimer Notification Panel */}
          <div style={{ 
            fontFamily: "'Caveat', cursive", 
            fontSize: 'calc(17px * var(--global-scale))', 
            color: '#9a8060', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            position: 'absolute',
            bottom: '6%',
            right: '12%'
          }}>
            <svg width="20" height="22" viewBox="0 0 34 38" fill="none" style={{ flexShrink: 0 }}>
              <rect x="4" y="16" width="26" height="20" rx="5" fill="rgba(200,226,250,0.5)" stroke="#5a4a30" strokeWidth="1.6"/>
              <path d="M9 16V11a8 8 0 0116 0v5" stroke="#5a4a30" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span>We keep your data locked up tight!</span>
          </div>

        </div>

      </div>

{showGoogleModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
    onClick={() => setShowGoogleModal(false)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "420px",
        backgroundColor: "#fffdf7",
        border: "2px solid #2d2416",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "6px 6px 0px #2d2416",
        textAlign: "center",
        transform: "rotate(-0.5deg)",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        🚧
      </div>

      <h2
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "32px",
          margin: "0 0 12px 0",
          color: "#2d2416",
        }}
      >
        Google Login Disabled
      </h2>

      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "15px",
          color: "#5a4a30",
          lineHeight: 1.6,
          marginBottom: "16px",
        }}
      >
        The developer is not accepting Google logins right now.
        <br />
        He's probably busy fighting bugs or breaking production again.
      </p>

      {/* --- Credentials Section Added Here --- */}
      <div
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: "14px",
          backgroundColor: "#f4ede2",
          border: "2px dashed #2d2416",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "22px",
          textAlign: "left",
          color: "#2d2416",
        }}
      >
        <div style={{ marginBottom: "4px" }}>
          <strong>Email:</strong> demo@scribbleforms.dev
        </div>
        <div>
          <strong>Password:</strong> Demo@1234
        </div>
      </div>
      {/* ------------------------------------- */}

      <button
        onClick={() => setShowGoogleModal(false)}
        style={{
          backgroundColor: "#f8de7e",
          border: "2px solid #2d2416",
          borderRadius: "10px",
          padding: "10px 24px",
          cursor: "pointer",
          fontFamily: "'Caveat', cursive",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        Got it
      </button>
    </div>
  </div>
)}
    </div>
  );
}