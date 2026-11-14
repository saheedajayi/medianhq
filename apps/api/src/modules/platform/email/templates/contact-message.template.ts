export type ContactMessageTemplateInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/** The message someone sent from the Contact Us page, as the team receives it */
export function buildContactMessageTemplate(
  input: ContactMessageTemplateInput,
) {
  const subject = `Contact form: ${input.subject} from ${input.name}`;
  const rows = [
    ['Name', input.name],
    ['Email', input.email],
    ['Subject', input.subject],
  ];

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#101828;background:#ffffff;">
    <h2 style="margin:0 0 16px;font-size:18px;">New message from the Contact Us page</h2>
    ${rows
      .map(
        ([label, value]) =>
          `<p style="margin:0 0 8px;font-size:14px;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`,
      )
      .join('')}
    <div style="margin-top:16px;padding:16px;border:1px solid #EAECF0;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
    <p style="margin-top:16px;font-size:12px;color:#667085;">Reply to this email to answer ${escapeHtml(input.name)} directly.</p>
  </body>
</html>`;

  const text = [
    'New message from the Contact Us page',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    input.message,
  ].join('\n');

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
