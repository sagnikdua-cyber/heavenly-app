import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDb();
        const user = await db.get(
            "SELECT id, email, name, guardianEmail, helplineEmail FROM User WHERE email = ?",
            [session.user.email]
        );

        if (!user) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        const resendKey = process.env.RESEND_API_KEY ? "CONFIGURED (Starts with " + process.env.RESEND_API_KEY.substring(0, 5) + "...)" : "MISSING";

        return NextResponse.json({
            session: {
                user: session.user,
                expires: session.expires
            },
            database: {
                id: user.id,
                email: user.email,
                name: user.name,
                guardianEmail: user.guardianEmail || "NOT SET",
                helplineEmail: user.helplineEmail || "Using Default (support@1life.org.in)"
            },
            environment: {
                RESEND_API_KEY: resendKey,
                NODE_ENV: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
