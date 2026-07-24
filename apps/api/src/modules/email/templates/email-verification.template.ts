export type EmailVerificationTemplateInput = {
  firstName: string;
  verificationCode: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  sentYear: number;
  siteUrl: string;
  assetUrl: string;
};

export type EmailVerificationTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function buildEmailVerificationTemplate(
  input: EmailVerificationTemplateInput,
): EmailVerificationTemplate {
  const htmlInput = {
    ...input,
    firstName: escapeHtml(input.firstName),
    verificationCode: escapeHtml(input.verificationCode),
    instagramUrl: escapeHtml(input.instagramUrl),
    twitterUrl: escapeHtml(input.twitterUrl),
    linkedinUrl: escapeHtml(input.linkedinUrl),
    siteUrl: escapeHtml(input.siteUrl),
    assetUrl: escapeHtml(input.assetUrl),
  };
  const logoUrl = `${htmlInput.assetUrl}/median-logo.png`;
  const footerLogoUrl = `${htmlInput.assetUrl}/median-logo-light.png`;

  return {
    subject: "Verify your email address - Median",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light; }
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
    .email-bg { background-color: #FAD9B8 !important; }
    .email-card { background-color: #ffffff !important; }
    .email-footer { background-color: #4E0703 !important; }
    .email-text, .email-text td { color: #1A1A1A !important; }
  </style>
</head>
<body class="email-bg" bgcolor="#FAD9B8" style="margin:0;padding:0;-webkit-text-size-adjust:100%;background-color:#FAD9B8 !important;color:#000000;">
  <table class="email-bg" role="presentation" bgcolor="#FAD9B8" style="border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;min-width:320px;margin:0 auto;background-color:#FAD9B8 !important;width:100%" cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align:top">
        <td style="word-break:break-word;border-collapse:collapse !important;vertical-align:top;">
          <div class="u-row-container" style="padding:24px 0 0;background-color:transparent;">
            <div class="u-row" style="margin:0 auto;min-width:320px;max-width:560px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent;">
              <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent;">
                <div class="u-col u-col-100" style="max-width:320px;min-width:560px;display:table-cell;vertical-align:top;">
                  <div class="email-card" style="background-color:#ffffff !important;height:100%;width:100% !important;">
                    <div style="box-sizing:border-box;height:100%;padding:0;">
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:32px 36px 20px;font-family:arial,helvetica,sans-serif;" align="left">
                          <img src="${logoUrl}" width="224" height="40" alt="Median" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div class="email-text" style="font-size:15px;line-height:1.75;color:#1A1A1A !important;word-wrap:break-word;">
                            <p>Hi <strong>${htmlInput.firstName}</strong>,</p>
                            <br>
                            <p>Thanks for joining Median! Please use the following code to verify your email address:</p>
                            <br>
                          </div>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="center">
                          <div style="background-color:#F5F6F8;border-radius:8px;border:1px solid #E5E5E5;padding:16px 20px;box-sizing:border-box;display:inline-block;">
                            <div style="font-family:monospace,arial,helvetica,sans-serif;font-size:32px;font-weight:bold;letter-spacing:6px;color:#1A1A1A;line-height:1.2;">
                              ${htmlInput.verificationCode}
                            </div>
                          </div>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 40px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div class="email-text" style="font-size:15px;line-height:1.75;color:#1A1A1A !important;word-wrap:break-word;">
                            <p>If you didn't create an account, you can safely ignore this email.</p>
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
      "Thanks for joining Median! Please use the following code to verify your email address:",
      '',
      `${input.verificationCode}`,
      '',
      "If you didn't create an account, you can safely ignore this email.",
      '',
      'Talk soon,',
      'The Median Team',
    ].join('\n'),
  };
}

function buildFooter(
  input: {
    instagramUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    sentYear: number;
    assetUrl: string;
  },
  footerLogoUrl: string,
) {
  return `<div class="u-row-container" style="padding:0;background-color:transparent;">
    <div class="u-row" style="margin:0 auto;min-width:320px;max-width:560px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent;">
      <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent;">
        <div class="u-col u-col-100" style="max-width:320px;min-width:560px;display:table-cell;vertical-align:top;">
          <div class="email-footer" style="background-color:#4E0703 !important;height:100%;width:100% !important;">
            <div style="box-sizing:border-box;height:100%;padding:0;">
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td style="padding:32px 36px 24px;font-family:arial,helvetica,sans-serif;" align="center">
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
                      <td style="padding:0 12px;"><a href="${input.linkedinUrl}" style="text-decoration:none;display:inline-block;"><img src="${input.assetUrl}/email/email-linkedin-white@2x.png" width="18" height="18" alt="LinkedIn" style="display:block;border:0;outline:none;text-decoration:none;height:auto;"></a></td>
                      <td style="padding:0 12px;"><a href="${input.instagramUrl}" style="text-decoration:none;display:inline-block;"><img src="${input.assetUrl}/email/email-instagram-white@2x.png" width="18" height="18" alt="Instagram" style="display:block;border:0;outline:none;text-decoration:none;height:auto;"></a></td>
                      <td style="padding:0 12px;"><a href="${input.twitterUrl}" style="text-decoration:none;display:inline-block;"><img src="${input.assetUrl}/email/email-x-white@2x.png" width="18" height="18" alt="X" style="display:block;border:0;outline:none;text-decoration:none;height:auto;"></a></td>
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
