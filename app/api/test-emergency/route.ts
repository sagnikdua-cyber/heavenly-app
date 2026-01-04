import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize safely (prevents build crash if env var is missing during static generation)
const resend = new Resend(process.env.RESEND_API_KEY || "");

/**
 * TEMPORARY TEST ROUTE - DELETE BEFORE PRODUCTION
 * Tests emergency email system with mock data
 */
export async function GET(req: Request) {
  try {
    // Get test email from query params
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json(
        { error: "Please provide ?email=your-email@example.com" },
        { status: 400 }
      );
    }

    // Mock crisis data
    const mockData = {
      userName: "Test User",
      userEmail: "testuser@example.com",
      crisisSnippet: "I want to kill myself (TEST MESSAGE)",
      lat: 12.9716,
      lng: 77.5946,
    };

    const mapsLink = `https://www.google.com/maps?q=${mockData.lat},${mockData.lng}`;
    const locationText = `Coordinates: ${mockData.lat}, ${mockData.lng}`;

    // Email content
    const subject = `[TEST] [URGENT] Mental Health Crisis Alert - ${mockData.userName}`;
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
            .test-banner { background: #fbbf24; color: #78350f; padding: 10px; text-align: center; font-weight: bold; border-radius: 6px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="test-banner">
              ⚠️ THIS IS A TEST EMAIL - NOT A REAL CRISIS ⚠️
            </div>
            <div class="alert-header">
              <h1 style="margin: 0; font-size: 24px;">🚨 CRITICAL MENTAL HEALTH CRISIS</h1>
            </div>
            <div class="alert-body">
              <div class="urgent-notice">
                <strong style="color: #dc2626; font-size: 18px;">⚠️ IMMEDIATE ATTENTION REQUIRED</strong>
                <p style="margin: 10px 0 0 0;"><strong>${mockData.userEmail}</strong> is suffering from mental trauma and dealing with suicidal thoughts. Please help them immediately.</p>
              </div>
              
              <p><strong>User Information:</strong></p>
              <ul>
                <li><strong>Name:</strong> ${mockData.userName}</li>
                <li><strong>Email:</strong> ${mockData.userEmail}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <div class="crisis-message">
                <strong>Crisis Message Detected:</strong>
                <p style="margin: 10px 0 0 0;">"${mockData.crisisSnippet}"</p>
              </div>
              
              <p><strong>Current Location:</strong></p>
              <a href="${mapsLink}" class="location-button" target="_blank">📍 View Location on Google Maps</a>
              <p style="font-size: 12px; color: #666;">${locationText}</p>
              <p style="font-size: 12px; color: #666;">Google Maps Link: <a href="${mapsLink}">${mapsLink}</a></p>
              
              <div class="urgent-notice">
                <p style="margin: 0;"><strong>RECOMMENDED ACTIONS:</strong></p>
                <ol style="margin: 10px 0 0 0;">
                  <li>Contact ${mockData.userName} immediately at ${mockData.userEmail}</li>
                  <li>If unable to reach them, consider contacting local emergency services</li>
                  <li>Use the location link above to provide exact coordinates if needed</li>
                  <li>National Suicide Prevention Helpline (India): 14416</li>
                </ol>
              </div>
              
              <div class="footer">
                <p>This is an automated crisis alert from Heavenly Safety System.</p>
                <p>This person needs immediate support and intervention.</p>
                <p style="color: #dc2626; font-weight: bold;">⚠️ THIS IS A TEST EMAIL ⚠️</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send test email
    const result = await resend.emails.send({
      from: "Heavenly Crisis Alert <alerts@resend.dev>",
      to: testEmail,
      subject: subject,
      html: htmlBody,
      headers: {
        "X-Priority": "1",
        "Importance": "high",
      },
    });

    if (result.error) {
      throw new Error(result.error.message || "Unknown error sending email");
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      emailId: result.data?.id,
      testData: {
        userEmail: mockData.userEmail,
        crisisSnippet: mockData.crisisSnippet,
        googleMapsLink: mapsLink,
        coordinates: { lat: mockData.lat, lng: mockData.lng },
      },
      verification: {
        emailFormat: `[${mockData.userEmail}] is suffering from mental trauma and dealing with suicidal thoughts. Please help them immediately.`,
        mapsLinkFormat: `https://www.google.com/maps?q=${mockData.lat},${mockData.lng}`,
      },
    });

  } catch (error: any) {
    console.error("[TEST EMERGENCY] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error.message
      },
      { status: 500 }
    );
  }
}
