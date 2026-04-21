const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send invitation email
 */
exports.sendInvitation = async ({ to, inviteeName, inviterName, personalMessage, inviteLink }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #E91E8A; }
        .content { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .title { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #333; }
        .message { margin: 20px 0; padding: 20px; background: #f8f8f8; border-radius: 12px; font-style: italic; }
        .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #E91E8A, #C4166F); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎁 GiftBox4you</div>
        </div>
        <div class="content">
          <div class="title">You're invited to join ${inviterName}'s Gift Circle!</div>
          <p>Hi ${inviteeName},</p>
          <p>${inviterName} wants to give you perfect gifts! To make that happen, they need to know your preferences.</p>

          ${personalMessage ? `<div class="message">"${personalMessage}"<br>— ${inviterName}</div>` : ''}

          <p>Just answer a few quick questions so ${inviterName} knows what makes you smile.</p>

          <p style="text-align: center;">
            <a href="${inviteLink}" class="button">Fill Out Questionnaire</a>
          </p>

          <p><strong>What's in it for you?</strong></p>
          <ul>
            <li>Once you accept, you'll also see ${inviterName}'s preferences</li>
            <li>You can invite your own friends and share your profile</li>
            <li>Update your preferences anytime</li>
          </ul>

          <p>Thanks for helping ${inviterName} become a legendary gift-giver! 🎉</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GiftBox4you. All rights reserved.</p>
          <p>This invitation expires in 30 days.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    You're invited to join ${inviterName}'s Gift Circle!

    Hi ${inviteeName},

    ${inviterName} wants to give you perfect gifts! To make that happen, they need to know your preferences.

    ${personalMessage ? `"${personalMessage}" — ${inviterName}` : ''}

    Just answer a few quick questions so ${inviterName} knows what makes you smile.

    Click here to fill out the questionnaire: ${inviteLink}

    What's in it for you?
    - Once you accept, you'll also see ${inviterName}'s preferences
    - You can invite your own friends and share your profile
    - Update your preferences anytime

    Thanks for helping ${inviterName} become a legendary gift-giver!

    © ${new Date().getFullYear()} GiftBox4you
    This invitation expires in 30 days.
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'GiftBox4you <noreply@giftbox4you.com>',
    to,
    subject: `🎁 ${inviterName} invited you to their Gift Circle!`,
    text,
    html
  });
};

/**
 * Send password reset email
 */
exports.sendPasswordReset = async ({ to, userName, resetLink }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #E91E8A; }
        .content { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #E91E8A, #C4166F); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎁 GiftBox4you</div>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link expires in 1 hour.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GiftBox4you</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'GiftBox4you <noreply@giftbox4you.com>',
    to,
    subject: 'Reset your GiftBox4you password',
    html
  });
};

/**
 * Send event reminder email
 */
exports.sendEventReminder = async ({ to, userName, eventTitle, daysUntil, contactName }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #E91E8A; }
        .content { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .highlight { background: linear-gradient(135deg, #FDEEF3, #fff); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .days { font-size: 48px; font-weight: bold; color: #E91E8A; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎁 GiftBox4you</div>
        </div>
        <div class="content">
          <h2>Upcoming Event Reminder</h2>
          <p>Hi ${userName},</p>
          <div class="highlight">
            <div class="days">${daysUntil}</div>
            <div>days until ${eventTitle}</div>
          </div>
          <p>Time to start thinking about the perfect gift for ${contactName}!</p>
          <p>Open the app to view their gift preferences and find something they'll love.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'GiftBox4you <noreply@giftbox4you.com>',
    to,
    subject: `🎁 Reminder: ${eventTitle} is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`,
    html
  });
};

/**
 * Verify transporter connection
 */
exports.verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};
