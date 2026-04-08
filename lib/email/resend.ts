import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EndorsementRequestEmailData {
  to: string;
  developerName: string;
  skillName: string;
  skillCategory: string;
  token: string;
  expiresAt: string;
}

export async function sendEndorsementRequestEmail(
  data: EndorsementRequestEmailData
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { to, developerName, skillName, skillCategory, token, expiresAt } =
      data;

    const endorseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/endorser/endorse/${token}`;
    const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const { error } = await resend.emails.send({
      from: "SkillMap <onboarding@resend.dev>",
      to,
      subject: `${developerName} has requested your endorsement on SkillMap`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Endorsement Request</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">SkillMap</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Peer-Verified Developer Skills</p>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">You've been asked to endorse a skill</h2>
              <p style="font-size: 16px; color: #4b5563;">
                <strong>${developerName}</strong> has requested your endorsement for their <strong>${skillName}</strong> skill in the <strong>${skillCategory}</strong> category.
              </p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${endorseUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Review & Endorse
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                This link expires on <strong>${expiryDate}</strong>
              </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
