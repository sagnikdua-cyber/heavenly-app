import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { getDb } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Logging utility for emergency alerts
 */
function logAlert(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logPrefix = `[SAFETY ALERT ${timestamp}]`;

    if (level === 'error') {
        console.error(logPrefix, message, data || '');
    } else if (level === 'warn') {
        console.warn(logPrefix, message, data || '');
    } else {
        console.log(logPrefix, message, data || '');
    }
}

/**
 * Send email with automatic retry on failure
 */
async function sendEmailWithRetry(
    recipient: string,
    subject: string,
    htmlBody: string,
    attemptNumber: number = 1
): Promise<boolean> {
    try {
        await resend.emails.send({
            from: "Heavenly Crisis Alert <alerts@resend.dev>",
            to: recipient,
            subject: subject,
            html: htmlBody,
            headers: {
                "X-Priority": "1",
                "Importance": "high",
            },
        });

        logAlert('info', `Email sent successfully to ${recipient} (attempt ${attemptNumber})`);
        return true;
    } catch (error: any) {
        logAlert('error', `Failed to send email to ${recipient} (attempt ${attemptNumber})`, error.message);

        // Retry once after 30 seconds if this is the first attempt
        if (attemptNumber === 1) {
            logAlert('info', `Scheduling retry for ${recipient} in 30 seconds...`);

            setTimeout(async () => {
                logAlert('info', `Retrying email to ${recipient}...`);
                await sendEmailWithRetry(recipient, subject, htmlBody, 2);
            }, 30000); // 30 seconds
        } else {
            logAlert('error', `Email to ${recipient} failed after retry. Giving up.`);
        }

        return false;
    }
}

/**
 * Safety Alert API Route
 * Secured to only accept POST requests from authenticated chatroom users
 * Includes timeout safeguard for location fetching and automatic retry on email failure
 */
