import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Get Memories API Route
 * Retrieves all stored memories for a user to provide context
 */
export async function GET(req: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const userId = (session.user as any).id || session.user.email;

        // Fetch all memories for this user
        const memories = await db.all(
            "SELECT id, memory_type, content, created_at FROM UserMemories WHERE userId = ? ORDER BY created_at DESC",
            [userId]
        );

        // Group memories by type for easier context building
        const groupedMemories: Record<string, string[]> = {};
        memories.forEach((memory: any) => {
            if (!groupedMemories[memory.memory_type]) {
                groupedMemories[memory.memory_type] = [];
            }
            groupedMemories[memory.memory_type].push(memory.content);
        });

        return NextResponse.json({
            memories: memories,
            grouped: groupedMemories,
            count: memories.length
        });

    } catch (error) {
        console.error("[GET MEMORIES] Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve memories" },
            { status: 500 }
        );
    }
}
