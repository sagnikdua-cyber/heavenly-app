import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/db";

// Resend initialized locally to avoid build errors

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
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #ffffff; 
                  background-color: #0c0e12; 
                  margin: 0; 
                  padding: 0; 
                }
                .wrapper { 
                  background-color: #0c0e12; 
                  padding: 20px 10px; 
                }
                .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background-color: #1a1d21; 
                  border-radius: 20px; 
                  overflow: hidden; 
                  border: 1px solid #2d333b; 
                  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .alert-header { 
                  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
                  color: white; 
                  padding: 40px 20px; 
                  text-align: center; 
                }
                .alert-body { 
                  padding: 30px; 
                }
                .urgent-notice { 
                  background-color: rgba(220, 38, 38, 0.08); 
                  padding: 24px; 
                  border: 2px solid #dc2626; 
                  border-radius: 16px; 
                  margin-bottom: 25px; 
                }
                .crisis-message { 
                  background-color: #111418; 
                  padding: 20px; 
                  border-left: 4px solid #dc2626; 
                  margin: 20px 0; 
                  border-radius: 0 12px 12px 0;
                  font-style: italic;
                  color: #e5e7eb;
                }
                .location-button { 
                  display: block; 
                  background-color: #dc2626; 
                  color: #ffffff !important; 
                  padding: 18px 24px; 
                  text-decoration: none; 
                  border-radius: 12px; 
                  font-weight: bold; 
                  font-size: 16px;
                  text-align: center;
                  margin: 30px 0;
                  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
                }
                .info-list {
                  list-style: none;
                  padding: 0;
                  margin: 20px 0;
                }
                .info-list li {
                  padding: 8px 0;
                  border-bottom: 1px solid #2d333b;
                  color: #94a3b8;
                  font-size: 14px;
                }
                .info-list strong {
                  color: #f1f5f9;
                  margin-right: 10px;
                }
                .actions-box {
                  background-color: rgba(255,255,255,0.03);
                  border-radius: 16px;
                  padding: 20px;
                  margin-top: 20px;
                }
                .footer { 
                  text-align: center;
                  padding: 30px 20px; 
                  font-size: 12px; 
                  color: #4b5563; 
                  background-color: #111418;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="alert-header">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">🚨 CRITICAL MENTAL HEALTH CRISIS</h1>
                  </div>
                  <div class="alert-body">
                    <div class="urgent-notice">
                      <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
                        <strong style="color: #ef4444; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Immediate Attention Required</strong>
                      </div>
                      <p style="margin: 0; font-size: 16px; color: #f8fafc;">
                        <strong>${userEmail}</strong> is currently suffering from mental trauma and dealing with suicidal thoughts. 
                        <span style="display: block; margin-top: 10px; color: #ef4444; font-weight: bold;">Please help them immediately.</span>
                      </p>
                    </div>
                    
                    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 30px;">User Information</h2>
                    <ul class="info-list">
                      <li><strong>Name:</strong> ${userName}</li>
                      <li><strong>Email:</strong> ${userEmail}</li>
                      <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    
                    <div class="crisis-message">
                      <strong style="display: block; color: #dc2626; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-style: normal;">Crisis Message Detected:</strong>
                      "${crisisSnippet}"
                    </div>
                    
                    ${lat && lng ? `
                      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 30px;">Current Location</h2>
                      <a href="${mapsLink}" class="location-button">📍 View Location on Google Maps</a>
                      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: -10px;">Coordinates: ${lat}, ${lng}</p>
                    ` : `<p style="padding: 15px; background: #111418; border-radius: 8px; color: #64748b; text-align: center;">📍 Location Unavailable</p>`}
                    
                    <div class="actions-box">
                      <strong style="display: block; color: #f1f5f9; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Recommended Actions:</strong>
                      <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px;">
                        <li style="margin-bottom: 8px;">Contact ${userName} immediately at ${userEmail}</li>
                        <li style="margin-bottom: 8px;">If unable to reach them, consider contacting local emergency services</li>
                        ${lat && lng ? '<li style="margin-bottom: 8px;">Use the location link above to provide exact coordinates</li>' : ''}
                        <li>National Suicide Prevention Helpline (India): <strong>14416</strong></li>
                      </ol>
                    </div>
                  </div>
                  <div class="footer">
                    <p style="margin-bottom: 5px;">Automated crisis alert from Heavenly Safety System.</p>
                    <p style="margin: 0;">This person needs immediate support and intervention.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        // Send emails
        for (const recipient of recipients) {
          try {
            // Initialize locally to avoid build errors
            const resend = new Resend(process.env.RESEND_API_KEY || "");

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
