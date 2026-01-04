"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";
import { useState } from "react";

interface HelpButtonProps {
    onDismiss?: () => void;
}

export default function HelpButton({ onDismiss }: HelpButtonProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleCall = () => {
        window.location.href = "tel:14416";
    };

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
                >
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-4 border-2 border-red-400">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="flex items-center gap-4">
                            {/* Pulsing phone icon */}
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 bg-white rounded-full blur-md"
                                />
                                <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <Phone size={24} className="text-red-600" />
                                </div>
                            </div>

                            {/* Text and button */}
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm mb-2">
                                    Need immediate help?
                                </p>
                                <button
                                    onClick={handleCall}
                                    className="w-full bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-50 active:scale-95 transition-all shadow-lg"
                                >
                                    Connect to Help (14416)
                                </button>
                            </div>
                        </div>

                        {/* Helper text */}
                        <p className="text-white/80 text-xs mt-3 text-center">
                            24/7 National Suicide Prevention Helpline
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
