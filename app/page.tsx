"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          // Start floating animation for button after entrance
          gsap.to(buttonRef.current, {
            y: "-=15",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });

          // Start continuous particle emission
          startParticles();
        }
      });

      // Initial state
      gsap.set(robotRef.current, { y: -600, rotation: -360, opacity: 0, scale: 0.5 });
      gsap.set(titleRef.current, { opacity: 0, scale: 0.8, y: 30 });
      gsap.set(buttonRef.current, { opacity: 0, y: 100 });

      // 1. Robot rolls in from top
      tl.to(robotRef.current, {
        y: 600, // Move to bottom area for the "hit"
        rotation: 360,
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: "bounce.out",
      })
        // 2. Move up to center
        .to(robotRef.current, {
          y: 0,
          rotation: 0,
          duration: 1.2,
          ease: "power3.inOut",
        })
        // 3. Reveal Title and Button
        .to(titleRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
        }, "-=0.4")
        .to(buttonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }, "-=0.6");

      // Background pulse animation
      gsap.to(".bg-aura", {
        scale: 1.3,
        opacity: 0.12,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Particle system logic
      function startParticles() {
        if (!particlesRef.current) return;

        const createParticle = () => {
          const particle = document.createElement("div");
          particle.className = "absolute w-1 h-1 bg-amber-400 rounded-sm opacity-0";
          particlesRef.current?.appendChild(particle);

          // Random position on the circumference
          const angle = Math.random() * Math.PI * 2;
          const radius = 160; // Slightly larger than robot radius
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          gsap.set(particle, { x, y, scale: Math.random() * 0.5 + 0.5 });

          // Animate particle moving outwards and fading
          gsap.to(particle, {
            x: x + Math.cos(angle) * 100,
            y: y + Math.sin(angle) * 100,
            opacity: 0.6,
            duration: 1 + Math.random(),
            ease: "power1.out",
            onComplete: () => {
              gsap.to(particle, {
                opacity: 0,
                scale: 0,
                duration: 0.5,
                onComplete: () => particle.remove()
              });
            }
          });
        };

        // Emit particles more densely
        setInterval(createParticle, 30); // Faster emission for "more in numbers"
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="h-screen w-screen relative flex flex-col items-center justify-center bg-[#02040a] overflow-hidden font-sans">
      {/* Dynamic Background Aura */}
      <div className="bg-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Robot Face Container with Particle Layer */}
        <div className="relative">
          {/* Particles Container */}
          <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />

          {/* Animated Robot Face with Theme-Specific Styling */}
          <div
            ref={robotRef}
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full p-2 bg-gradient-to-tr from-amber-500/30 via-amber-200/10 to-transparent shadow-[0_0_100px_rgba(212,175,55,0.4)]"
          >
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/40 relative group bg-[#02040a]">
              <Image
                src="/robot-face.jpg"
                alt="Havyn"
                fill
                className="object-cover scale-110 filter saturate-[1.2] brightness-[1.1]"
                priority
              />

              {/* Enhanced Robotic Face Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                {/* Basketball-style Curvy Strips */}
                <div className="absolute inset-0 z-10 opacity-30">
                  {/* Vertical Curvy Strips (Outer) */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <path d="M 30,0 Q 15,50 30,100" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <path d="M 70,0 Q 85,50 70,100" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    {/* Horizontal Curvy Center (avoiding eyes/mouth) */}
                    <path d="M 0,50 Q 50,35 100,50" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
                  </svg>
                </div>

                {/* Larger Robotic Eyes */}
                <div className="flex gap-16 mb-8 z-20">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-400 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.95)] animate-pulse relative">
                    <div className="absolute inset-2.5 border-2 border-amber-900/30 rounded-full" />
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-400 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.95)] animate-pulse relative">
                    <div className="absolute inset-2.5 border-2 border-amber-900/30 rounded-full" />
                  </div>
                </div>

                {/* Curvy Box-style Digital Mouth (Smile) */}
                <div className="z-20 relative">
                  <div className="px-8 py-3 border-2 border-amber-400/80 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.3)] relative overflow-hidden"
                    style={{
                      borderRadius: "40% 40% 100% 100% / 20% 20% 100% 100%",
                      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" // Placeholder for specialized shape if needed
                    }}>
                    <div className="w-20 h-5 md:w-28 md:h-8 flex justify-between items-end px-2 pb-1">
                      <div className="w-1.5 h-3/4 bg-amber-400/80 rounded-full animate-pulse" />
                      <div className="w-1.5 h-full bg-amber-400/80 rounded-full" />
                      <div className="w-1.5 h-1/2 bg-amber-400/80 rounded-full animate-pulse" />
                      <div className="w-1.5 h-full bg-amber-400/80 rounded-full" />
                      <div className="w-1.5 h-3/4 bg-amber-400/80 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Small Green LEDs in 2 Vertical Lines */}
                <div className="absolute inset-0 z-30 flex justify-between items-center px-8 md:px-12 pointer-events-none">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
                  </div>
                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                  </div>
                </div>
              </div>

              {/* Tint overlay for better integration */}
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-soft-light" />
            </div>

            {/* Double Glowing Ring for extra depth */}
            <div className="absolute inset-[-4px] rounded-full border border-amber-500/30 blur-[2px] animate-pulse" />
            <div className="absolute inset-[-8px] rounded-full border border-amber-500/10 blur-[4px]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mt-12 mb-2 tracking-[0.2em] relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-amber-200 to-amber-600">
            HEAVENLY
          </span>
          <div className="absolute -inset-x-8 -inset-y-4 bg-amber-500/5 blur-3xl rounded-full" />
        </h1>

        <p className="text-amber-200/60 font-light tracking-[0.4em] mb-12 uppercase text-sm">
          Your Digital Sanctuary
        </p>

        <div ref={buttonRef} className="relative group overflow-hidden rounded-full p-[2px]">
          {/* Animated Button Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/50 via-amber-200/80 to-amber-500/50 group-hover:via-amber-400 transition-all duration-500 rounded-full" />

          <Link
            href="/login"
            className="flex items-center justify-center px-12 py-5 bg-black rounded-full transition-all duration-300 relative"
          >
            <span className="text-amber-100 font-black tracking-[0.8em] text-lg uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] group-hover:tracking-[1em] transition-all duration-500 font-mono">
              ENTER
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-4 bg-amber-500/5 blur-[20px] rounded-[100%]" />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[9px] text-amber-500/30 tracking-[0.5em] uppercase font-extralight opacity-50">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/30" />
        <span>Breathe In. Let Go.</span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/30" />
      </div>
    </div>
  );
}
