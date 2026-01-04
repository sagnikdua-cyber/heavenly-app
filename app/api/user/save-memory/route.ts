import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Save Memory API Route
 * Stores personal details mentioned by users for context-aware responses
 */
export async function POST(req: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { memory_type, content } = await req.json();

        // Validate input
        if (!memory_type || !content) {
            return NextResponse.json(
                { error: "Missing required fields: memory_type, content" },
                { status: 400 }
            );
        }

        // Valid memory types
        const validTypes = ['preference', 'pet', 'goal', 'struggle', 'hobby', 'relationship', 'achievement', 'fear', 'other'];
        if (!validTypes.includes(memory_type)) {
            return NextResponse.json(
                { error: `Invalid memory_type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Save to database
        const db = await getDb();
        const userId = (session.user as any).id || session.user.email;

        const result = await db.run(
            "INSERT INTO UserMemories (userId, memory_type, content, created_at) VALUES (?, ?, ?, ?)",
            [userId, memory_type, content, new Date().toISOString()]
        );

        console.log(`[MEMORY SAVED] User: ${userId}, Type: ${memory_type}, Content: ${content.substring(0, 50)}...`);

        return NextResponse.json({
            message: "Memory saved successfully",
            memoryId: result.lastID,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[SAVE MEMORY] Error:", error);
        return NextResponse.json(
            { error: "Failed to save memory" },
            { status: 500 }
        );
    }
}
