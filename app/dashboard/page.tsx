"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [isExiting, setIsExiting] = useState(false);
    const router = useRouter();

    const handleStartChat = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.push("/chatroom");
        }, 500);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#05091a] via-[#0a0e27] to-[#05091a] text-amber-100 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Calming Zen Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.03, 0.06, 0.03],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.04, 0.08, 0.04],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px]"
                />
            </div>

            <AnimatePresence>
                {!isExiting && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                        className="relative z-10 flex flex-col items-center text-center px-6"
                    >
                        {/* "Meet Havyn" Text */}
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-2xl md:text-3xl font-extralight tracking-[0.3em] text-[#d4af37] mb-12 uppercase"
                        >
                            Meet Havyn
                        </motion.h1>

                        {/* Avatar Circle */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                            className="relative mb-10"
                        >
                            {/* Pulsing Glow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 bg-gradient-to-br from-[#d4af37] to-amber-500 rounded-full blur-xl"
                            />

                            {/* Main Circle */}
                            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#0a0e27] to-[#05091a] border-2 border-[#d4af37]/30 shadow-[0_0_40px_rgba(212,175,55,0.2)] flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Bot size={64} className="text-[#d4af37]" strokeWidth={1.5} />
                                </motion.div>
                            </div>
                        </motion.div>

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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartChat}
                            className="group relative px-12 py-5 bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#d4af37] text-[#05091a] rounded-full font-semibold text-base md:text-lg tracking-wide overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)]"
                        >
                            <span className="relative z-10">Yup my friend! 😊</span>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
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
