import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await argon2.hash('admin123');
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  });

  console.log('Created admin:', admin.username);

  // Create sample licenses
  const license1 = await prisma.license.create({
    data: {
      key: 'VIDU-DEMO-ONE-TIME-XXXX',
      type: 'ONE_TIME',
      maxActivations: 2,
      note: 'Demo one-time license',
    },
  });

  const license2 = await prisma.license.create({
    data: {
      key: 'VIDU-DEMO-SUB-XXXX',
      type: 'SUBSCRIPTION',
      maxActivations: 2,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      note: 'Demo subscription license',
    },
  });

  console.log('Created licenses:', license1.key, license2.key);

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      details: { message: 'Database seeded with demo data' },
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
