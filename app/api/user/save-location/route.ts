import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Save Location API Route
 * Saves user's current location to database for fallback during crisis
 */
export async function POST(req: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { lat, lng } = await req.json();

        // Validate coordinates
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return NextResponse.json(
                { error: "Invalid coordinates" },
                { status: 400 }
            );
        }

        // Save to database
        const db = await getDb();
        const userId = (session.user as any).id || session.user.email;

        await db.run(
            "UPDATE User SET lastKnownLat = ?, lastKnownLng = ?, lastLocationUpdate = ? WHERE id = ? OR email = ?",
            [lat, lng, new Date().toISOString(), userId, userId]
        );

        return NextResponse.json({
            message: "Location saved successfully",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[SAVE LOCATION] Error:", error);
        return NextResponse.json(
            { error: "Failed to save location" },
            { status: 500 }
        );
    }
}
