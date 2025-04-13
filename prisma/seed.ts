import { PrismaClient } from '@prisma/client';
import { INDUSTRIES } from '../src/constants/industries';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed industries...');

  // Clear existing industries first (optional)
  await prisma.industry.deleteMany({});

  // Create industries from constants
  for (const industry of INDUSTRIES) {
    await prisma.industry.upsert({
      where: { name: industry.value },
      update: {},
      create: {
        name: industry.value,
      },
    });
  }

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
