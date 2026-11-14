import { MIDE_SIGNATURE, paragraph, type Letter } from './letter.types';

/** The 5-day series a mentee gets after signing up, the first one straight away */
export const menteeOnboardingLetters: ((firstName: string) => Letter)[] = [
  (firstName) => ({
    subject: 'So, what are you hoping to figure out?',
    sender: 'mide',
    blocks: [
      paragraph(`Hi ${firstName}, welcome to Median! 🎉`),
      paragraph(
        "You've taken the first step towards getting the guidance you need. Now, let's figure out where you want that guidance to take you.",
      ),
      paragraph(
        "Maybe you're trying to break into a new career. Maybe you want to improve a skill, make a big decision, or simply get some clarity about what comes next.",
      ),
      paragraph(
        "Whatever it is, you don't have to have everything figured out just yet.",
      ),
      paragraph(
        "Median connects you with people who have the experience and knowledge to help you navigate your next steps. But first, we need to understand what you're working towards.",
      ),
      paragraph(
        "Take a few minutes to tell us about your goals, the challenges you're facing and what you hope to get out of mentorship.",
      ),
      paragraph(
        'The clearer you are about what you need, the easier it becomes to find someone whose experience aligns with your goals.',
      ),
      { type: 'button', label: 'Set Your Goals', path: '/mentee/profile' },
      paragraph(
        "Remember, you don't have to figure everything out on your own. Sometimes, a conversation with the right person can help you see things differently.",
      ),
      paragraph(
        "I'll be back in your inbox tomorrow to help you take the next step.",
      ),
      paragraph('See you then!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: 'Someone out there has been where you are 👀',
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, imagine being able to talk to someone who has already navigated the challenge you're facing.`,
      ),
      paragraph(
        "Someone who can share what worked, what didn't, and what they wish they'd known earlier.",
      ),
      paragraph("That's one of the best things about mentorship. 😊"),
      paragraph(
        "There's a lot you can learn from searching online, but sometimes, you need a real conversation with someone who understands the path you're trying to take.",
      ),
      paragraph("That's where Median comes in."),
      paragraph(
        'Explore our mentor profiles, read about their experiences and look at the areas they can help you with.',
      ),
      paragraph(
        'Our mentor review process is designed to help maintain a community of people with relevant experience and expertise.',
      ),
      paragraph(
        "And remember, you don't necessarily need someone with the biggest title or the longest list of achievements. You need someone whose experience is relevant to your goals.",
      ),
      { type: 'button', label: 'Explore Mentors', path: '/mentee/explore' },
      paragraph(
        'Take your time finding a good fit. The right conversation could help you approach your next step with more clarity.',
      ),
      paragraph(
        "I'll be back tomorrow with a little help on turning that discovery into your first session.",
      ),
      paragraph('See you in the next one!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: "Found someone you'd love to learn from? 👀",
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, have you found a mentor whose experience caught your attention?`,
      ),
      paragraph(
        'If you have, this might be the perfect time to book a session!',
      ),
      paragraph(
        'When you find someone who feels like a good fit, take a look at their available sessions.',
      ),
      paragraph(
        "Depending on what's offered, you may find one-on-one sessions for focused guidance or group calls where you can learn alongside other professionals.",
      ),
      paragraph(
        'You can also find both free and paid sessions on Median. Choose an option that works for your needs and budget, and remember to check the session details before booking.',
      ),
      paragraph(
        'Before you book, think about what you want to get out of the conversation.',
      ),
      paragraph(
        'Do you need advice on your next career move? Feedback on your CV? Help understanding a new skill? Or simply a chance to talk through a decision?',
      ),
      paragraph(
        'Having a goal in mind will help you make better use of your time together.',
      ),
      {
        type: 'button',
        label: 'Book Your First Session',
        path: '/mentee/explore',
      },
      paragraph(
        "Your first mentorship session doesn't have to solve everything. It just needs to help you take a step forward.",
      ),
      paragraph(
        "Tomorrow, I'll share a few tips to help you get the most out of that conversation.",
      ),
      paragraph('See you then!'),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: 'A little preparation goes a long way!',
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, your mentorship session is an opportunity to learn, ask questions and get a fresh perspective. Let's make it count! 🎯`,
      ),
      paragraph(
        "You don't need to prepare a long presentation or impress your mentor with how much you know.",
      ),
      paragraph('Just come ready to have an honest conversation.'),
      paragraph('Here are three simple things you can do before your session:'),
      {
        type: 'numbered',
        items: [
          {
            title: 'Write down your questions.',
            text: "What have you been wondering about? What would you like your mentor's perspective on?",
          },
          {
            title: 'Be clear about your challenge.',
            text: "Explain where you are, what you're trying to achieve and what you've already tried.",
          },
          {
            title: 'Think about what a useful outcome would look like.',
            text: 'Maybe you want a clearer plan, feedback on an idea or practical steps you can take after the session.',
          },
        ],
      },
      paragraph(
        'And remember, mentorship is a two-way conversation. Listen, ask follow-up questions and be open to perspectives you may not have considered.',
      ),
      paragraph(
        "If you're joining a group call, remember that you can also learn from the questions and experiences of other participants.",
      ),
      {
        type: 'button',
        label: 'View Your Upcoming Sessions',
        path: '/mentee/bookings',
      },
      paragraph(
        "You've already taken the step of seeking guidance. Now, give yourself the chance to learn from it.",
      ),
      paragraph(
        "I'll be checking in with you one more time tomorrow. We'll talk about what comes after the conversation.",
      ),
    ],
    signature: MIDE_SIGNATURE,
  }),
  (firstName) => ({
    subject: "Okay, you've got the advice. What happens now? 🎉",
    sender: 'mide',
    blocks: [
      paragraph(
        `Hi ${firstName}, let's talk about what happens after a mentorship session.`,
      ),
      paragraph(
        'You might leave a conversation feeling inspired, with a notebook full of ideas and a clearer picture of what you want to do next.',
      ),
      paragraph(
        "That's great! But here's the important part: what you do with what you've learned.",
      ),
      paragraph('Take a moment to reflect on your session.'),
      {
        type: 'bullets',
        items: [
          'What stood out to you?',
          'What advice did your mentor share?',
          "What's one thing you can start working on today?",
        ],
      },
      paragraph(
        "You don't have to put everything into action at once. Start with one practical step and build from there.",
      ),
      paragraph(
        "And if the conversation was helpful, don't forget to leave your mentor a review. Your feedback helps them improve and gives other mentees a better idea of what to expect.",
      ),
      paragraph(
        "You can also schedule a follow-up session when you're ready to discuss your progress, work through a new challenge or get feedback on how things are going.",
      ),
      {
        type: 'button',
        label: 'Continue Your Mentorship Journey',
        path: '/dashboard',
      },
      paragraph(
        "That's the end of this little getting-started series, but it doesn't have to be the end of your growth.",
      ),
      paragraph(
        "I'll be back in your inbox with more tips, useful resources and ideas to help you make the most of Median.",
      ),
      paragraph(
        'Until then, keep learning, keep asking questions and keep taking those small steps forward.',
      ),
      paragraph("I'm rooting for you!"),
    ],
    signature: MIDE_SIGNATURE,
  }),
];
