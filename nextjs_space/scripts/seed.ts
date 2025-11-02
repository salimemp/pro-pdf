
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Create the default test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      isPremium: true, // Give admin/test user premium access
    },
  });

  console.log(`Created user with id: ${user.id}`);
  
  // Create sample jobs for testing
  const sampleJobs = [
    {
      userId: user.id,
      name: 'Monthly Report Merge',
      type: 'merge',
      status: 'completed',
      priority: 'high',
      progress: 100,
      isRecurring: true,
      recurrence: 'monthly',
      nextRunAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      inputFiles: ['report-part1.pdf', 'report-part2.pdf', 'report-part3.pdf'],
      outputFiles: ['monthly-report-merged.pdf'],
      settings: { order: 'sequential' },
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      userId: user.id,
      name: 'Compress Invoice Batch',
      type: 'compress',
      status: 'processing',
      priority: 'medium',
      progress: 67,
      isRecurring: false,
      inputFiles: ['invoice-001.pdf', 'invoice-002.pdf', 'invoice-003.pdf'],
      settings: { quality: 'medium', level: 3 },
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      userId: user.id,
      name: 'Split Legal Document',
      type: 'split',
      status: 'pending',
      priority: 'urgent',
      progress: 0,
      isRecurring: false,
      inputFiles: ['legal-document-full.pdf'],
      settings: { ranges: '1-10,20-30,50-100' }
    },
    {
      userId: user.id,
      name: 'Weekly Backup Encryption',
      type: 'encrypt',
      status: 'scheduled',
      priority: 'high',
      progress: 0,
      isRecurring: true,
      recurrence: 'weekly',
      nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      inputFiles: ['backup-week-45.pdf'],
      settings: { encryptionType: 'password' }
    },
    {
      userId: user.id,
      name: 'Convert Presentation to PDF',
      type: 'convert',
      status: 'failed',
      priority: 'low',
      progress: 0,
      isRecurring: false,
      inputFiles: ['presentation.pptx'],
      settings: { format: 'pdf' },
      errorMessage: 'File format not supported for conversion',
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 55 * 60 * 1000)
    },
    {
      userId: user.id,
      name: 'Daily Contract Signing',
      type: 'sign',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      isRecurring: true,
      recurrence: 'daily',
      nextRunAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      lastRunAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      inputFiles: ['contract-template.pdf'],
      outputFiles: ['contract-signed.pdf'],
      settings: { signatureType: 'digital' },
      startedAt: new Date(Date.now() - 40 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ];

  for (const jobData of sampleJobs) {
    await prisma.job.create({
      data: jobData
    });
  }

  console.log(`Created ${sampleJobs.length} sample jobs`);
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