export async function POST(req: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            logAlert('warn', 'Unauthorized access attempt');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify request origin (must come from chatroom)
        const referer = req.headers.get("referer");

        if (!referer || !referer.includes("/chatroom")) {
            logAlert('warn', `Rejected request from invalid origin: ${referer}`);
            return NextResponse.json(
                { error: "Invalid request origin" },
                { status: 403 }
            );
        }

        const { userLocation, crisisSnippet, userId } = await req.json();

        // Validate input
        if (!crisisSnippet || !userId) {
            logAlert('error', 'Missing required fields', { userId, hasCrisisSnippet: !!crisisSnippet });
            return NextResponse.json(
                { error: "Missing required fields: crisisSnippet, userId" },
                { status: 400 }
            );
        }

        logAlert('info', `Crisis alert initiated for user ${userId}`);

        // Return 200 OK immediately to prevent app hanging
        // Process email sending asynchronously
        setImmediate(async () => {
            try {
                const db = await getDb();
                const user = await db.get(
                    "SELECT name, email, guardianEmail, helplineEmail FROM User WHERE id = ? OR email = ?",
                    [userId, userId]
                );

                if (!user) {
                    logAlert('error', `User not found for ID ${userId}`);
                    return;
                }

                // Handle location with timeout safeguard
                const { lat, lng } = userLocation || { lat: null, lng: null };
                const hasValidLocation = lat && lng && lat !== 0 && lng !== 0;
                const mapsLink = hasValidLocation
                    ? `https://www.google.com/maps?q=${lat},${lng}`
                    : null;
                const locationText = hasValidLocation
                    ? `Coordinates: ${lat}, ${lng}`
                    : 'Location unavailable (timeout or permission denied)';

                logAlert('info', `Location status: ${hasValidLocation ? 'Available' : 'Unavailable'}`, { lat, lng });

                const userName = user.name || user.email || "Unknown User";
                const userEmail = user.email;

                // Prepare email recipients
                const recipients: string[] = [];
                let noGuardian = false;

                // Check if guardian email exists
                if (user.guardianEmail) {
                    recipients.push(user.guardianEmail);
                    logAlert('info', `Guardian email found: ${user.guardianEmail}`);
                } else {
                    // No guardian - send to helpline
                    recipients.push('support@1life.org.in');
                    noGuardian = true;
                    logAlert('warn', 'No guardian configured, using helpline fallback');
                }

                // Also send to helpline email if configured
                if (user.helplineEmail) {
                    recipients.push(user.helplineEmail);
                    logAlert('info', `Additional helpline email: ${user.helplineEmail}`);
                }

                if (recipients.length === 0) {
                    logAlert('error', `No recipients configured for user ${userId}`);
                    return;
                }

                logAlert('info', `Sending alerts to ${recipients.length} recipient(s)`);

                // Email content
                const subject = `[URGENT] Mental Health Crisis Alert - ${userName}`;
                const htmlBody = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .alert-header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .alert-body { background: #fff7ed; padding: 20px; border: 3px solid #dc2626; border-top: none; border-radius: 0 0 8px 8px; }
                .crisis-message { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
                .location-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
                .urgent-notice { background: #fef2f2; padding: 15px; border: 2px solid #dc2626; border-radius: 6px; margin: 15px 0; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="alert-header">
                  <h1 style="margin: 0; font-size: 24px;">🚨 CRITICAL MENTAL HEALTH CRISIS</h1>
                </div>
                <div class="alert-body">
                  <div class="urgent-notice">
                    <strong style="color: #dc2626; font-size: 18px;">⚠️ IMMEDIATE ATTENTION REQUIRED</strong>
                    <p style="margin: 10px 0 0 0;"><strong>${userEmail}</strong> is suffering from mental trauma and dealing with suicidal thoughts. Please help them immediately.</p>
                  </div>
                  
                  <p><strong>User Information:</strong></p>
                  <ul>
                    <li><strong>Name:</strong> ${userName}</li>
                    <li><strong>Email:</strong> ${userEmail}</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                  </ul>
                  
                  <div class="crisis-message">
                    <strong>Crisis Message Detected:</strong>
                    <p style="margin: 10px 0 0 0;">"${crisisSnippet}"</p>
                  </div>
                  
                  ${mapsLink ? `
                    <p><strong>Current Location:</strong></p>
                    <a href="${mapsLink}" class="location-button" target="_blank">📍 View Location on Google Maps</a>
                    <p style="font-size: 12px; color: #666;">${locationText}</p>
                  ` : `<p><strong>Location:</strong> ${locationText}</p>`}
                  
                  <div class="urgent-notice">
                    <p style="margin: 0;"><strong>RECOMMENDED ACTIONS:</strong></p>
                    <ol style="margin: 10px 0 0 0;">
                      <li>Contact ${userName} immediately at ${userEmail}</li>
                      <li>If unable to reach them, consider contacting local emergency services</li>
                      ${mapsLink ? '<li>Use the location link above to provide exact coordinates if needed</li>' : ''}
                      <li>National Suicide Prevention Helpline (India): 14416</li>
                    </ol>
                  </div>
                  
                  <div class="footer">
                    <p>This is an automated crisis alert from Heavenly Safety System.</p>
                    <p>This person needs immediate support and intervention.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

                // Send emails with automatic retry
                for (const recipient of recipients) {
                    // Send in background, don't await
                    sendEmailWithRetry(recipient, subject, htmlBody);
                }

                logAlert('info', `Alert processing complete for user ${userId}`);
            } catch (error: any) {
                logAlert('error', 'Alert processing error', error.message);
            }
        });

        // Check if guardian exists for response
        const db = await getDb();
        const user = await db.get(
            "SELECT guardianEmail FROM User WHERE id = ? OR email = ?",
            [userId, userId]
        );

        return NextResponse.json({
            message: "Safety alert initiated",
            status: "processing",
            noGuardian: !user?.guardianEmail,
        });
    } catch (error: any) {
        logAlert('error', 'API Error', error.message);
        return NextResponse.json(
            { error: "Failed to process safety alert" },
            { status: 500 }
        );
    }
}

// Reject all other HTTP methods
export async function GET() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
