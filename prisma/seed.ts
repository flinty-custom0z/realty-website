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

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Seed admin users
  const admins = [
    { name: 'Валерий Ж.', username: 'valeriy', password: 'admin1password' },
    { name: 'Радион А.', username: 'radion', password: 'admin2password' },
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { username: admin.username },
      update: {},
      create: {
        name: admin.name,
        username: admin.username,
        password: hashedPassword,
        phone: '+7938515439',
      },
    });
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });