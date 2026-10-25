/**
 * Demo dataset: the people and content the frontend used to fake with mock
 * data, now written to the database so they go through the real API.
 *
 * Every demo account uses the DEMO_EMAIL_DOMAIN, which is how the purge script
 * (and the API's email sender) recognise demo data. Images live in the web
 * app's public/ folder and are referenced by path.
 */

export const DEMO_EMAIL_DOMAIN = "demo.medianhq.co";

/** Shared password for every demo account, so the team can sign in as any of them */
export const DEMO_PASSWORD = "MedianDemo#2026";

export type DemoMentor = {
  key: string;
  firstName: string;
  lastName: string;
  /** Sign-in email; must end with DEMO_EMAIL_DOMAIN so the purge finds it */
  email: string;
  jobTitle: string;
  company: string;
  location: string;
  industry: string;
  experience: "1-3 years" | "3-5 years" | "5-10 years" | "10+ years";
  bio: string;
  avatarUrl: string;
  /** Price of their paid sessions in naira; 0 means they only offer free sessions */
  price: number;
  /** Weekdays they take sessions, 0 = Sunday; empty means fully booked / no slots */
  availableDays: number[];
  startTime: string;
  endTime: string;
};

export const DEMO_MENTORS: DemoMentor[] = [
  {
    key: "abdulrahman",
    firstName: "Abdulrahman",
    lastName: "Hassan",
    email: "abdulrahman.hassan@demo.medianhq.co",
    jobTitle: "Senior Designer",
    company: "Andela",
    location: "London",
    industry: "Technology",
    experience: "5-10 years",
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone. I want to hear about your challenges. Together, we will tap into your inner strengths and find joy when things get complicated.",
    avatarUrl: "/mentors/mentor-1.png",
    price: 20000,
    availableDays: [1, 2, 3, 4, 5],
    startTime: "9:00 AM",
    endTime: "5:00 PM",
  },
  {
    key: "amina",
    firstName: "Amina",
    lastName: "Yusuf",
    email: "amina.yusuf@demo.medianhq.co",
    jobTitle: "VP of Product",
    company: "Paystack",
    location: "Lagos",
    industry: "Technology",
    experience: "10+ years",
    bio: "Scaling fintech products across emerging markets. Let's talk user retention and go-to-market.",
    avatarUrl: "/mentors/mentor-2.png",
    price: 25000,
    // Fully booked: shows the "no open times" state
    availableDays: [],
    startTime: "9:00 AM",
    endTime: "5:00 PM",
  },
  {
    key: "chidinma",
    firstName: "Chidinma",
    lastName: "Okafor",
    email: "chidinma.okafor@demo.medianhq.co",
    jobTitle: "Engineering Director",
    company: "Moniepoint",
    location: "London",
    industry: "Software Engineering",
    experience: "5-10 years",
    bio: "Helping engineers transition into high-impact leadership roles and navigate distributed systems.",
    avatarUrl: "/mentors/mentor-3.png",
    price: 0,
    availableDays: [1, 3, 5],
    startTime: "2:00 PM",
    endTime: "6:00 PM",
  },
  {
    key: "tunde",
    firstName: "Tunde",
    lastName: "Balogun",
    email: "tunde.balogun@demo.medianhq.co",
    jobTitle: "Head of Growth",
    company: "Flutterwave",
    location: "San Francisco",
    industry: "Business Development",
    experience: "3-5 years",
    bio: "Specializing in customer acquisition funnels, retention mechanics, and international expansion.",
    avatarUrl: "/mentors/mentor-4.png",
    price: 30000,
    availableDays: [2, 4],
    startTime: "10:00 AM",
    endTime: "2:00 PM",
  },
  {
    key: "zainab",
    firstName: "Zainab",
    lastName: "Adeleke",
    email: "zainab.adeleke@demo.medianhq.co",
    jobTitle: "Senior Product Designer",
    company: "Spotify",
    location: "Berlin",
    industry: "Design",
    experience: "3-5 years",
    bio: "Passionate about inclusive design systems, user research methodologies, and career mentorship.",
    avatarUrl: "/mentors/mentor-2.png",
    price: 0,
    availableDays: [1, 2, 3, 4],
    startTime: "1:00 PM",
    endTime: "5:00 PM",
  },
  {
    key: "femi",
    firstName: "Femi",
    lastName: "Adebayo",
    email: "femi.adebayo@demo.medianhq.co",
    jobTitle: "Financial Analyst & Advisor",
    company: "PwC",
    location: "London",
    industry: "Finance",
    experience: "10+ years",
    bio: "Advising high-growth startups on capital allocation, financial models, and seed funding rounds.",
    avatarUrl: "/mentors/mentor-1.png",
    price: 20000,
    availableDays: [1, 3],
    startTime: "11:00 AM",
    endTime: "3:00 PM",
  },
  {
    key: "folake",
    firstName: "Folake",
    lastName: "Williams",
    email: "folake.williams@demo.medianhq.co",
    jobTitle: "Management Consultant",
    company: "McKinsey & Co",
    location: "New York",
    industry: "Consulting",
    experience: "10+ years",
    bio: "Strategy formulation, digital transformation, and business model innovation for enterprise leaders.",
    avatarUrl: "/mentors/mentor-3.png",
    price: 35000,
    availableDays: [2, 3, 4],
    startTime: "3:00 PM",
    endTime: "6:00 PM",
  },
  {
    key: "david",
    firstName: "David",
    lastName: "Adeleke",
    email: "david.adeleke@demo.medianhq.co",
    jobTitle: "Product Lead",
    company: "Google",
    location: "London",
    industry: "Technology",
    experience: "5-10 years",
    bio: "Mentoring ambitious PMs on roadmap execution, cross-functional stakeholder buy-in, and metrics.",
    avatarUrl: "/mentors/mentor-4.png",
    price: 0,
    availableDays: [1, 2, 3, 4, 5],
    startTime: "4:00 PM",
    endTime: "7:00 PM",
  },
  {
    key: "kemi",
    firstName: "Kemi",
    lastName: "Johnson",
    email: "kemi.johnson@demo.medianhq.co",
    jobTitle: "Investment Associate",
    company: "Goldman Sachs",
    location: "London",
    industry: "Finance",
    experience: "1-3 years",
    bio: "Guiding young finance professionals on investment banking interviews, modeling, and private equity.",
    avatarUrl: "/mentors/mentor-2.png",
    price: 0,
    availableDays: [2, 4],
    startTime: "2:00 PM",
    endTime: "5:00 PM",
  },
  {
    key: "ibrahim",
    firstName: "Ibrahim",
    lastName: "Sadiq",
    email: "ibrahim.sadiq@demo.medianhq.co",
    jobTitle: "Strategy & Operations Lead",
    company: "Uber",
    location: "Dubai",
    industry: "Business Operations",
    experience: "3-5 years",
    bio: "Unlocking efficiency in complex operational networks and international marketplaces.",
    avatarUrl: "/mentors/mentor-1.png",
    price: 20000,
    availableDays: [1, 3, 5],
    startTime: "10:00 AM",
    endTime: "1:00 PM",
  },
  {
    key: "ngozi",
    firstName: "Ngozi",
    lastName: "Eze",
    email: "ngozi.eze@demo.medianhq.co",
    jobTitle: "Principal Consultant",
    company: "Bain & Company",
    location: "Lagos",
    industry: "Consulting",
    experience: "5-10 years",
    bio: "Hands-on guidance on case interview prep, structured problem solving, and consulting careers.",
    avatarUrl: "/mentors/mentor-3.png",
    price: 25000,
    availableDays: [6],
    startTime: "1:00 PM",
    endTime: "4:00 PM",
  },
  {
    key: "oluwaseun",
    firstName: "Oluwaseun",
    lastName: "Alabi",
    email: "oluwaseun.alabi@demo.medianhq.co",
    jobTitle: "Senior Cloud Architect",
    company: "Microsoft",
    location: "Dublin",
    industry: "Software Engineering",
    experience: "1-3 years",
    bio: "Helping software engineers master system design, Azure architecture, and cloud migrations.",
    avatarUrl: "/mentors/mentor-4.png",
    price: 0,
    availableDays: [1, 2, 4, 5],
    startTime: "11:00 AM",
    endTime: "2:00 PM",
  },
];

export type DemoMentee = {
  key: string;
  firstName: string;
  lastName: string;
  /** Sign-in email; must end with DEMO_EMAIL_DOMAIN so the purge finds it */
  email: string;
  currentRole: string;
  industry: string;
  goals: string[];
  goalDescription: string;
  timeframe: string;
  avatarUrl: string;
};

export const DEMO_MENTEES: DemoMentee[] = [
  {
    key: "hannah",
    firstName: "Hannah",
    lastName: "Oladejo",
    email: "hannah.oladejo@demo.medianhq.co",
    currentRole: "Junior Data Analyst @ GTBank",
    industry: "Finance",
    goals: ["Career switch", "Fintech", "Healthtech"],
    goalDescription: "I've been job hunting for a while and I've not gotten positive results. I'd like to know the things I'm doing wrong.",
    timeframe: "3-6 months",
    avatarUrl: "/sessions/mentor-hannah.jpg",
  },
  {
    key: "amara",
    firstName: "Amara",
    lastName: "Okafor",
    email: "amara.okafor@demo.medianhq.co",
    currentRole: "Junior Data Analyst @ GTBank",
    industry: "Finance",
    goals: ["CV review", "Product management"],
    goalDescription: "Moving from analytics into product management at a fintech.",
    timeframe: "6-12 months",
    avatarUrl: "/mentors/mentor-3.png",
  },
  {
    key: "marcus",
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus.vance@demo.medianhq.co",
    currentRole: "Software Engineer @ Interswitch",
    industry: "Technology",
    goals: ["Engineering leadership"],
    goalDescription: "Preparing for my first tech lead role.",
    timeframe: "3-6 months",
    avatarUrl: "/mentors/mentor-1.png",
  },
  {
    key: "anna",
    firstName: "Anna",
    lastName: "Taylor",
    email: "anna.taylor@demo.medianhq.co",
    currentRole: "Product Manager @ Kuda",
    industry: "Technology",
    goals: ["Stakeholder management", "Promotion"],
    goalDescription: "Working toward a senior PM promotion this year.",
    timeframe: "Under 3 months",
    avatarUrl: "/mentors/mentor-2.png",
  },
  {
    key: "chioma",
    firstName: "Chioma",
    lastName: "Nwosu",
    email: "chioma.nwosu@demo.medianhq.co",
    currentRole: "Associate @ KPMG",
    industry: "Consulting",
    goals: ["Case interviews", "Consulting"],
    goalDescription: "Breaking into strategy consulting.",
    timeframe: "3-6 months",
    avatarUrl: "/mentors/mentor-4.png",
  },
  {
    key: "tobi",
    firstName: "Tobi",
    lastName: "Adewale",
    email: "tobi.adewale@demo.medianhq.co",
    currentRole: "Growth Associate @ Piggyvest",
    industry: "Business Development",
    goals: ["Growth marketing", "Fintech"],
    goalDescription: "Learning how to run acquisition experiments that scale.",
    timeframe: "6-12 months",
    avatarUrl: "/sessions/mentor-abdullah.png",
  },
];

export type DemoSessionPackage = {
  title: string;
  description: string;
  durationMinutes: number;
  /** "free" is always free; "paid" uses the mentor's price (free for free mentors) */
  pricing: "free" | "paid";
};

/** Every demo mentor offers these, matching the designs' three packages */
export const DEMO_SESSION_PACKAGES: DemoSessionPackage[] = [
  {
    title: "Get to Know You",
    description: "A quick intro chat to see if we're a good fit before booking longer strategy sessions.",
    durationMinutes: 15,
    pricing: "free",
  },
  {
    title: "CV Review",
    description: "Deep dive into your CV with actionable feedback, layout improvements and positioning tips.",
    durationMinutes: 30,
    pricing: "paid",
  },
  {
    title: "Career Positioning",
    description: "Strategic advice on your next career move, salary negotiation, support or portfolio positioning.",
    durationMinutes: 60,
    pricing: "paid",
  },
];

/** Review comments mentees leave mentors, used for each mentor's past sessions */
export const DEMO_MENTEE_REVIEWS: { rating: number; comment: string }[] = [
  {
    rating: 5,
    comment: "The advice was incredibly actionable. It helped me reframe my approach to stakeholder management, which directly led to my promotion.",
  },
  {
    rating: 5,
    comment: "The CV review completely changed how I frame my experience. Landed interviews within two weeks!",
  },
  {
    rating: 4,
    comment: "Extremely insightful session on scaling fintech products. Patient, thoughtful, and full of frameworks I can use immediately.",
  },
  {
    rating: 5,
    comment: "Clear, honest feedback and a concrete plan for the next three months.",
  },
  {
    rating: 4,
    comment: "Great session. I came away knowing exactly what to work on before my next interview.",
  },
];

/** The mentor's feedback on a mentee after a completed session */
export const DEMO_MENTOR_FEEDBACK = {
  rating: 4,
  comment: "Came well-prepared with specific questions, was receptive to feedback, and took detailed notes. Great mentee to work with.",
  actionItems: [
    { id: "item-1", text: "Restructure your CV to lead with impact metrics", completed: true },
    { id: "item-2", text: "Add 3 quantified achievements per role", completed: true },
    { id: "item-3", text: "Remove your outdated skills section", completed: false },
    { id: "item-4", text: "Update your LinkedIn headline to match your target role", completed: false },
  ],
  followUpNotes: "Discussed CV structure and ATS optimization strategies. Shared a CV template during the session. Follow-up recommended in 2 weeks to review the revised CV.",
};

export type DemoMessage = { from: "mentee" | "mentor"; content: string; minutesAgo: number };

export const DEMO_CONVERSATIONS: { mentee: string; mentor: string; messages: DemoMessage[] }[] = [
  {
    mentee: "hannah",
    mentor: "abdulrahman",
    messages: [
      {
        from: "mentee",
        content: "I'm really looking forward to our session. I've outlined a few goals for this quarter and would love your input on what to focus on first.",
        minutesAgo: 95,
      },
      {
        from: "mentor",
        content: "Great to hear! Let's look at your long-term goals and dial in exactly which areas need the most attention. I'll review your notes before we meet.",
        minutesAgo: 80,
      },
      {
        from: "mentee",
        content: "Thank you! I've shared my updated CV as well.",
        minutesAgo: 75,
      },
    ],
  },
  {
    mentee: "hannah",
    mentor: "amina",
    messages: [
      {
        from: "mentee",
        content: "Hi Amina, thanks for the session last week. I've started on the action items you suggested.",
        minutesAgo: 60 * 26,
      },
      {
        from: "mentor",
        content: "Glad to hear it! Feel free to share your draft roadmap ahead of our next call so I can review it.",
        minutesAgo: 60 * 25,
      },
    ],
  },
  {
    mentee: "amara",
    mentor: "abdulrahman",
    messages: [
      {
        from: "mentee",
        content: "Good day, I wanted to let you know that I've updated my portfolio with the feedback from our session.",
        minutesAgo: 60 * 48,
      },
    ],
  },
];
