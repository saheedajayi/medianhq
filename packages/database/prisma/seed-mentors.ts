import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_MENTORS = [
  {
    email: 'abdulrahman.hassan@example.com',
    firstName: 'Abdulrahman',
    lastName: 'Hassan',
    headline: 'Senior Product Designer & Design Systems Lead',
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone to build great products. Let's design intuitive user experiences.",
    industry: 'Technology',
    experience: '5-10 years',
    company: 'Andela',
    jobTitle: 'Senior Designer',
    location: 'London, UK',
    pricePerSession: 0,
    currency: 'NGN',
  },
  {
    email: 'amina.yusuf@example.com',
    firstName: 'Amina',
    lastName: 'Yusuf',
    headline: 'VP of Product @ Paystack',
    bio: "Scaling fintech products across emerging markets. Let's talk user retention, metrics that matter, and go-to-market strategies.",
    industry: 'Technology',
    experience: '10+ years',
    company: 'Paystack',
    jobTitle: 'VP of Product',
    location: 'Lagos, Nigeria',
    pricePerSession: 25000,
    currency: 'NGN',
  },
  {
    email: 'chidinma.okafor@example.com',
    firstName: 'Chidinma',
    lastName: 'Okafor',
    headline: 'Engineering Director @ Moniepoint',
    bio: 'Helping engineers transition into high-impact leadership roles, scale engineering orgs, and navigate distributed cloud architectures.',
    industry: 'Technology',
    experience: '10+ years',
    company: 'Moniepoint',
    jobTitle: 'Engineering Director',
    location: 'London, UK',
    pricePerSession: 0,
    currency: 'NGN',
  },
  {
    email: 'babatunde.adeyemi@example.com',
    firstName: 'Babatunde',
    lastName: 'Adeyemi',
    headline: 'Partner @ McKinsey & Company',
    bio: 'Advising executive boards and founders across Africa on corporate strategy, digital transformation, and organizational scaling.',
    industry: 'Consulting',
    experience: '10+ years',
    company: 'McKinsey & Company',
    jobTitle: 'Partner',
    location: 'Lagos, Nigeria',
    pricePerSession: 50000,
    currency: 'NGN',
  },
  {
    email: 'fatima.bello@example.com',
    firstName: 'Fatima',
    lastName: 'Bello',
    headline: 'Chief Financial Officer @ Flutterwave',
    bio: 'Expertise in cross-border treasury, financial modeling, capital raising, and navigating complex African regulatory landscapes.',
    industry: 'Finance',
    experience: '10+ years',
    company: 'Flutterwave',
    jobTitle: 'Chief Financial Officer',
    location: 'Nairobi, Kenya',
    pricePerSession: 40000,
    currency: 'NGN',
  },
  {
    email: 'david.adeleke@example.com',
    firstName: 'David',
    lastName: 'Adeleke',
    headline: 'Founder & CEO @ Communique Media',
    bio: 'Building sustainable media and technology ventures in Africa. Specialized in brand narrative, growth strategy, and monetization.',
    industry: 'Business',
    experience: '5-10 years',
    company: 'Communique Media',
    jobTitle: 'Founder & CEO',
    location: 'Lagos, Nigeria',
    pricePerSession: 0,
    currency: 'NGN',
  },
];

async function main() {
  console.log('Seeding sample mentors...');
  for (const m of SAMPLE_MENTORS) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        firstName: m.firstName,
        lastName: m.lastName,
        role: 'MENTOR',
        emailVerifiedAt: new Date(),
      },
      create: {
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        role: 'MENTOR',
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.mentorProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: m.headline,
        bio: m.bio,
        industry: m.industry,
        experience: m.experience,
        company: m.company,
        jobTitle: m.jobTitle,
        location: m.location,
        pricePerSession: m.pricePerSession,
        currency: m.currency,
        status: 'APPROVED',
      },
      create: {
        userId: user.id,
        headline: m.headline,
        bio: m.bio,
        industry: m.industry,
        experience: m.experience,
        company: m.company,
        jobTitle: m.jobTitle,
        location: m.location,
        pricePerSession: m.pricePerSession,
        currency: m.currency,
        status: 'APPROVED',
      },
    });
    console.log(`Seeded mentor: ${m.firstName} ${m.lastName}`);
  }
  console.log('Finished seeding sample mentors.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
