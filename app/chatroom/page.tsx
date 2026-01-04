"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, Shield } from "lucide-react";
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
    const [showHelpButton, setShowHelpButton] = useState(false);
    const [isFirstInteraction, setIsFirstInteraction] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

            // Check for first interaction special greeting
            const lowerMessage = userMessage.toLowerCase().trim();
            if (isFirstInteraction && (lowerMessage === "hi" || lowerMessage === "hello" || lowerMessage === "hey")) {
                console.log('[CHATROOM] Using first interaction greeting');
                return "Hey bestie! I'm so happy you reached out. I've been waiting to chat with you! How is your heart feeling today? ✨";
            }

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
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="min-h-screen w-full bg-[#f2f1ec] text-gray-800 flex flex-col font-sans"
        >
            {/* Header */}
            <header className="p-6 border-b border-[#004b6d]/20 backdrop-blur-md bg-[#004b6d] sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img
                                src="/havyn-avatar.png"
                                alt="Havyn"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg font-light tracking-wide text-white">Havyn</h1>
                            <p className="text-[10px] text-white/70">Your AI Companion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] text-white/80">Online</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <h2 className="text-2xl font-light text-gray-700 mb-3">Start a conversation</h2>
                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                Havyn is here to listen, support, and help you navigate through anything on your mind.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} `}
                                    >
                                        <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                            {message.sender === "havyn" && (
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover rounded-full" />
                                                </div>
                                            )}
                                            <div
                                                className={`px-5 py-3 rounded-2xl ${message.sender === "user"
                                                    ? "bg-[#8de6e1] text-gray-800"
                                                    : "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                                                    } `}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-3 max-w-[80%]">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <img src="/havyn-avatar.png" alt="Havyn" className="w-full h-full object-cover rounded-full" />
                                        </div>
                                        <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-6 border-t border-[#003a52] bg-[#004b6d]">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/60 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="w-12 h-12 rounded-full bg-[#8de6e1] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send size={20} className="text-[#004b6d]" />
                        </button>
                    </div>
                    <p className="text-[10px] text-white/50 text-center mt-4">
                        Havyn uses AI to provide support. Your conversations are private and secure.
                    </p>
                </div>
            </footer>

            {/* Help Button - Shows when crisis detected and no guardian */}
            {showHelpButton && (
                <HelpButton onDismiss={() => setShowHelpButton(false)} />
            )}
        </motion.div>
    );
}
