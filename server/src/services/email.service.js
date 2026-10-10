export async function sendPasswordResetEmail({ to, resetUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[DEV] Password reset link for ${to}: ${resetUrl}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'DevVault <onboarding@resend.dev>',
        to: [to],
        subject: 'Reset your DevVault password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #18181b;">
            <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">Reset your password</h2>
            <p style="font-size: 14px; line-height: 1.5; color: #52525b; margin-bottom: 24px;">
              Click the button below to reset your DevVault password. This link will expire in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Reset Password
            </a>
            <p style="font-size: 12px; color: #a1a1aa; margin-top: 32px;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `
      })
    });
    return { success: res.ok };
  } catch (err) {
    console.error('Email sending failed:', err.message);
    return { success: false, error: err.message };
  }
}
