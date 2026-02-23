import { NextResponse } from "next/server";
import { Resend } from "resend";

// Resend initialized lazily inside handler

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
            .test-banner { 
              background-color: #fbbf24; 
              color: #78350f; 
              padding: 12px; 
              text-align: center; 
              font-weight: bold; 
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
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
              <div class="test-banner">
                ⚠️ THIS IS A TEST EMAIL - NOT A REAL CRISIS ⚠️
              </div>
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
                    <strong>${mockData.userEmail}</strong> is currently suffering from mental trauma and dealing with suicidal thoughts. 
                    <span style="display: block; margin-top: 10px; color: #ef4444; font-weight: bold;">Please help them immediately.</span>
                  </p>
                </div>
                
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 30px;">User Information</h2>
                <ul class="info-list">
                  <li><strong>Name:</strong> ${mockData.userName}</li>
                  <li><strong>Email:</strong> ${mockData.userEmail}</li>
                  <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
                
                <div class="crisis-message">
                  <strong style="display: block; color: #dc2626; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-style: normal;">Crisis Message Detected:</strong>
                  "${mockData.crisisSnippet}"
                </div>
                
                <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 30px;">Current Location</h2>
                <a href="${mapsLink}" class="location-button">📍 View Location on Google Maps</a>
                <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: -10px;">${locationText}</p>
                
                <div class="actions-box">
                  <strong style="display: block; color: #f1f5f9; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Recommended Actions:</strong>
                  <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Contact ${mockData.userName} immediately at ${mockData.userEmail}</li>
                    <li style="margin-bottom: 8px;">If unable to reach them, consider contacting local emergency services</li>
                    <li style="margin-bottom: 8px;">Use the location link above to provide exact coordinates</li>
                    <li>National Suicide Prevention Helpline (India): <strong>14416</strong></li>
                  </ol>
                </div>
              </div>
              <div class="footer">
                <p style="margin-bottom: 5px;">Automated crisis alert from Heavenly Safety System.</p>
                <p style="margin: 0;">This person needs immediate support and intervention.</p>
                <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">⚠️ THIS IS A TEST EMAIL ⚠️</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Initialize Resend lazily to prevent build-time errors
    const resend = new Resend(process.env.RESEND_API_KEY || "");

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
