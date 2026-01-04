import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userLocation, crisisSnippet, userId } = await req.json();

    // Validate input
    if (!crisisSnippet || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: crisisSnippet, userId" },
        { status: 400 }
      );
    }

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
          console.error(`Emergency Alert: User not found for ID ${userId}`);
          return;
        }

        const { lat, lng } = userLocation || { lat: 0, lng: 0 };
        const mapsLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : 'Location unavailable';
        const userName = user.name || user.email || "Unknown User";
        const userEmail = user.email;

        // Prepare email recipients
        const recipients: string[] = [];
        let noGuardian = false;

        // Check if guardian email exists
        if (user.guardianEmail) {
          recipients.push(user.guardianEmail);
        } else {
          // No guardian - send to helpline
          recipients.push('support@1life.org.in');
          noGuardian = true;
        }

        // Also send to helpline email if configured
        if (user.helplineEmail) {
          recipients.push(user.helplineEmail);
        }

        if (recipients.length === 0) {
          console.warn(`Emergency Alert: No recipients configured for user ${userId}`);
          return;
        }

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
                  
                  ${lat && lng ? `
                    <p><strong>Current Location:</strong></p>
                    <a href="${mapsLink}" class="location-button" target="_blank">📍 View Location on Google Maps</a>
                    <p style="font-size: 12px; color: #666;">Coordinates: ${lat}, ${lng}</p>
                  ` : '<p><strong>Location:</strong> Not available</p>'}
                  
                  <div class="urgent-notice">
                    <p style="margin: 0;"><strong>RECOMMENDED ACTIONS:</strong></p>
                    <ol style="margin: 10px 0 0 0;">
                      <li>Contact ${userName} immediately at ${userEmail}</li>
                      <li>If unable to reach them, consider contacting local emergency services</li>
                      <li>Use the location link above to provide exact coordinates if needed</li>
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

        // Send emails
        for (const recipient of recipients) {
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
            console.log(`Emergency alert sent to ${recipient}`);
          } catch (emailError) {
            console.error(`Failed to send alert to ${recipient}:`, emailError);
          }
        }
      } catch (error) {
        console.error("Emergency Alert Processing Error:", error);
      }
    });

    // Check if guardian exists for response
    const db = await getDb();
    const user = await db.get(
      "SELECT guardianEmail FROM User WHERE id = ? OR email = ?",
      [userId, userId]
    );

    return NextResponse.json({
      message: "Emergency alert initiated",
      status: "processing",
      noGuardian: !user?.guardianEmail
    });

  } catch (error) {
    console.error("Emergency Alert API Error:", error);
    return NextResponse.json(
      { error: "Failed to process emergency alert" },
      { status: 500 }
    );
  }
}
