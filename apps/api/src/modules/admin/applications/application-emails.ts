/** The decision emails, in one place so the admin preview shows exactly what is sent */
export const approvalEmail = () => ({
  subject: "You're approved to mentor on Median",
  paragraphs: [
    'Your mentor application has been approved, and your profile is now visible to mentees.',
    'Set your weekly availability and create your first session so mentees can book you.',
  ],
  ctaLabel: 'Set your availability',
  ctaPath: '/mentor/availability',
});

export const rejectionEmail = (reason?: string) => ({
  subject: 'An update on your Median mentor application',
  paragraphs: [
    "Thank you for applying to mentor on Median. We aren't able to approve your application right now.",
    ...(reason?.trim() ? [`Feedback from our team: ${reason.trim()}`] : []),
    'You are welcome to reply to this email with any questions.',
  ],
  ctaLabel: 'Visit Median',
  ctaPath: '/',
});
