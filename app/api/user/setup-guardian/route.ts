import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { email, password, skip } = body;

        if (skip) {
            return NextResponse.json({ message: "Skipped guardian setup" });
        }

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const db = await getDb();

        try {
            await db.run(
                "UPDATE User SET guardianEmail = ?, guardianPassword = ? WHERE email = ?",
                [email, hashedPassword, session.user.email]
            );
            console.log('[GUARDIAN SETUP] Successfully updated guardian for:', session.user.email);
        } catch (dbError) {
            console.error("[GUARDIAN SETUP] Database Update Error:", dbError);
            return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
        }

        return NextResponse.json({ message: "Guardian setup successful" });
    } catch (error) {
        console.error("Guardian Setup Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
