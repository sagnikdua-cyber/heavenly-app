import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('[AUTH] Missing credentials');
                    return null;
                }

                console.log('[AUTH] Login attempt for email:', credentials.email);

                const db = await getDb();
                let user = await db.get("SELECT * FROM User WHERE email = ?", [credentials.email]);

                console.log('[AUTH] User found in database:', user ? 'YES' : 'NO');
                if (user) {
                    console.log('[AUTH] User details:', { id: user.id, email: user.email, name: user.name });
                }

                if (!user) {
                    // MOCK REGISTRATION: If user doesn't exist, create them for testing
                    console.log('[AUTH] Creating new user (auto-registration)');
                    const hashedPassword = await bcrypt.hash(credentials.password, 10);
                    const id = crypto.randomUUID();
                    await db.run(
                        "INSERT INTO User (id, email, password, name) VALUES (?, ?, ?, ?)",
                        [id, credentials.email, hashedPassword, "Heavenly User"]
                    );
                    user = { id, email: credentials.email, name: "Heavenly User" };
                    console.log('[AUTH] New user created successfully:', id);
                } else {
                    // Check password
                    console.log('[AUTH] Comparing passwords...');
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log('[AUTH] Password comparison result:', isValid ? 'VALID ✅' : 'INVALID ❌');

                    if (!isValid) {
                        console.log('[AUTH] Login failed - incorrect password');
                        return null;
                    }
                    console.log('[AUTH] Login successful!');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
