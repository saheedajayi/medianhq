export interface LegalSection {
  id: string;
  number: number;
  title: string;
  content: string;
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export const PRIVACY_NOTICE: LegalDocument = {
  title: "Privacy Notice",
  effectiveDate: "03/08/2026",
  sections: [
    {
      id: "who-we-are",
      number: 1,
      title: "Who We Are",
      content:
        "Median, operated by Median Ltd, operates a mentorship platform connecting mentors and mentees. Contact: hello@median.co.",
    },
    {
      id: "what-we-collect",
      number: 2,
      title: "What We Collect",
      content:
        "Account details (name, email, phone, password), Profile information (bio, skills, employer, role, CV, links), Matching preferences (goals, interests, availability), Session activity (messages, notes, recordings if consented), Ratings & feedback, Payment information (handled by Paystack/Flutterwave - Median never sees card details), Usage data (login times, device type).",
    },
    {
      id: "why-we-use-your-data",
      number: 3,
      title: "Why We Use Your Data",
      content:
        "Create and run your account (necessary for service), Match you with mentor/mentee (core purpose, consent), Enable messaging and session notes (deliver mentorship experience), Show ratings on profiles (build trust), Process payments via Paystack/Flutterwave (complete paid sessions), Keep platform secure (legitimate interest), Send product updates/marketing (only with opt-in), Feature profile in marketing (only with opt-in).",
    },
    {
      id: "who-can-see-your-data",
      number: 4,
      title: "Who Can See Your Data",
      content:
        "Your matched mentor/mentee sees shared profile info and messages. Median staff access content only when necessary (safety, disputes) - access is logged. Payment partners receive only transaction data. We do not sell your data.",
    },
    {
      id: "marketing-promotional-use",
      number: 5,
      title: "Marketing & Promotional Use",
      content:
        "With opt-in consent, Median may feature your profile, photo, story, ratings in marketing - social media, spotlights, spotlights, testimonials. Completely optional. You can switch on/off from account settings.",
    },
    {
      id: "how-long-we-keep-your-data",
      number: 6,
      title: "How Long We Keep Your Data",
      content:
        "Profile - while account active. Session notes/messages - 24 months. Call recordings - 6 months. Reviews - 12 months. Inactive account - notify at 12 months, delete at 24 months. Payment records - 7 years. After deletion - removed within 30 days, backups within 90 days.",
    },
    {
      id: "your-rights",
      number: 7,
      title: "Your Rights",
      content:
        "Access & download your data. Correct inaccurate information. Delete your account (self-serve). Withdraw consent for optional features. Complain to DPO or Nigeria Data Protection Commission. Response within 30 days.",
    },
    {
      id: "keeping-your-data-safe",
      number: 8,
      title: "Keeping Your Data Safe",
      content:
        "Data encrypted in transit and storage. Internal access restricted. Card details handled by licensed payment partners. Breach notification to authorities and users.",
    },
    {
      id: "changes-to-this-notice",
      number: 9,
      title: "Changes to This Notice",
      content:
        "May update as platform or law changes. Material changes notified in-app.",
    },
    {
      id: "contact-us",
      number: 10,
      title: "Contact Us",
      content:
        "If you have any questions or wish to exercise your rights under this notice, please contact us at hello@median.co.",
    },
  ],
};

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: "Terms & Conditions",
  effectiveDate: "03/08/2026",
  sections: [
    {
      id: "introduction-acceptance",
      number: 1,
      title: "Introduction & Acceptance",
      content:
        "These Terms & Conditions ('Terms') govern access to and use of the Median platform, app, and website (together, the 'Platform'), operated by Median Ltd ('Median', 'we', 'us', 'our'). By creating an account or using the Platform, you ('you', 'User') agree to be bound by these Terms. If you do not agree, you must not use the Platform. Our collection and use of your personal data is governed separately by our Privacy Notice, which forms part of your agreement with us.",
    },
    {
      id: "eligibility",
      number: 2,
      title: "Eligibility",
      content:
        "You must be at least 18 years old to create a Median account. You must provide accurate, current, and complete information when registering, and keep it up to date. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
    },
    {
      id: "the-service",
      number: 3,
      title: "The Service",
      content:
        "Median provides an online mentorship platform connecting mentors and mentees for sessions, structured career growth, and professional advice.",
    },
    {
      id: "payments",
      number: 4,
      title: "Payments",
      content:
        "Where a session involves a fee, payment is processed by Paystack and/or Flutterwave. Median does not collect or store card details. All fees are displayed before confirmation. Median charges a service fee of 6% + $1 or 4% + ₦100. You are responsible for applicable taxes.",
    },
    {
      id: "user-conduct",
      number: 5,
      title: "User Conduct",
      content:
        "You agree not to: provide false information, harass other users, solicit unrelated business, share personal information without consent, upload unlawful content, or interfere with Platform security. Violations may result in account suspension or termination.",
    },
    {
      id: "content-profile-information",
      number: 6,
      title: "Content & Profile Information",
      content:
        "You retain ownership of your content but grant Median a license to display it. Median will only use your profile in marketing where you have opted in. Session notes are handled per Privacy Notice retention periods.",
    },
    {
      id: "ratings-reviews",
      number: 7,
      title: "Ratings & Reviews",
      content:
        "Users may rate and review one another after sessions. Reviews must be honest and consistent with User Conduct. Median may remove violating reviews.",
    },
    {
      id: "intellectual-property",
      number: 8,
      title: "Intellectual Property",
      content:
        "The Median name, logo, app, and software are property of Median Ltd, protected by applicable IP laws.",
    },
    {
      id: "disclaimers-limitation-of-liability",
      number: 9,
      title: "Disclaimers & Limitation of Liability",
      content:
        "The Platform is provided 'as is' without warranties. Median is not liable for conduct of any mentor or mentee. Median's total liability is limited to fees paid in the preceding 3 months.",
    },
    {
      id: "suspension-termination",
      number: 10,
      title: "Suspension & Termination",
      content:
        "You may close your account at any time. Median may suspend or terminate for breach, fraud, or safety concerns.",
    },
    {
      id: "dispute-resolution",
      number: 11,
      title: "Dispute Resolution",
      content:
        "Median encourages users to raise disputes. Median's Support team may mediate but is not obligated to act as arbitrator.",
    },
    {
      id: "changes-to-these-terms",
      number: 12,
      title: "Changes to These Terms",
      content:
        "Median may update Terms from time to time. Material changes will be notified in-app.",
    },
    {
      id: "governing-law",
      number: 13,
      title: "Governing Law",
      content:
        "These Terms are governed by the laws of Nigeria. Disputes subject to exclusive jurisdiction of Lagos State courts.",
    },
    {
      id: "contact-us",
      number: 14,
      title: "Contact Us",
      content:
        "If you have any questions or concerns regarding these Terms, please contact us at: hello@median.co",
    },
  ],
};
