import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { listings: true },
      },
    },
  });
  
  return categories;
}

export default async function Home() {
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/listing-category/${category.slug}`}
            className="relative overflow-hidden rounded-lg shadow-md h-64 group"
          >
            <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 z-10">
              <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
              <p className="text-white text-xl">
                {category._count.listings} {getListingText(category._count.listings)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getListingText(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'объявление';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'объявления';
  } else {
    return 'объявлений';
  }
}