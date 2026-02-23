"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, Shield, Clock, Timer, Settings, LogOut, Bot } from "lucide-react";
import { signOut } from "next-auth/react";
import { monitorSafety } from "@/lib/safety-monitor";
import { triggerEmergencyProtocol } from "@/lib/emergency-protocol";
import HelpButton from "@/components/HelpButton";

interface Message {
    id: string;
    text: string;
    sender: "user" | "havyn";
    timestamp: Date;
}

export default function ChatroomPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showRateLimit, setShowRateLimit] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [showHelpButton, setShowHelpButton] = useState(false);
    const [isFirstInteraction, setIsFirstInteraction] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showRateLimit && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setShowRateLimit(false);
        }
        return () => clearInterval(timer);
    }, [showRateLimit, countdown]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ALL HOOKS MUST BE BEFORE CONDITIONAL RETURNS
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Show loading while checking authentication
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Don't render chatroom if not authenticated
    if (!session) {
        return null;
    }

    const getHavynResponseFromGrok = async (userMessage: string): Promise<string> => {
        try {
            console.log('[CHATROOM] ===== STARTING API CALL =====');
            console.log('[CHATROOM] Message:', userMessage);
            console.log('[CHATROOM] Session exists:', !!session);

            console.log('[CHATROOM] Fetching from /api/chat/grok...');
            const response = await fetch("/api/chat/grok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages,
                }),
            });

            console.log('[CHATROOM] API response status:', response.status);
            console.log('[CHATROOM] API response ok:', response.ok);

            if (response.status === 429) {
                setShowRateLimit(true);
                setCountdown(60);
                return "Wait a minute buddy, I will be here for u very soon";
            }

            if (!response.ok) {
                console.error('[CHATROOM] API returned error status:', response.status);
                const errorText = await response.text();
                console.error('[CHATROOM] Error response:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('[CHATROOM] API response data:', data);
            console.log('[CHATROOM] Response text:', data.response);

            return data.response || "I'm here for you, friend! 💙 Tell me more about what's on your mind. ✨";
        } catch (error) {
            console.error("[CHATROOM] ===== ERROR =====");
            console.error("[CHATROOM] Error details:", error);
            console.error("[CHATROOM] Error message:", (error as Error).message);
            return "I'm here with you, bestie! 🫂 I'm having a little trouble right now, but I'm still listening. Tell me what's on your heart? 💙";
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessageText = inputValue;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: userMessageText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");

        // Monitor for crisis keywords
        const safetyCheck = monitorSafety(userMessageText);

        // Trigger emergency protocol if crisis detected
        if (safetyCheck.isCrisis && session?.user) {
            triggerEmergencyProtocol({
                userId: (session.user as any).id || session.user.email || "unknown",
                message: userMessageText,
                severity: safetyCheck.severity!,
                detectedKeywords: safetyCheck.detectedKeywords,
                onHelpButtonNeeded: () => setShowHelpButton(true),
            });
        }

        // Get Havyn's response from Grok API
        setIsTyping(true);

        try {
            // Always get response from Grok API (it has crisis handling in system prompt)
            const havynResponse = await getHavynResponseFromGrok(userMessageText);

            // Simulate realistic typing delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            const havynMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: havynResponse,
                sender: "havyn",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, havynMessage]);
            setIsTyping(false);
            setIsFirstInteraction(false);
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f2f1ec] text-[#2c3e50] font-sans overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 bg-[#004b6d] text-white shadow-md z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 shadow-lg">
                            <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-medium tracking-tight leading-tight">Havyn</h1>
                        <p className="text-[10px] opacity-70 uppercase tracking-widest mt-0.5">Your AI Companion</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="text-[11px] font-medium opacity-90 tracking-wide uppercase">Online</span>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                        <Bot size={48} className="text-[#004b6d]" />
                        <p className="text-lg font-light tracking-wide italic">"Every session is a new chapter in your sanctuary."</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400`}
                        >
                            {msg.sender === "havyn" && (
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-gray-100 flex-shrink-0 mt-1 shadow-sm">
                                    <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] md:max-w-[65%] px-6 py-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed ${msg.sender === "user"
                                    ? "bg-[#a9eaea] text-[#004b6d] rounded-tr-none"
                                    : "bg-gradient-to-r from-[#4299e1] to-[#a855f7] text-white rounded-tl-none font-medium"
                                    }`}
                            >
                                {msg.text}
                                {msg.sender === "havyn" && index === messages.length - 1 && <span className="ml-2">✨</span>}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="flex justify-start items-start gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-gray-100 flex-shrink-0 mt-1 shadow-sm">
                            <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white border border-gray-100 px-6 py-4 rounded-[1.5rem] rounded-tl-none shadow-sm flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-duration:0.8s]" />
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="p-10 pt-6 pb-8 bg-[#004b6d] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="max-w-5xl mx-auto flex items-center gap-4 relative z-10"
                >
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-white/40 focus:ring-0 transition-all text-white placeholder-white/40 text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className={`p-4 rounded-full transition-all duration-300 ${inputValue.trim() && !isTyping ? "bg-[#a9eaea] text-[#004b6d] shadow-[0_0_20px_rgba(169,234,234,0.3)] hover:scale-110 active:scale-95" : "bg-white/5 text-white/20"
                            }`}
                    >
                        <Send size={22} className={inputValue.trim() && !isTyping ? "translate-x-0.5" : ""} />
                    </button>
                </form>

                <div className="text-center mt-6 text-[11px] text-white/40 tracking-wide font-light relative z-10">
                    Havyn uses AI to provide support. Your conversations are private and secure.
                </div>
            </footer>

            {/* Help Button - Shows when crisis detected and no guardian */}
            {showHelpButton && (
                <HelpButton onDismiss={() => setShowHelpButton(false)} />
            )}

            {/* Rate Limit Modal */}
            <AnimatePresence>
                {showRateLimit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white border border-gray-100 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <Timer className="w-10 h-10 text-[#004b6d] relative z-10" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                                Pause for Peace
                            </h2>

                            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                                I'm soaking in your words, buddy. Just a tiny moment for me to catch my breath!
                            </p>

                            <div className="bg-gray-50 border border-gray-100 rounded-2xl py-6 px-8 mb-6">
                                <span className="text-4xl font-bold font-mono text-[#004b6d]">
                                    00:{countdown < 10 ? `0${countdown}` : countdown}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowRateLimit(false)}
                                className="w-full py-4 bg-[#004b6d] text-white rounded-xl font-bold shadow-lg hover:bg-[#003a54] transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
