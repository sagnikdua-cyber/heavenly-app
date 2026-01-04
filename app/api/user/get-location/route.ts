import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Get Cached Location API Route
 * Retrieves user's last known location from database
 */
export async function GET(req: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId parameter" },
                { status: 400 }
            );
        }

        // Fetch from database
        const db = await getDb();
        const user = await db.get(
            "SELECT lastKnownLat, lastKnownLng, lastLocationUpdate FROM User WHERE id = ? OR email = ?",
            [userId, userId]
        );

        if (!user || !user.lastKnownLat || !user.lastKnownLng) {
            return NextResponse.json({
                lat: null,
                lng: null,
                message: "No cached location available"
            });
        }

        return NextResponse.json({
            lat: user.lastKnownLat,
            lng: user.lastKnownLng,
            lastUpdate: user.lastLocationUpdate,
            cached: true
        });

    } catch (error) {
        console.error("[GET LOCATION] Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve location" },
            { status: 500 }
        );
    }
}
