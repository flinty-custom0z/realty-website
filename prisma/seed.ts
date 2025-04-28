import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { name: 'Квартиры', slug: 'apartments' },
    { name: 'Дома', slug: 'houses' },
    { name: 'Земельные участки', slug: 'land' },
    { name: 'Коммерция', slug: 'commercial' },
  ];

  console.log('Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('Categories seeded successfully!');

  // Seed admin users
  const admins = [
    { name: 'Валерий Г.', username: 'valeriy', password: 'cimqex-nyvtoH-2xyswo' },
  ];

  console.log('Seeding admin users...');
  for (const admin of admins) {
    // Hash password securely
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { username: admin.username },
      update: {
        name: admin.name,
        // Don't update password on existing users unless explicitly needed
      },
      create: {
        name: admin.name,
        username: admin.username,
        password: hashedPassword, 
        phone: '+79624123123',
      },
    });
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', { error: e });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });