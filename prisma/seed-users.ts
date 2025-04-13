import { PostGradType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for users
const mockUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    bcEmail: 'alex.johnson@bc.edu',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    company: 'Google',
    title: 'Software Engineer',
    postGradType: 'work' as PostGradType,
    program: 'Computer Science',
    isOnboarded: true,
    industryName: 'technology',
  },
  {
    name: 'Jamie Smith',
    email: 'jamie.smith@example.com',
    bcEmail: 'jamie.smith@bc.edu',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    company: 'Goldman Sachs',
    title: 'Investment Analyst',
    postGradType: 'work' as PostGradType,
    program: 'Finance',
    boroughDistrict: 'Manhattan',
    isOnboarded: true,
    industryName: 'finance',
  },
  {
    name: 'Taylor Wilson',
    email: 'taylor.wilson@example.com',
    bcEmail: 'taylor.wilson@bc.edu',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    school: 'Stanford University',
    postGradType: 'school' as PostGradType,
    program: 'MBA',
    isOnboarded: true,
  },
  {
    name: 'Morgan Lee',
    email: 'morgan.lee@example.com',
    bcEmail: 'morgan.lee@bc.edu',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    company: 'McKinsey',
    title: 'Consultant',
    postGradType: 'work' as PostGradType,
    program: 'Business',
    isOnboarded: true,
    industryName: 'consulting',
  },
  {
    name: 'Jordan Rivera',
    email: 'jordan.rivera@example.com',
    bcEmail: 'jordan.rivera@bc.edu',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    company: 'Netflix',
    title: 'Content Strategist',
    postGradType: 'work' as PostGradType,
    program: 'Communications',
    isOnboarded: true,
    industryName: 'media',
  },
  {
    name: 'Casey Brown',
    email: 'casey.brown@example.com',
    bcEmail: 'casey.brown@bc.edu',
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    company: 'Amazon',
    title: 'Product Manager',
    postGradType: 'work' as PostGradType,
    program: 'Marketing',
    isOnboarded: true,
    industryName: 'technology',
  },
  {
    name: 'Riley Garcia',
    email: 'riley.garcia@example.com',
    bcEmail: 'riley.garcia@bc.edu',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    school: 'UT Austin',
    postGradType: 'school' as PostGradType,
    program: 'Law',
    isOnboarded: true,
  },
  {
    name: 'Avery Martinez',
    email: 'avery.martinez@example.com',
    bcEmail: 'avery.martinez@bc.edu',
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    company: 'Deloitte',
    title: 'Auditor',
    postGradType: 'work' as PostGradType,
    program: 'Accounting',
    isOnboarded: true,
    industryName: 'finance',
  },
  {
    name: 'Quinn Thompson',
    email: 'quinn.thompson@example.com',
    bcEmail: 'quinn.thompson@bc.edu',
    city: 'Philadelphia',
    state: 'PA',
    country: 'USA',
    company: "Children's Hospital",
    title: 'Nurse Practitioner',
    postGradType: 'work' as PostGradType,
    program: 'Nursing',
    isOnboarded: true,
    industryName: 'healthcare',
  },
  {
    name: 'Reese Williams',
    email: 'reese.williams@example.com',
    bcEmail: 'reese.williams@bc.edu',
    city: 'Toronto',
    state: '',
    country: 'CAN',
    company: 'Royal Bank of Canada',
    title: 'Financial Analyst',
    postGradType: 'work' as PostGradType,
    program: 'Economics',
    isOnboarded: true,
    industryName: 'finance',
  },
  {
    name: 'Dakota Clark',
    email: 'dakota.clark@example.com',
    bcEmail: 'dakota.clark@bc.edu',
    city: 'London',
    state: '',
    country: 'GBR',
    company: 'BBC',
    title: 'Journalist',
    postGradType: 'work' as PostGradType,
    program: 'Journalism',
    isOnboarded: true,
    industryName: 'media',
  },
  {
    name: 'Skyler Rodriguez',
    email: 'skyler.rodriguez@example.com',
    bcEmail: 'skyler.rodriguez@bc.edu',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    school: 'University of Miami',
    postGradType: 'school' as PostGradType,
    program: 'Marine Biology',
    isOnboarded: true,
  },
  {
    name: 'Hayden Nguyen',
    email: 'hayden.nguyen@example.com',
    bcEmail: 'hayden.nguyen@bc.edu',
    city: 'San Diego',
    state: 'CA',
    country: 'USA',
    company: 'Qualcomm',
    title: 'Hardware Engineer',
    postGradType: 'work' as PostGradType,
    program: 'Electrical Engineering',
    isOnboarded: true,
    industryName: 'technology',
  },
  {
    name: 'Parker Kim',
    email: 'parker.kim@example.com',
    bcEmail: 'parker.kim@bc.edu',
    city: 'Washington',
    state: 'DC',
    country: 'USA',
    company: 'Department of Education',
    title: 'Policy Analyst',
    postGradType: 'work' as PostGradType,
    program: 'Public Policy',
    isOnboarded: true,
    industryName: 'education',
  },
  {
    name: 'Drew Patel',
    email: 'drew.patel@example.com',
    bcEmail: 'drew.patel@bc.edu',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    company: 'Coca-Cola',
    title: 'Marketing Specialist',
    postGradType: 'work' as PostGradType,
    program: 'Marketing',
    isOnboarded: true,
    industryName: 'retail',
  },
  {
    name: 'Blake Wilson',
    email: 'blake.wilson@example.com',
    bcEmail: 'blake.wilson@bc.edu',
    city: 'Portland',
    state: 'OR',
    country: 'USA',
    company: 'Nike',
    title: 'Product Designer',
    postGradType: 'work' as PostGradType,
    program: 'Industrial Design',
    isOnboarded: true,
    industryName: 'retail',
  },
];

async function main() {
  console.log('Starting user seeding...');

  // Clear existing users
  console.log('Clearing existing users...');
  await prisma.user.deleteMany({});

  // Get industry IDs
  console.log('Fetching industry IDs...');
  const industries = await prisma.industry.findMany();
  const industryMap = new Map(industries.map((industry) => [industry.name, industry.id]));

  if (industries.length === 0) {
    console.error('No industries found. Please run the industry seed script first.');
    process.exit(1);
  }

  // Seed users
  console.log('Seeding users...');
  for (const user of mockUsers) {
    const { industryName, ...userData } = user;

    await prisma.user.create({
      data: {
        ...userData,
        industry: industryName
          ? {
              connect: { id: industryMap.get(industryName) },
            }
          : undefined,
        visibilityOptions: {
          showEmail: true,
          showLocation: true,
          showCompany: true,
          showSchool: true,
        },
      },
    });
  }

  console.log(`Created ${mockUsers.length} users`);
  console.log('User seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during user seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
