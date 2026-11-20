import {
  FOUNDER_SIGNATURE,
  MENTOR_GUIDE_ATTACHMENT,
  paragraph,
  type Letter,
} from './letter.types';

/** Sent when a mentor submits their application */
export const applicationReceivedLetter = (firstName: string): Letter => ({
  subject: 'Your application is in! 🎉',
  sender: 'mide',
  blocks: [
    paragraph(`Hi ${firstName},`),
    paragraph('Your application is in! 🎉'),
    paragraph(
      'Thank you for taking the first step towards becoming a mentor on Median.',
    ),
    paragraph(
      "We're excited that you're interested in sharing your knowledge, experience, and insights with people looking for guidance.",
    ),
    { type: 'heading', text: "Here's what happens next:" },
    paragraph(
      'Our team will review your application to understand your experience, expertise, and how you could contribute to the Median mentor community.',
    ),
    paragraph("We'll get back to you with an update within 3–5 business days."),
    paragraph(
      "In the meantime, there's nothing else you need to do. We'll reach out as soon as there's an update.",
    ),
    paragraph(
      "Thank you for considering Median. We're looking forward to learning more about you!",
    ),
  ],
  signature: {
    signOff: 'Warmly,',
    name: 'Mide from Median',
    title: 'The Median Team',
  },
});

/** Sent when an admin approves the application */
export const applicationAcceptedLetter = (firstName: string): Letter => ({
  subject: "You're in! Welcome to Median as a Founding Mentor 🎉",
  sender: 'founder',
  blocks: [
    paragraph(`Hi ${firstName},`),
    { type: 'heading', text: "You're in!" },
    paragraph(
      "After reviewing your application, we're delighted to welcome you to Median as one of our Founding Mentors.",
    ),
    paragraph(
      "We believe mentorship should be accessible, meaningful, and built around real experience. We're excited to have you as part of a community of professionals helping others find direction and grow.",
    ),
    { type: 'heading', text: "As a Founding Mentor, you'll receive:" },
    {
      type: 'bullets',
      items: [
        'Founding Mentor recognition on Median.',
        "3 months of Mentor Pro free (when it's live).",
        'Early access to the Median platform and its opportunities.',
      ],
    },
    { type: 'heading', text: "Here's what happens next:" },
    {
      type: 'numbered',
      items: [
        { text: 'Complete your mentor profile.' },
        {
          text: 'Add your areas of expertise and the kind of guidance you offer.',
        },
        { text: 'Create your first mentorship session.' },
        {
          text: 'Set your availability and get ready to connect with mentees.',
        },
      ],
    },
    { type: 'button', label: 'Go to Your Dashboard', path: '/dashboard' },
    paragraph(
      "You can also share your acceptance and your new role as a Founding Mentor with your network. We'd love to see you spread the word!",
    ),
    paragraph(
      "We're glad to have you here. Let's make mentorship more accessible, one connection at a time.",
    ),
    paragraph('Welcome to Median!'),
  ],
  signature: FOUNDER_SIGNATURE,
  // How the platform works and what mentors get; it goes as a file, not in the text
  attachments: [MENTOR_GUIDE_ATTACHMENT],
});

/**
 * Sent when an admin rejects the application. Feedback the admin writes
 * follows the decision; private reviewer notes never go out.
 */
export const applicationDeclinedLetter = (
  firstName: string,
  feedback?: string,
): Letter => ({
  subject: 'Your mentor application on Median',
  sender: 'founder',
  blocks: [
    paragraph(`Hi ${firstName},`),
    paragraph(
      'Thank you for taking the time to apply to become a mentor on Median. We appreciate your interest in being part of a community built around meaningful mentorship and professional growth.',
    ),
    paragraph(
      "After carefully reviewing your application, we're sorry to let you know that we won't be moving forward with your mentor application at this time.",
    ),
    ...(feedback?.trim()
      ? [paragraph(`Feedback from our team: ${feedback.trim()}`)]
      : []),
    paragraph(
      "We know this may be disappointing, but this decision isn't necessarily a reflection of your abilities, experience, or potential. Our selection process considers several factors, including the current needs and balance of our mentor community.",
    ),
    {
      type: 'heading',
      text: "But this isn't the end of your Median experience.",
    },
    paragraph(
      "We'd still love to have you on the platform as a mentee. You can connect with experienced professionals, get guidance, and continue developing your skills and career.",
    ),
    paragraph(
      "As part of this transition, we're offering you **3 months of Mentee Pro free** (when it's live) so you can explore what Median has to offer.",
    ),
    { type: 'button', label: 'Go to Your Dashboard', path: '/dashboard' },
    paragraph(
      "You're also welcome to reapply for the mentor programme in six months.",
    ),
    paragraph(
      "Thank you again for considering Median. We hope you'll continue to be part of our community.",
    ),
  ],
  signature: FOUNDER_SIGNATURE,
});
