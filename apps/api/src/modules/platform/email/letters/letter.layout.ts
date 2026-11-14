import type { Letter, LetterBlock } from './letter.types';

export interface LetterLinks {
  /** Web app origin, e.g. https://dev.medianhq.co */
  siteUrl: string;
  supportEmail: string;
  social: {
    twitter: string;
    instagram: string;
    linkedin: string;
    whatsapp?: string;
  };
  preferencesUrl: string;
  /** Left out where a letter can't be unsubscribed from, e.g. application decisions */
  unsubscribeUrl?: string;
}

export const MEDIAN_ADDRESS = [
  'LSDPC Oko Oba IV Housing Estate,',
  'Agege, Lagos, Nigeria.',
];

const FONT = 'Roboto,Helvetica,Arial,sans-serif';
const TEXT = '#344054';
const DARK = '#101828';
const MUTED = '#667085';
const QUOTE_BAR = '#0284C7';
const FOOTER_BG = '#5B1825';
const ACCENT = '#EA580C';
const FOOTER_LINK = '#FED7AA';
const FOOTER_TEXT = '#FFEDD5';

export function renderLetter(letter: Letter, links: LetterLinks) {
  const body = letter.blocks
    .map((block) => renderBlock(block, links.siteUrl))
    .join('\n');
  const { signOff, name, title } = letter.signature;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(letter.subject)}</title>
  <style type="text/css">
    :root { color-scheme: light only; }
    body { margin: 0; padding: 0; }
    a[x-apple-data-detectors=true] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .letter-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .footer-col { display: block !important; width: 100% !important; text-align: left !important; }
      .footer-social { padding-top: 12px !important; text-align: left !important; }
    }
  </style>
</head>
<body bgcolor="#F2F4F7" style="margin:0;padding:0;background-color:#F2F4F7;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F2F4F7" style="background-color:#F2F4F7;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #EAECF0;border-radius:8px;">
        <tr><td class="letter-pad" style="padding:32px 28px 8px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};">
${body}
          <p style="margin:24px 0 0;font-family:${FONT};font-size:16px;line-height:1.4;color:${TEXT};">
            ${signOff ? `${escapeHtml(signOff)}<br>` : ''}<strong style="color:${DARK};">${escapeHtml(name)}</strong><br>
            <span style="font-size:14px;color:${MUTED};">${escapeHtml(title)}</span>
          </p>
        </td></tr>
        <tr><td class="letter-pad" style="padding:24px 28px 28px;">
          ${renderFooter(links)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: letter.subject, html, text: renderText(letter, links) };
}

