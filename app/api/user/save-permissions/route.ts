import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { location, notifications } = await req.json();

        const db = await getDb();

        try {
            await db.run(
                "UPDATE User SET locationPermission = ?, notificationPermission = ? WHERE email = ?",
                [location ? 1 : 0, notifications ? 1 : 0, session.user.email]
            );
            console.log('[PERMISSIONS] Successfully saved permissions for:', session.user.email);
        } catch (dbError) {
            console.error("[PERMISSIONS] Database Update Error:", dbError);
            return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
        }

        return NextResponse.json({ message: "Permissions saved successfully" });
    } catch (error) {
        console.error("Save Permissions Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
