"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, PhoneCall, Bell, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import gsap from "gsap";

export default function RequestPermissionsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Floating animation for the whole container area
            gsap.to(containerRef.current, {
                y: "-=10",
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Staggered floating and glow for individual cards
            cardsRef.current.forEach((card, idx) => {
                if (card) {
                    gsap.to(card, {
                        y: idx % 2 === 0 ? "-=8" : "+=8",
                        x: idx % 2 === 0 ? "+=5" : "-=5",
                        duration: 3 + Math.random(),
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: idx * 0.2
                    });

                    gsap.to(card, {
                        boxShadow: "0 0 30px rgba(212,175,55,0.25)",
                        duration: 2,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut",
                        delay: idx * 0.3
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleRequestPermissions = async () => {
        setIsLoading(true);

        let locationGranted = false;
        let notificationsGranted = false;

        // Helper function to add timeout to promises
        const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
            return Promise.race([
                promise,
                new Promise<T>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                )
            ]);
        };

        // 1. Request GPS (with 5-second timeout)
        try {
            await withTimeout(
                new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        () => {
                            locationGranted = true;
                            resolve(true);
                        },
                        () => {
                            locationGranted = false;
                            resolve(false);
                        }
                    );
                }),
                5000
            );
        } catch (err) {
            console.warn("Location request failed or timed out", err);
            locationGranted = false;
        }

        // 2. Request Notifications (with 5-second timeout)
        try {
            const permission = await withTimeout(
                Notification.requestPermission(),
                5000
            );
            notificationsGranted = permission === "granted";
        } catch (err) {
            console.warn("Notification request failed or timed out", err);
            notificationsGranted = false;
        }

        // 3. Save to DB
        try {
            const response = await fetch("/api/user/save-permissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: locationGranted,
                    notifications: notificationsGranted,
                }),
            });

            if (response.ok) {
                toast.success("Security configuration complete.");
                router.push("/dashboard");
            } else {
                // Even if DB save fails, we proceed to dashboard but might log it
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Save permissions error:", err);
            router.push("/dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const disclosures = [
        {
            icon: <MapPin className="text-[#d4af37]" />,
            title: "GPS Location",
            desc: "We only access your location during a crisis to send it to your guardian and local help.",
        },
        {
            icon: <PhoneCall className="text-[#d4af37]" />,
            title: "Emergency Call",
            desc: "Allows one-tap calling to a support helpline if you are in distress.",
        },
        {
            icon: <Bell className="text-[#d4af37]" />,
            title: "Automated Alerts",
            desc: "Authorizes the app to send emergency messages to your guardian.",
        },
    ];

    return (
        <div className="min-h-screen w-full bg-[#02040a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans p-6 text-center">
            {/* Dynamic Background Aura */}
            <div className="bg-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />

            <div
                ref={containerRef}
                className="relative z-10 w-full max-w-xl p-10 bg-[#050505]/90 rounded-[3rem] border border-amber-500/20 shadow-[0_0_50px_rgba(212,175,55,0.15)] backdrop-blur-3xl"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6 inline-block p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10"
                    >
                        <Shield size={32} className="text-[#d4af37]" />
                    </motion.div>
                    <h1 className="text-3xl font-light tracking-wide text-[#d4af37] mb-3">Safe Haven Setup</h1>
                    <p className="text-sm opacity-60 font-light max-w-md mx-auto leading-relaxed">
                        To keep you safe and connected, Havyn needs a few permissions. Your privacy is our priority.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                    {disclosures.map((item, idx) => (
                        <div
                            key={idx}
                            ref={(el) => { if (el) cardsRef.current[idx] = el; }}
                            className="p-6 bg-black/60 rounded-2xl border border-amber-500/20 backdrop-blur-xl group hover:border-amber-500/40 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                        >
                            <div className="mb-4 inline-block p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 group-hover:scale-110 transition-transform duration-500 group-hover:border-amber-500/30">
                                {item.icon}
                            </div>
                            <h3 className="text-sm font-medium tracking-wider text-amber-100 mb-2">{item.title}</h3>
                            <p className="text-[11px] text-amber-200/40 font-light leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handleRequestPermissions}
                        disabled={isLoading}
                        className="group relative px-10 py-4 bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#d4af37] text-[#05091a] rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <div className="relative z-10 flex items-center gap-2">
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    I Understand, Keep Me Safe
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-[11px] tracking-[0.2em] uppercase opacity-40 hover:opacity-100 transition-opacity"
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </div>
    );
}
