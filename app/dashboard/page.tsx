"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function DashboardPage() {
    const [isExiting, setIsExiting] = useState(false);
    const router = useRouter();
    const avatarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Floating animation for the avatar
            gsap.to(avatarRef.current, {
                y: "-=20",
                rotation: 5,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Gentle float for the whole content
            gsap.to(contentRef.current, {
                y: "-=10",
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 0.5
            });
        }, contentRef);

        return () => ctx.revert();
    }, []);

    const handleStartChat = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push("/chatroom");
        }, 500);
    };

    return (
        <div className="min-h-screen w-full bg-[#02040a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Dynamic Background Aura */}
            <div className="bg-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />

            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        key="dashboard-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        ref={contentRef}
                        className="relative z-10 w-full max-w-2xl p-12 bg-[#050505]/90 rounded-[3rem] border border-amber-500/20 shadow-[0_0_60px_rgba(212,175,55,0.15)] backdrop-blur-3xl text-center"
                    >
                        {/* Avatar Section */}
                        <div className="mb-10 relative inline-block">
                            {/* Pulsing Glow */}
                            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
                            {/* Main Avatar Circle */}
                            <div
                                ref={avatarRef}
                                className="relative w-32 h-32 rounded-full border-2 border-[#d4af37]/30 p-1 bg-[#0a0e27]"
                            >
                                <img
                                    src="/havyn-avatar.png" // Assuming you have an avatar image
                                    alt="Havyn"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#050505] shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                        </div>

                        {/* "Meet Havyn" Text */}
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-2xl md:text-3xl font-extralight tracking-[0.3em] text-[#d4af37] mb-4 uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                        >
                            Meet Havyn
                        </motion.h1>

                        {/* "Havyn is here to help you" Text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="text-lg md:text-xl font-light text-amber-200/90 mb-4"
                        >
                            Havyn is here to help you
                        </motion.p>

                        {/* "Wanna talk to me?" Text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="text-sm md:text-base font-light text-amber-500/60 italic mb-12"
                        >
                            Wanna talk to me?
                        </motion.p>

                        {/* CTA Button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212,175,55,0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartChat}
                            className="group relative px-12 py-5 bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#d4af37] text-[#05091a] rounded-full font-bold text-base md:text-lg tracking-widest uppercase overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)]"
                        >
                            <span className="relative z-10">Yup my friend! 😊</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </motion.button>

                        {/* Subtle hint text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="mt-8 text-[10px] text-amber-500/30 tracking-widest uppercase"
                        >
                            Your safe space awaits
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
