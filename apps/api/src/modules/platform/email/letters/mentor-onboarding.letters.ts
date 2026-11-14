import { MIDE_SIGNATURE, paragraph, type Letter } from './letter.types';

/** The 5-day series a mentor gets after approval, one a day from the day after */
export const mentorOnboardingLetters: ((
  firstName: string,
  mentorUserId: string,
) => Letter)[] = [
  (firstName) => ({
    subject: "Let's start with your profile",
    sender: 'mide',
    blocks: [
      paragraph(`Hi ${firstName}, you're officially in! 🎉`),
      paragraph('Congratulations on becoming a mentor on Median!'),
      paragraph(
        "Now, let's make sure that when someone comes across your profile, they immediately understand who you are, what you know and how you can help them.",
      ),
      paragraph(
        "Before a mentee books a session with you, they'll probably want to know one thing:",
      ),
      { type: 'quote', text: '“Is this the right person to help me?”' },
      paragraph("That's why your profile matters."),
      paragraph(
        "Tell people a little about who you are, what you've learned, the areas you have experience in and the kind of problems you can help someone with.",
      ),
      paragraph(
        "Don't worry about making it sound too formal. Just make it clear, honest and useful.",
      ),
      paragraph(
        'Think about it this way: if a mentee landed on your profile today, would they understand why they should book a session with you?',
      ),
      paragraph(
        "Your profile is more than an introduction. It's an opportunity to establish credibility and help the right people understand the value you bring.",
      ),
      {
        type: 'button',
        label: 'Complete Your Profile',
        path: '/mentor/profile',
      },
      paragraph(
        "Your experience is valuable. Let's make it easier for the right people to find it.",
      ),
      paragraph("I'll be back in your inbox tomorrow with the next step."),
      paragraph('See you then!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: 'What can someone learn from you?',
    sender: 'mide',
    blocks: [
      paragraph(`Hi ${firstName}, your profile is taking shape. Yay! 🎉`),
      paragraph(
        "Now, let's turn your experience into something a mentee can actually book.",
      ),
      paragraph(
        'Create your first session around something specific you can help someone with.',
      ),
      paragraph('It could be:'),
      {
        type: 'bullets',
        items: [
          'CV or portfolio reviews',
          'Career guidance',
          'Interview preparation',
          "A skill you're experienced in",
          'Navigating a career transition',
          "Or even a conversation around a challenge you've already faced.",
        ],
      },
      paragraph('You can offer both free and paid sessions on Median.'),
      paragraph(
        'We do encourage mentors to have at least one free session available at all times. It gives new mentees a chance to experience your approach and get comfortable with you before deciding to book a paid session.',
      ),
      paragraph(
        'Depending on the session formats available to you, you can also explore one-on-one mentorship or group learning opportunities.',
      ),
      paragraph('Keep your first session simple. Ask yourself:'),
      {
        type: 'quote',
        text: '“If someone came to me with this problem, how could I help them?”',
      },
      {
        type: 'button',
        label: 'Create Your First Session',
        path: '/mentor/sessions',
      },
      paragraph('Someone might be looking for exactly what you already know.'),
      paragraph("I'll see you in your inbox with the next step."),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: 'Make it easy for people to book you',
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, you've got your profile and your first session is ready. We're getting somewhere! 🎉`,
      ),
      paragraph("Now, let's make sure people can actually book you."),
      paragraph(
        "Set your availability so mentees can see when you're free. And don't forget to add your payout details so you're ready when you start receiving paid bookings.",
      ),
      paragraph(
        "Once that's done, share your Median profile with your network.",
      ),
      paragraph(
        'LinkedIn, WhatsApp, your professional community, even a simple message to someone who might benefit from your experience.',
      ),
      paragraph(
        "You don't have to make a big announcement. Something as simple as:",
      ),
      {
        type: 'quote',
        text: "“I'm now available for mentorship on Median. If you're looking for guidance on [area], I'd be happy to help.”",
      },
      paragraph(
        "You can also share what you offer, the kind of people you'd love to support and the sessions they can book with you.",
      ),
      {
        type: 'button',
        label: 'Set Your Availability',
        path: '/mentor/availability',
      },
      paragraph(
        'The easier you make it for people to find and book you, the easier it is to get that first session.',
      ),
      paragraph(
        "I'll be back in your inbox with another tip to help you get started.",
      ),
      paragraph('See you in the next one!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName, mentorUserId) => ({
    subject: 'Your first booking could be closer than you think 👀',
    sender: 'mide',
    blocks: [
      paragraph(`Hi ${firstName}, you're almost there!`),
      paragraph(
        'Your profile is ready. Your session is live. Your availability is set.',
      ),
      paragraph('Now comes the exciting part: getting your first mentee.'),
      paragraph(
        "If you haven't already, share your Median profile today. Someone in your network may already be looking for the kind of guidance you offer.",
      ),
      paragraph(
        'You can also let people know about the areas you mentor in and the specific challenges you can help them navigate.',
      ),
      paragraph("And remember, you don't need to have all the answers."),
      paragraph(
        "A good mentor listens, asks the right questions and shares what they've learned from their own experience.",
      ),
      paragraph(
        "So when that first booking comes in, focus on understanding what the mentee actually needs. That's what makes a session useful.",
      ),
      {
        type: 'button',
        label: 'Share Your Median Profile',
        path: `/mentors/${mentorUserId}`,
      },
      paragraph(
        'Your first booking is one step. The relationships you build from there are what really matter.',
      ),
      paragraph('One more mail from me tomorrow. 😉'),
      paragraph('See you then!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: "You've made it this far! 🎉",
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, you've completed your profile, created your session and set up your availability. Yay! 🎉`,
      ),
      paragraph(
        "You're officially ready to start connecting with mentees on Median.",
      ),
      paragraph('So, what happens next?'),
      paragraph(
        'Once you start having sessions, pay attention to what your mentees need and what they respond to.',
      ),
      paragraph('After each session, take a moment to reflect:'),
      {
        type: 'bullets',
        items: [
          'What went well?',
          'What could I have explained better?',
          'What can I do differently next time?',
        ],
      },
      paragraph(
        "And don't forget to encourage your mentees to leave a review. Reviews help you build credibility on Median and give future mentees a better idea of what it's like to learn from you.",
      ),
      paragraph(
        "As you continue showing up, getting reviews and helping people, you'll have more opportunities to be discovered and receive bookings.",
      ),
      paragraph(
        "But mentorship isn't just about bookings. It's also an opportunity to grow your professional network, build your reputation, share your knowledge and make a meaningful difference in someone else's journey.",
      ),
      {
        type: 'button',
        label: 'View Your Mentor Dashboard',
        path: '/dashboard',
      },
      paragraph("That's it from me for now."),
      paragraph(
        "I'll be back in your inbox with more tips, ideas and things to help you make the most of your experience as a mentor on Median.",
      ),
      paragraph('For now, go make that first connection count.'),
      paragraph('See you in the next one!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
];
