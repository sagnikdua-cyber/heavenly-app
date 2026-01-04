import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * DEBUG ROUTE - List all users in database
 * DELETE BEFORE PRODUCTION
 * This route is intentionally unprotected for debugging
 */
export async function GET() {
    try {
        const db = await getDb();
        const users = await db.all("SELECT id, email, name, guardianEmail FROM User");

        return NextResponse.json({
            count: users.length,
            users: users.map(u => ({
                email: u.email,
                name: u.name,
                id: u.id,
                guardianEmail: u.guardianEmail || null,
                hasGuardian: !!u.guardianEmail
            })),
            message: users.length === 0
                ? "No users found. Create an account by logging in with any email/password."
                : "Use one of these emails with the password you originally set.",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
