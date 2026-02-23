"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import gsap from "gsap";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Floating animation for the card
      gsap.to(cardRef.current, {
        y: "-=15",
        x: "+=5",
        rotation: 1,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Subtle glow pulse
      gsap.to(cardRef.current, {
        boxShadow: "0 0 50px rgba(212,175,55,0.4)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
      } else {
        // Redirect to setup-guardian on success
        window.location.href = "/setup-guardian";
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Aura */}
      <div className="bg-aura absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 pointer-events-none" />

      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md p-10 bg-[#050505]/90 rounded-[2.5rem] border border-amber-500/20 shadow-[0_0_40px_rgba(212,175,55,0.2)] backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block"
          >
            <h1 className="text-3xl font-light tracking-[0.2em] text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">HEAVENLY</h1>
          </motion.div>
          <p className="text-sm opacity-60 font-light tracking-wide">Welcome back, take a deep breath.</p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center"
          >
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-amber-500/50">Email Address</label>
              {errors.email && (
                <span className="text-[10px] text-red-400 font-light">{errors.email.message}</span>
              )}
            </div>
            <input
              {...register("email")}
              type="email"
              className={`w-full px-5 py-3.5 bg-black/60 border ${errors.email ? "border-red-500/30" : "border-amber-900/30"
                } rounded-2xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-amber-100 placeholder-amber-900/30 transition-all duration-300 font-light`}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-amber-500/50">Password</label>
              {errors.password && (
                <span className="text-[10px] text-red-400 font-light">{errors.password.message}</span>
              )}
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full px-5 py-3.5 bg-black/60 border ${errors.password ? "border-red-500/30" : "border-amber-900/30"
                  } rounded-2xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-amber-100 placeholder-amber-900/30 transition-all duration-300 font-light`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-900/40 hover:text-amber-500/60 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                <span>Entering...</span>
              </>
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-900/20 to-transparent" />
          <div className="flex justify-between w-full text-[11px] tracking-wider text-amber-500/40 uppercase">
            <Link href="#" className="hover:text-amber-400 transition-colors duration-300">Create account</Link>
            <Link href="#" className="hover:text-amber-400 transition-colors duration-300">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
