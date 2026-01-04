import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "temporary-fallback-secret-please-set-env-var",
});

export const config = {
    matcher: [
        "/((?!$|login|chatroom|api/auth|api/debug|_next/static|_next/image|heavenly_logo.jpg|havyn-avatar.png|favicon.ico).*)",
    ],
};