function renderBlock(block: LetterBlock, siteUrl: string) {
  const p = `margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};`;
  switch (block.type) {
    case 'paragraph':
      return `<p style="${p}">${inline(block.text)}</p>`;
    case 'heading':
      return `<p style="${p}font-weight:700;">${inline(block.text)}</p>`;
    case 'quote':
      return `<p style="${p}border-left:4px solid ${QUOTE_BAR};padding-left:14px;font-style:italic;">${inline(block.text)}</p>`;
    case 'bullets':
      return `<ul style="margin:0 0 16px;padding-left:24px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};">${block.items
        .map((item) => `<li style="margin:0 0 6px;">${inline(item)}</li>`)
        .join('')}</ul>`;
    case 'numbered':
      return `<ol style="margin:0 0 16px;padding-left:24px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT};">${block.items
        .map(
          (item) =>
            `<li style="margin:0 0 8px;">${
              item.title
                ? `<strong style="color:${DARK};">${inline(item.title)}</strong><br>`
                : ''
            }${inline(item.text)}</li>`,
        )
        .join('')}</ol>`;
    case 'button':
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td bgcolor="${DARK}" style="border-radius:6px;background-color:${DARK};">
            <a href="${escapeHtml(siteUrl + block.path)}" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:6px;">${escapeHtml(block.label)}</a>
          </td></tr></table>`;
  }
}

function renderFooter(links: LetterLinks) {
  const socials = [
    { label: 'Twitter / X', url: links.social.twitter },
    { label: 'Instagram', url: links.social.instagram },
    ...(links.social.whatsapp
      ? [{ label: 'WhatsApp', url: links.social.whatsapp }]
      : []),
    { label: 'LinkedIn', url: links.social.linkedin },
  ];
  const navLink = (label: string, url: string) =>
    `<a href="${escapeHtml(url)}" style="display:block;margin:0 0 8px;font-family:${FONT};font-size:14px;color:${FOOTER_LINK};text-decoration:none;">${label}</a>`;
  const footLink = (label: string, url: string) =>
    `<a href="${escapeHtml(url)}" style="color:${FOOTER_LINK};text-decoration:underline;">${label}</a>`;
  const supportEmail = escapeHtml(links.supportEmail);

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${FOOTER_BG}" style="background-color:${FOOTER_BG};border-top:3px solid ${ACCENT};border-radius:6px;">
            <tr><td style="padding:22px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="footer-col" style="font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:0.5px;color:${FOOTER_TEXT};vertical-align:middle;">Median.</td>
                  <td class="footer-col footer-social" align="right" style="vertical-align:middle;">${socials
                    .map(
                      (social) =>
                        `<a href="${escapeHtml(social.url)}" style="display:inline-block;margin:0 0 4px 8px;padding:5px 10px;background-color:${ACCENT};border-radius:4px;font-family:${FONT};font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">${social.label}</a>`,
                    )
                    .join('')}</td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding:16px 24px 0;"><div style="border-top:1px solid rgba(255,255,255,0.25);font-size:0;line-height:0;">&nbsp;</div></td></tr>
            <tr><td style="padding:16px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="footer-col" style="vertical-align:top;">
                    ${navLink('Contact Support', `${links.siteUrl}/contact`)}
                    ${navLink('Privacy Policy', `${links.siteUrl}/privacy`)}
                    ${navLink('Terms of Service', `${links.siteUrl}/terms`)}
                  </td>
                  <td class="footer-col" align="right" style="vertical-align:top;font-family:${FONT};font-size:14px;line-height:1.6;color:${FOOTER_TEXT};text-align:right;">
                    <strong>Median,</strong><br>${MEDIAN_ADDRESS.join('<br>')}
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td style="padding:8px 24px 0;"><div style="border-top:1px solid rgba(255,255,255,0.25);font-size:0;line-height:0;">&nbsp;</div></td></tr>
            <tr><td style="padding:14px 24px 20px;font-family:${FONT};font-size:12px;line-height:1.6;color:${FOOTER_TEXT};">
              To make sure you keep getting these emails, please add ${footLink(supportEmail, `mailto:${links.supportEmail}`)} to your address book or allow list. Want to control the kind of emails you receive from Median? ${footLink('Update your email preferences', links.preferencesUrl)}.${
                links.unsubscribeUrl
                  ? ` Want out of the loop? ${footLink('Unsubscribe', links.unsubscribeUrl)}.`
                  : ''
              }
            </td></tr>
          </table>`;
}

function renderText(letter: Letter, links: LetterLinks) {
  const plain = (text: string) => text.replaceAll('**', '');
  const lines = letter.blocks.flatMap((block): string[] => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return [plain(block.text), ''];
      case 'quote':
        return [`> ${plain(block.text)}`, ''];
      case 'bullets':
        return [...block.items.map((item) => `- ${plain(item)}`), ''];
      case 'numbered':
        return [
          ...block.items.map(
            (item, index) =>
              `${index + 1}. ${item.title ? `${plain(item.title)} ` : ''}${plain(item.text)}`,
          ),
          '',
        ];
      case 'button':
        return [`${block.label}: ${links.siteUrl}${block.path}`, ''];
    }
  });
  const { signOff, name, title } = letter.signature;
  return [
    ...lines,
    ...(signOff ? [signOff] : []),
    name,
    title,
    '',
    '---',
    `Median, ${MEDIAN_ADDRESS.join(' ')}`,
    `Email preferences: ${links.preferencesUrl}`,
    ...(links.unsubscribeUrl ? [`Unsubscribe: ${links.unsubscribeUrl}`] : []),
  ].join('\n');
}

/** Escapes the text, then turns **bold** into <strong> */
function inline(text: string) {
  return escapeHtml(text).replace(
    /\*\*(.+?)\*\*/g,
    `<strong style="color:${DARK};">$1</strong>`,
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
