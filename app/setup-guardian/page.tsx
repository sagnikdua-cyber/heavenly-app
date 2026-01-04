"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Mail, Lock, ArrowRight, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import Tooltip from "@/components/ui/Tooltip";
import toast from "react-hot-toast";

// Schema where fields are optional unless one is provided
const guardianSchema = z.object({
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    code: z.string().optional().or(z.literal("")),
}).refine((data) => {
    // If email is provided and not empty, code must be provided
    if (data.email && data.email.length > 0 && (!data.code || data.code.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Password is required if an email is provided",
    path: ["code"],
});

type GuardianFormValues = z.infer<typeof guardianSchema>;

export default function SetupGuardianPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GuardianFormValues>({
        resolver: zodResolver(guardianSchema),
        defaultValues: {
            email: "",
            code: "",
        },
    });

    const onSubmit = async (data: GuardianFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/user/setup-guardian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.code,
                }),
            });

            if (response.ok) {
                toast.success("Guardian information saved securely.");
                setTimeout(() => router.push("/request-permissions"), 1000);
            } else {
                const result = await response.json();
                setError(result.error || "Failed to save guardian information");
            }
        } catch (err) {
            console.error("Guardian Save Error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        setIsLoading(true);
        setError(null);

        toast("You can always add a guardian later in Settings", {
            icon: "ℹ️",
            duration: 3000,
        });

        try {
            await fetch("/api/user/setup-guardian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skip: true }),
            });

            // Give toast time to show
            setTimeout(() => router.push("/request-permissions"), 2000);
        } catch (err) {
            console.error("Skip Error:", err);
            setTimeout(() => router.push("/request-permissions"), 2000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#05091a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 bg-[#0a0e27]/90 rounded-3xl border border-amber-500/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-6 inline-block p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10"
                    >
                        <Shield size={32} className="text-[#d4af37]" />
                    </motion.div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <h1 className="text-2xl font-light tracking-wide text-[#d4af37]">Your Support Circle</h1>
                        <Tooltip content="We never share your regular conversations with your guardian—only specific safety alerts.">
                            <Info size={16} className="text-amber-500/40 hover:text-amber-500 transition-colors cursor-pointer" />
                        </Tooltip>
                    </div>
                    <p className="text-xs opacity-60 font-light leading-relaxed px-4">
                        Adding a guardian is optional. We only reach out if we&apos;re worried about your safety.
                    </p>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] text-red-400 mt-4 bg-red-500/5 py-2 rounded-lg border border-red-500/10"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-amber-500/50">Guardian Email</label>
                            {errors.email && (
                                <span className="text-[10px] text-red-400 font-light">{errors.email.message}</span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                {...register("email")}
                                type="email"
                                className={`w-full px-12 py-3.5 bg-[#05091a]/50 border ${errors.email ? "border-red-500/30" : "border-amber-900/20"
                                    } rounded-2xl focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 text-amber-100 placeholder-amber-900/30 transition-all duration-300 font-light`}
                                placeholder="guardian@example.com"
                            />
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-amber-500/50">Password</label>
                            {errors.code && (
                                <span className="text-[10px] text-red-400 font-light">{errors.code.message}</span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                {...register("code")}
                                type="password"
                                className={`w-full px-12 py-3.5 bg-[#05091a]/50 border ${errors.code ? "border-red-500/30" : "border-amber-900/20"
                                    } rounded-2xl focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 text-amber-100 placeholder-amber-900/30 transition-all duration-300 font-light`}
                                placeholder="Password"
                            />
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-900/40" />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(212,175,55,0.3)" }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full py-4 mt-4 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-[#0a0e27] font-semibold rounded-2xl shadow-[0_4px_15px_rgba(212,175,55,0.15)] transition-all duration-300 flex items-center justify-center gap-2 ${isLoading ? "opacity-80 cursor-not-allowed" : ""
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span>Save & Continue</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSkip}
                        disabled={isLoading}
                        className="text-[11px] tracking-[0.2em] text-amber-500/40 uppercase hover:text-amber-400 transition-colors duration-300 disabled:opacity-50"
                    >
                        Skip for now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
