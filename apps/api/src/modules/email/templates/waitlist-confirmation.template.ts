export type WaitlistConfirmationTemplateInput = {
  firstName: string;
  audienceLabel: string;
  waitlistUrl: string;
  unsubscribeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  sentYear: number;
  siteUrl: string;
};

export type WaitlistConfirmationTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function buildWaitlistConfirmationTemplate(
  input: WaitlistConfirmationTemplateInput,
): WaitlistConfirmationTemplate {
  const htmlInput = {
    ...input,
    firstName: escapeHtml(input.firstName),
    waitlistUrl: escapeHtml(input.waitlistUrl),
    unsubscribeUrl: escapeHtml(input.unsubscribeUrl),
    instagramUrl: escapeHtml(input.instagramUrl),
    twitterUrl: escapeHtml(input.twitterUrl),
    linkedinUrl: escapeHtml(input.linkedinUrl),
    siteUrl: escapeHtml(input.siteUrl),
  };
  const logoUrl = `${htmlInput.siteUrl}/median-logo.svg`;
  const footerLogoUrl = `${htmlInput.siteUrl}/median-logo-light.svg`;

  return {
    subject: "You're on the list - Welcome to Median!",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style type="text/css">
    @media only screen and (min-width: 520px) {
      .u-row { width: 560px !important; }
      .u-row .u-col { vertical-align: top; }
      .u-row .u-col-100 { width: 560px !important; }
    }
    @media only screen and (max-width: 520px) {
      .u-row-container { max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .u-row { width: 100% !important; }
      .u-row .u-col { display: block !important; width: 100% !important; min-width: 320px !important; max-width: 100% !important; }
      .u-row .u-col > div { margin: 0 auto; }
      .social-btn { display: block !important; margin-bottom: 8px !important; }
    }
    body { margin: 0; padding: 0; }
    table, td, tr { border-collapse: collapse; vertical-align: top; }
    p { margin: 0; }
    * { line-height: inherit; }
    a[x-apple-data-detectors=true] { color: inherit !important; text-decoration: none !important; }
    table, td { color: #000000; }
  </style>
</head>
<body style="margin:0;padding:0;-webkit-text-size-adjust:100%;background-color:#FAD9B8;color:#000000;">
  <table role="presentation" style="border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;min-width:320px;margin:0 auto;background-color:#FAD9B8;width:100%" cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align:top">
        <td style="word-break:break-word;border-collapse:collapse !important;vertical-align:top;">
          <div class="u-row-container" style="padding:24px 0 0;background-color:transparent;">
            <div class="u-row" style="margin:0 auto;min-width:320px;max-width:560px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent;">
              <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent;">
                <div class="u-col u-col-100" style="max-width:320px;min-width:560px;display:table-cell;vertical-align:top;">
                  <div style="background-color:#ffffff;height:100%;width:100% !important;">
                    <div style="box-sizing:border-box;height:100%;padding:0;">
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:32px 36px 20px;font-family:arial,helvetica,sans-serif;" align="left">
                          <img src="${logoUrl}" width="224" height="40" alt="Median" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div style="font-size:15px;line-height:1.75;color:#1A1A1A;word-wrap:break-word;">
                            <p>Hi <strong>${htmlInput.firstName}</strong>,</p>
                            <br>
                            <p>Welcome to Median, we're so glad you're here!</p>
                            <br>
                            <p>You've just taken a really meaningful step. Whether you're looking to grow in your career, navigate a big decision, or simply learn from someone who's been in your shoes, Median is being built exactly for you.</p>
                            <br>
                            <p>Here's what happens next:</p>
                            <br>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr><td style="font-size:15px;color:#1A1A1A;padding:4px 0;vertical-align:top;width:16px;">&bull;</td><td style="font-size:15px;color:#1A1A1A;padding:4px 0;line-height:1.75;">You're officially on our waitlist. We're onboarding mentees in waves, so hang tight - your spot is secured.</td></tr>
                              <tr><td style="font-size:15px;color:#1A1A1A;padding:4px 0;vertical-align:top;width:16px;">&bull;</td><td style="font-size:15px;color:#1A1A1A;padding:4px 0;line-height:1.75;">When we're ready for you, you'll be among the first to know.</td></tr>
                              <tr><td style="font-size:15px;color:#1A1A1A;padding:4px 0;vertical-align:top;width:16px;">&bull;</td><td style="font-size:15px;color:#1A1A1A;padding:4px 0;line-height:1.75;">In the meantime, keep an eye on your inbox - we'll share tips, stories, and updates to help you get the most out of Median when you're in.</td></tr>
                            </table>
                            <br>
                            <p>While you wait, come hang out with us on our social media pages. We share behind-the-scenes updates, mentorship insights, and community stories you won't want to miss.</p>
                          </div>
                        </td></tr></tbody>
                      </table>
                      ${buildSocialButtons(htmlInput)}
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 24px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div style="font-size:15px;line-height:1.75;color:#1A1A1A;word-wrap:break-word;">
                            <p>We can't wait to help you find the right mentor, someone who genuinely gets where you're coming from and can help you get to where you want to go.</p>
                          </div>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div style="background-color:#FFFAF5;border-radius:8px;border:1px solid #E5E5E5;padding:16px 20px;box-sizing:border-box;">
                            <div style="font-family:arial,helvetica,sans-serif;font-size:14px;color:#1A1A1A;line-height:1.7;">
                              P.S. Know someone else who could use a great mentor? Share the love &nbsp;<a href="${htmlInput.waitlistUrl}" style="color:#E8522A;text-decoration:underline;">link to waitlist</a>
                            </div>
                          </div>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 40px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div style="font-size:15px;line-height:1.75;color:#1A1A1A;word-wrap:break-word;">
                            <p>Got questions or just want to say hi? Reply to this email anytime. We read every message.</p>
                            <br>
                            <p>Talk soon,<br><strong>The Median Team</strong></p>
                          </div>
                        </td></tr></tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ${buildFooter(htmlInput, footerLogoUrl)}
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`,
    text: [
      `Hi ${input.firstName},`,
      '',
      "Welcome to Median, we're so glad you're here!",
      '',
      `You're officially on our waitlist as a ${input.audienceLabel}. We're onboarding in waves, so hang tight - your spot is secured.`,
      '',
      "When we're ready for you, you'll be among the first to know. In the meantime, keep an eye on your inbox for tips, stories, and updates.",
      '',
      `Share the waitlist: ${input.waitlistUrl}`,
      '',
      'Talk soon,',
      'The Median Team',
    ].join('\n'),
  };
}

function buildSocialButtons(input: {
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
}) {
  return `<table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
    <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="left">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:10px;"><a class="social-btn" href="${input.instagramUrl}" style="display:inline-block;font-family:arial,helvetica,sans-serif;font-size:13px;font-weight:600;color:#1A1A1A;border:1.5px solid #D0D0D0;border-radius:6px;padding:8px 14px;text-decoration:none;"><span style="display:inline-block;vertical-align:middle;margin-right:6px;">${instagramIcon('#1A1A1A', 15)}</span>Instagram</a></td>
          <td style="padding-right:10px;"><a class="social-btn" href="${input.twitterUrl}" style="display:inline-block;font-family:arial,helvetica,sans-serif;font-size:13px;font-weight:600;color:#1A1A1A;border:1.5px solid #D0D0D0;border-radius:6px;padding:8px 14px;text-decoration:none;"><span style="display:inline-block;vertical-align:middle;margin-right:6px;">${xIcon('#1A1A1A', 15)}</span>Twitter/X</a></td>
          <td><a class="social-btn" href="${input.linkedinUrl}" style="display:inline-block;font-family:arial,helvetica,sans-serif;font-size:13px;font-weight:600;color:#1A1A1A;border:1.5px solid #D0D0D0;border-radius:6px;padding:8px 14px;text-decoration:none;"><span style="display:inline-block;vertical-align:middle;margin-right:6px;">${linkedinIcon('#1A1A1A', 15)}</span>LinkedIn</a></td>
        </tr>
      </table>
    </td></tr></tbody>
  </table>`;
}

function buildFooter(
  input: {
    unsubscribeUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    sentYear: number;
  },
  footerLogoUrl: string,
) {
  return `<div class="u-row-container" style="padding:0;background-color:transparent;">
    <div class="u-row" style="margin:0 auto;min-width:320px;max-width:560px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent;">
      <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent;">
        <div class="u-col u-col-100" style="max-width:320px;min-width:560px;display:table-cell;vertical-align:top;">
          <div style="background-color:#4E0703;height:100%;width:100% !important;">
            <div style="box-sizing:border-box;height:100%;padding:0;">
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td style="padding:32px 36px 16px;font-family:arial,helvetica,sans-serif;" align="center">
                  <div style="font-size:12px;line-height:1.7;color:#C8B0A8;word-wrap:break-word;text-align:center;">
                    <p>If you don't want to receive promotional email, you can opt out of receiving future emails by clicking <a href="${input.unsubscribeUrl}" style="color:#C8B0A8;text-decoration:underline;">unsubscribe</a>.</p>
                  </div>
                </td></tr></tbody>
              </table>
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td style="padding:0 36px 24px;font-family:arial,helvetica,sans-serif;" align="center">
                  <div style="font-size:12px;color:#C8B0A8;text-align:center;">&copy; ${input.sentYear} MedianHQ &middot; All rights reserved</div>
                </td></tr></tbody>
              </table>
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td style="padding:0 36px 16px;font-family:arial,helvetica,sans-serif;" align="center">
                  <img src="${footerLogoUrl}" width="157" height="28" alt="Median" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
                </td></tr></tbody>
              </table>
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td style="padding:0 36px 36px;font-family:arial,helvetica,sans-serif;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                    <tr>
                      <td style="padding:0 12px;"><a href="${input.linkedinUrl}" style="text-decoration:none;display:inline-block;">${linkedinIcon('#ffffff', 18)}</a></td>
                      <td style="padding:0 12px;"><a href="${input.instagramUrl}" style="text-decoration:none;display:inline-block;">${instagramIcon('#ffffff', 18)}</a></td>
                      <td style="padding:0 12px;"><a href="${input.twitterUrl}" style="text-decoration:none;display:inline-block;">${xIcon('#ffffff', 18)}</a></td>
                    </tr>
                  </table>
                </td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function instagramIcon(color: string, size: number) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="${color}" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="${color}" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="${color}"/></svg>`;
}

function xIcon(color: string, size: number) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.265 5.637 4.741-5.637Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>`;
}

function linkedinIcon(color: string, size: number) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
