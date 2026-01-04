"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, PhoneCall, Bell, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RequestPermissionsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
        <div className="min-h-screen w-full bg-[#05091a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans p-6">
            {/* Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl text-center"
            >
                <div className="mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 inline-block p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    >
                        <Shield size={40} className="text-[#d4af37]" />
                    </motion.div>
                    <h1 className="text-3xl font-extralight tracking-[0.2em] text-[#d4af37] mb-4 uppercase">Security Permissions</h1>
                    <p className="text-sm opacity-60 font-light max-w-md mx-auto leading-relaxed">
                        To provide the protection promised, Heavenly requires access to these specific system functions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                    {disclosures.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
                            className="p-6 bg-[#0a0e27]/80 rounded-2xl border border-amber-500/10 backdrop-blur-xl group hover:border-amber-500/30 transition-all duration-300"
                        >
                            <div className="mb-4 inline-block p-3 bg-amber-500/5 rounded-xl border border-amber-500/5 group-hover:scale-110 transition-transform duration-500">
                                {item.icon}
                            </div>
                            <h3 className="text-sm font-medium tracking-wider text-amber-200 mb-2">{item.title}</h3>
                            <p className="text-[11px] opacity-60 font-light leading-relaxed">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handleRequestPermissions}
                        disabled={isLoading}
                        className="group relative px-10 py-4 bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#d4af37] text-[#05091a] rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
            </motion.div>
        </div>
    );
}
