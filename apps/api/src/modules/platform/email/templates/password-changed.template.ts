export type PasswordChangedTemplateInput = {
  firstName: string;
  changedAt: string;
  deviceInfo?: string;
  ipAddress?: string;
  recoveryLink: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  sentYear: number;
  siteUrl: string;
  assetUrl: string;
};

export type PasswordChangedTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function buildPasswordChangedTemplate(
  input: PasswordChangedTemplateInput,
): PasswordChangedTemplate {
  const htmlInput = {
    ...input,
    firstName: escapeHtml(input.firstName),
    changedAt: escapeHtml(input.changedAt),
    deviceInfo: escapeHtml(input.deviceInfo || 'Unknown device'),
    ipAddress: escapeHtml(input.ipAddress || 'Unavailable'),
    recoveryLink: escapeHtml(input.recoveryLink),
    instagramUrl: escapeHtml(input.instagramUrl),
    twitterUrl: escapeHtml(input.twitterUrl),
    linkedinUrl: escapeHtml(input.linkedinUrl),
    siteUrl: escapeHtml(input.siteUrl),
    assetUrl: escapeHtml(input.assetUrl),
  };
  const logoUrl = `${htmlInput.assetUrl}/median-logo.png`;
  const footerLogoUrl = `${htmlInput.assetUrl}/median-logo-light.png`;

  return {
    subject: 'Security Alert: Your Median password was changed',
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
    .details-box { background-color: #F9FAFB; border: 1px solid #EAECF0; border-radius: 8px; padding: 16px; margin: 16px 0; }
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
                            <p>Your password for your Median account was recently changed.</p>
                            <div class="details-box" style="background-color:#F9FAFB;border:1px solid #EAECF0;border-radius:8px;padding:16px;margin:16px 0;font-size:14px;">
                              <p><strong>Time:</strong> ${htmlInput.changedAt}</p>
                              <p><strong>Device / Browser:</strong> ${htmlInput.deviceInfo}</p>
                              <p><strong>IP Address:</strong> ${htmlInput.ipAddress}</p>
                            </div>
                            <p>All previously active sessions have been signed out for your security.</p>
                            <br>
                            <p style="color:#B42318;font-weight:600;">Did you not make this change?</p>
                            <p>If you did not change your password, someone else may have accessed your account. Click the button below immediately to recover your account.</p>
                          </div>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 28px;font-family:arial,helvetica,sans-serif;" align="center">
                          <a href="${htmlInput.recoveryLink}" style="display:inline-block;padding:14px 28px;background-color:#D92D20;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;font-family:arial,helvetica,sans-serif;">Recover My Account</a>
                        </td></tr></tbody>
                      </table>
                      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody><tr><td style="padding:0 36px 40px;font-family:arial,helvetica,sans-serif;" align="left">
                          <div class="email-text" style="font-size:15px;line-height:1.75;color:#1A1A1A !important;word-wrap:break-word;">
                            <p>Stay safe,<br><strong>The Median Security Team</strong></p>
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
      'Your password for your Median account was recently changed.',
      '',
      `Time: ${input.changedAt}`,
      `Device: ${input.deviceInfo || 'Unknown device'}`,
      `IP: ${input.ipAddress || 'Unavailable'}`,
      '',
      'All previously active sessions have been signed out for your security.',
      '',
      'If you did not perform this change, please recover your account immediately:',
      `${input.recoveryLink}`,
      '',
      'Stay safe,',
      'The Median Security Team',
    ].join('\n'),
  };
}

function buildFooter(
  input: {
    instagramUrl: string;
    twitterUrl: string;
    linkedinUrl: string;
    sentYear: number;
    siteUrl: string;
  },
  footerLogoUrl: string,
): string {
  return `
  <div class="u-row-container" style="padding:0;background-color:transparent;">
    <div class="u-row" style="margin:0 auto;min-width:320px;max-width:560px;overflow-wrap:break-word;word-wrap:break-word;word-break:break-word;background-color:transparent;">
      <div style="border-collapse:collapse;display:table;width:100%;height:100%;background-color:transparent;">
        <div class="u-col u-col-100" style="max-width:320px;min-width:560px;display:table-cell;vertical-align:top;">
          <div class="email-footer" style="background-color:#4E0703 !important;height:100%;width:100% !important;">
            <div style="box-sizing:border-box;height:100%;padding:28px 36px 32px;">
              <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td align="left">
                  <img src="${footerLogoUrl}" width="168" height="30" alt="Median" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">
                </td></tr></tbody>
              </table>
              <table style="font-family:arial,helvetica,sans-serif;margin-top:16px;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                <tbody><tr><td align="left">
                  <p style="font-size:12px;color:#FAD9B8;line-height:1.5;">&copy; ${input.sentYear} Median. All rights reserved.</p>
                </td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
