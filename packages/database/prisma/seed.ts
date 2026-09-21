import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDUSTRY_ROLES: Record<string, string[]> = {
  Technology: [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Mobile Developer (iOS)", "Mobile Developer (Android)", "Game Developer", "Unity Developer",
    "Data Scientist", "Data Analyst", "Data Engineer", "Machine Learning Engineer", "AI Engineer",
    "NLP Engineer", "Computer Vision Engineer", "DevOps Engineer", "Site Reliability Engineer (SRE)",
    "Cloud Architect (AWS/GCP/Azure)", "Solutions Architect", "Systems Architect", "Product Manager",
    "Technical Product Manager", "Product Owner", "Scrum Master", "Agile Coach", "Engineering Manager",
    "Director of Engineering", "CTO (Chief Technology Officer)", "CIO (Chief Information Officer)",
    "QA Engineer", "SDET (Software Development Engineer in Test)", "Test Automation Engineer",
    "Cybersecurity Analyst", "Security Engineer", "Penetration Tester", "Information Security Officer",
    "Systems Administrator", "Database Administrator (DBA)", "Network Engineer", "IT Support Specialist",
    "AR/VR Developer", "Blockchain Developer", "Smart Contract Engineer", "Web3 Developer",
    "Developer Advocate", "Developer Relations (DevRel)", "Technical Writer", "ERP Consultant"
  ],
  Design: [
    "Product Designer", "UI Designer", "UX Designer", "UX Researcher", "Interaction Designer",
    "Graphic Designer", "Visual Designer", "Art Director", "Creative Director",
    "Motion Graphics Designer", "3D Artist", "Animator", "Brand Designer",
    "Industrial Designer", "Interior Designer", "Service Designer", "UX Writer",
    "Game Designer", "Level Designer", "Sound Designer", "Packaging Designer",
    "Type Designer", "Illustrator", "Web Designer", "Print Designer"
  ],
  Marketing: [
    "Marketing Manager", "Digital Marketing Specialist", "Content Marketing Manager",
    "Content Strategist", "SEO Specialist", "SEM/PPC Specialist", "Social Media Manager",
    "Community Manager", "Performance Marketer", "Growth Hacker", "Brand Manager",
    "Copywriter", "Email Marketing Specialist", "Marketing Analyst", "Event Marketing Manager",
    "Product Marketing Manager", "Public Relations (PR) Manager", "Media Buyer",
    "Affiliate Marketing Manager", "Market Research Analyst", "Communications Director",
    "Influencer Marketing Manager", "CMO (Chief Marketing Officer)"
  ],
  Sales: [
    "Account Executive (AE)", "Sales Development Representative (SDR)", "Business Development Representative (BDR)",
    "Business Development Manager", "Customer Success Manager (CSM)", "Key Account Manager",
    "Sales Manager", "Regional Sales Director", "VP of Sales", "Sales Engineer", "Pre-sales Consultant",
    "Revenue Operations (RevOps) Analyst", "Sales Enablement Manager", "Inside Sales Representative",
    "Field Sales Representative", "Channel Sales Manager", "Chief Revenue Officer (CRO)",
    "Client Partner", "Strategic Partnerships Manager"
  ],
  Finance: [
    "Financial Analyst", "Investment Banker", "Accountant", "Certified Public Accountant (CPA)",
    "Auditor", "Financial Controller", "CFO (Chief Financial Officer)", "Wealth Advisor",
    "Actuary", "Risk Manager", "Compliance Officer", "Portfolio Manager", "Quantitative Analyst (Quant)",
    "Tax Consultant", "Credit Analyst", "Private Equity Analyst", "Venture Capitalist",
    "Treasury Analyst", "Fraud Investigator", "Economist", "Underwriter", "Claims Adjuster",
    "Hedge Fund Manager", "Financial Planner", "Equity Research Analyst"
  ],
  Healthcare: [
    "Physician / Doctor", "Registered Nurse (RN)", "Nurse Practitioner (NP)", "Pharmacist",
    "Medical Researcher", "Healthcare Administrator", "Public Health Specialist",
    "Clinical Trial Manager", "Therapist / Counselor", "Psychiatrist", "Psychologist",
    "Dentist", "Surgeon", "Physical Therapist", "Occupational Therapist",
    "Radiologist", "Paramedic", "Medical Biller/Coder", "Chief Medical Officer (CMO)",
    "Biomedical Engineer", "Genetic Counselor", "Veterinarian", "Optometrist",
    "Chiropractor", "Speech-Language Pathologist", "Dietitian / Nutritionist", "Epidemiologist"
  ],
  Education: [
    "Teacher / Educator", "Professor", "Instructional Designer", "EdTech Specialist",
    "School Administrator", "Principal", "Superintendent", "Curriculum Developer",
    "Admissions Counselor", "Academic Advisor", "Special Education Teacher",
    "Corporate Trainer", "Guidance Counselor", "Librarian", "Tutor", "Education Policy Analyst",
    "Dean of Students", "Provost"
  ],
  Consulting: [
    "Management Consultant", "Strategy Consultant", "Operations Consultant",
    "HR Consultant", "IT Consultant", "Financial Consultant", "Healthcare Consultant",
    "Environmental Consultant", "Change Management Consultant", "Partner / Principal",
    "Business Analyst", "Innovation Consultant"
  ],
  "Operations & Logistics": [
    "Operations Manager", "Supply Chain Manager", "Logistics Coordinator",
    "Project Manager", "Program Manager", "Procurement Manager", "Fleet Manager",
    "Inventory Controller", "Quality Assurance Manager", "Warehouse Manager",
    "COO (Chief Operating Officer)", "Facilities Manager", "Supply Chain Analyst",
    "Demand Planner", "Customs Broker", "Freight Forwarder"
  ],
  "Human Resources": [
    "HR Manager", "Technical Recruiter", "Executive Recruiter", "Talent Acquisition Specialist",
    "HR Business Partner (HRBP)", "Compensation & Benefits Manager",
    "Learning & Development (L&D) Specialist", "Diversity & Inclusion (DEI) Manager",
    "Employee Relations Manager", "Chief Human Resources Officer (CHRO)",
    "HRIS Analyst", "Employer Branding Specialist"
  ],
  Legal: [
    "Lawyer / Attorney", "Corporate Counsel", "Paralegal", "Legal Assistant",
    "Compliance Officer", "Contract Negotiator", "Intellectual Property (IP) Lawyer",
    "Judge", "Mediator", "General Counsel", "Litigator", "Public Defender",
    "Patent Attorney", "Tax Attorney", "Immigration Lawyer"
  ],
  "Media & Entertainment": [
    "Journalist", "Editor", "Producer", "Director", "Actor", "Musician",
    "Video Editor", "Audio Engineer", "Sound Designer", "Photographer",
    "Videographer", "Talent Agent", "Broadcast Engineer", "Content Creator / Influencer",
    "Screenwriter", "Cinematographer", "Art Director (Film/TV)", "Casting Director",
    "Showrunner", "Publicist"
  ],
  Manufacturing: [
    "Plant Manager", "Manufacturing Engineer", "Production Supervisor",
    "Quality Control Inspector", "Assembly Line Worker", "Maintenance Technician",
    "CNC Operator", "Safety Manager", "Industrial Engineer", "Process Engineer",
    "Supply Chain Engineer", "Tool and Die Maker"
  ],
  "Real Estate": [
    "Real Estate Agent / Broker", "Property Manager", "Real Estate Developer",
    "Appraiser", "Leasing Consultant", "Title Examiner", "Mortgage Broker",
    "Real Estate Analyst", "Commercial Real Estate Agent", "Asset Manager",
    "Facility Manager"
  ],
  Agriculture: [
    "Farmer / Rancher", "Agronomist", "Agricultural Engineer", "Farm Manager",
    "Food Scientist", "Horticulturist", "Agricultural Economist", "Soil Scientist",
    "Plant Breeder", "Precision Agriculture Specialist"
  ],
  "Energy & Environment": [
    "Petroleum Engineer", "Geologist", "Environmental Scientist", "Solar Panel Installer",
    "Wind Turbine Technician", "Sustainability Consultant", "Energy Analyst",
    "Nuclear Engineer", "Conservation Scientist", "Hydrologist", "Ecologist",
    "Environmental Engineer", "Climate Scientist"
  ],
  Retail: [
    "Store Manager", "Retail Sales Associate", "Merchandiser", "Buyer",
    "Visual Merchandiser", "Loss Prevention Specialist", "E-commerce Manager",
    "Retail Operations Manager", "Category Manager", "Personal Shopper"
  ],
  Hospitality: [
    "Hotel Manager", "Restaurant Manager", "Executive Chef", "Sous Chef",
    "Event Planner", "Travel Agent", "Sommelier", "Flight Attendant", "Tour Guide",
    "Concierge", "Catering Manager", "Food & Beverage Director"
  ],
  Government: [
    "Civil Servant", "Policy Analyst", "Diplomat", "Urban Planner",
    "Intelligence Analyst", "Public Relations Specialist", "Social Worker",
    "Military Officer", "Elected Official", "City Manager", "Foreign Service Officer",
    "Customs Officer"
  ],
  "Non-Profit": [
    "Executive Director", "Grant Writer", "Fundraising Manager",
    "Program Director", "Volunteer Coordinator", "Advocacy Director",
    "Community Organizer", "Philanthropy Manager", "NGO Worker"
  ],
  "Architecture & Construction": [
    "Architect", "Civil Engineer", "Structural Engineer", "Construction Manager",
    "General Contractor", "Surveyor", "Urban Designer", "Landscape Architect",
    "Electrician", "Plumber", "Carpenter", "Welder", "Heavy Equipment Operator"
  ],
  "Automotive & Aerospace": [
    "Automotive Engineer", "Aerospace Engineer", "Mechanic", "Avionics Technician",
    "Fleet Manager", "Test Driver", "Pilot", "Air Traffic Controller",
    "Quality Assurance Engineer (Auto/Aero)", "Supply Chain Manager (Auto/Aero)"
  ],
  Telecommunications: [
    "Telecom Engineer", "Network Architect", "Field Service Technician",
    "Wireless Communications Engineer", "Fiber Optic Technician", "VoIP Engineer",
    "Telecommunications Manager"
  ],
  Pharmaceuticals: [
    "Pharmacologist", "Clinical Research Associate (CRA)", "Regulatory Affairs Specialist",
    "Medical Science Liaison (MSL)", "Formulation Scientist", "Biostatistician",
    "Drug Safety Associate", "Quality Assurance (QA) Specialist"
  ],
  Insurance: [
    "Underwriter", "Claims Adjuster", "Actuary", "Insurance Broker",
    "Loss Control Specialist", "Risk Analyst", "Insurance Investigator"
  ],
  "Sports & Fitness": [
    "Personal Trainer", "Athletic Coach", "Sports Agent", "Sports Psychologist",
    "Physiotherapist", "Nutritionist", "Fitness Instructor", "Sports Analyst",
    "Athletic Director"
  ],
  "E-commerce": [
    "E-commerce Manager", "Digital Merchandiser", "Supply Chain Analyst",
    "Fulfillment Center Manager", "Dropshipping Specialist", "Conversion Rate Optimization (CRO) Expert",
    "Marketplace Manager"
  ],
  "Data & Analytics": [
    "Chief Data Officer (CDO)", "Data Architect", "Business Intelligence (BI) Analyst",
    "Data Modeler", "Data Governance Manager", "Master Data Management (MDM) Specialist",
    "Web Analyst", "Quantitative Analyst"
  ],
  "Research & Science": [
    "Research Scientist", "Lab Technician", "Microbiologist", "Chemist",
    "Physicist", "Astronomer", "Materials Scientist", "Bioinformatician",
    "Principal Investigator"
  ],
  "Customer Support": [
    "Customer Support Specialist", "Technical Support Engineer", "Call Center Manager",
    "Customer Experience (CX) Manager", "Help Desk Technician", "Client Success Manager",
    "Tier 3 Support Specialist"
  ]
};

async function main() {
  console.log('Seeding industries and roles...');
  for (const [industryName, roles] of Object.entries(INDUSTRY_ROLES)) {
    const industry = await prisma.industry.upsert({
      where: { name: industryName },
      update: {},
      create: { name: industryName },
    });

    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { name_industryId: { name: roleName, industryId: industry.id } },
        update: {},
        create: { name: roleName, industryId: industry.id },
      });
    }
  }

  console.log('Seeding sample approved mentors for explore page...');
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
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
