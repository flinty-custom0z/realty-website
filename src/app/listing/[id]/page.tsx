import { PrismaClient } from '@prisma/client';
import { headers as nextHeaders, cookies as nextCookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import AdminListingActions from '@/components/AdminListingActions';
import jwt from 'jsonwebtoken';

// always render on‑demand so we can read the Referer header
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/* ───────────────────────────── helpers ───────────────────────────── */

async function fetchListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      user: { select: { id: true, name: true, phone: true } },
      images: true,
    },
  });
}

async function currentUserIsAdmin() {
  try {
    const cookies = await nextCookies();
    const token = cookies.get('token')?.value;
    if (!token) return false;
    
    const { id } = jwt.verify(token, JWT_SECRET) as { id: string };
    return !!(await prisma.user.findUnique({ where: { id } }));
  } catch {
    return false;
  }
}

async function buildBackHref(categorySlug: string) {
  const hdr = await nextHeaders();
  const referer = hdr.get('referer');
  if (!referer) return `/listing-category/${categorySlug}`;
  
  try {
    const url = new URL(referer);
    if (
      url.pathname.startsWith('/search') ||
      url.pathname.startsWith('/listing-category')
    ) {
      return referer;
    }
  } catch {
    /* ignore malformed referer */
  }
  return `/listing-category/${categorySlug}`;
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <p className="mb-2">
    <span className="text-gray-600">{label}:</span> {value}
    </p>
  );
}

async function getBackLinkText(backUrl: string) {
  // If returning to home
  if (backUrl === '/') {
    return 'На главную';
  }
  
  // If returning to search results
  if (backUrl.startsWith('/search')) {
    return 'Назад к результатам поиска';
  }
  
  // If returning to a category
  if (backUrl.startsWith('/listing-category/')) {
    const categorySlug = backUrl.split('/')[2]?.split('?')[0];
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        // If it's a search within category (has query parameter)
        if (backUrl.includes('?q=')) {
          return 'Назад к результатам поиска';
        }
        // If it's just a category page
        return `Назад к ${getDativeCase(category.name)}`;
      }
    }
  }
  
  // Default
  return 'Назад';
}


/**
 * Helper function to get proper grammatical case for back links
 */
function getDativeCase(categoryName: string): string {
  // Handle Russian declensions for common category names
  const dative: Record<string, string> = {
    'Квартиры': 'квартирам',
    'Дома': 'домам',
    'Земельные участки': 'земельным участкам',
    'Коммерция': 'коммерческим объектам',
    'Промышленные объекты': 'промышленным объектам'
  };
  
  return dative[categoryName] || categoryName.toLowerCase();
}

/* ───────────────────────────── page ───────────────────────────── */

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) notFound();
  
  const isAdmin = await currentUserIsAdmin();
  const backHref = await buildBackHref(listing!.category.slug);
  const backLinkText = await getBackLinkText(backHref);
  const dateAdded = new Date(listing.dateAdded).toLocaleDateString('ru-RU');
  
  // Ensure main image is first
  const sortedImages = listing.images.slice().sort((a, b) => {
    if (a.isFeatured === b.isFeatured) return 0;
    return a.isFeatured ? -1 : 1;
  });

  return (
    <div className="container mx-auto px-4 py-8">
    {/* top bar */}
    <div className="mb-4 flex justify-between items-center">
    <Link href={backHref} className="text-blue-500 hover:underline">
    ← {backLinkText}
    </Link>
    {isAdmin && (
      <AdminListingActions listingId={listing.id} categorySlug={listing.category.slug} />
    )}
    </div>
    
    {/* title & gallery */}
    <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
    <ImageGallery images={sortedImages} title={listing.title} />
    <p className="text-gray-500 mt-2 mb-6">Добавлено: {dateAdded}</p>
    
    <div className="flex flex-col md:flex-row gap-8">
    {/* left column */}
    <div className="w-full md:w-2/3">
    {/* characteristics */}
    <section className="bg-white shadow rounded-md p-6 mb-6">
    <h2 className="text-xl font-bold mb-4">Характеристики объекта</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    <div>
    <Info label="Район" value={listing.district} />
    <Info label="Комнат" value={listing.rooms} />
    <Info
    label="Этаж"
    value={
      listing.floor && listing.totalFloors
      ? `${listing.floor}/${listing.totalFloors}`
      : undefined
    }
    />
    <Info label="Площадь (м²)" value={listing.houseArea} />
    <Info label="Площадь участка (сот.)" value={listing.landArea} />
    <Info label="Цена" value={`${listing.price.toLocaleString()} ₽`} />
    </div>
    <div>
    <Info label="Год" value={listing.yearBuilt} />
    <Info label="Состояние" value={listing.condition} />
    <Info label="Код объекта" value={listing.listingCode} />
    <Info label="Дата добавления" value={dateAdded} />
    </div>
    </div>
    </section>
    
    {/* public description */}
    {listing.publicDescription && (
      <section className="bg-white shadow rounded-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Описание</h2>
      <div className="prose max-w-none text-gray-800">
      {listing.publicDescription.split('\n').map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      </div>
      </section>
    )}
    
    {/* admin comment */}
    {isAdmin && listing.adminComment && (
      <section className="bg-white shadow rounded-md p-6 mb-6 border-l-4 border-blue-500">
      <h2 className="text-xl font-bold mb-4 flex items-center">
      <span className="mr-2">🔒</span> Комментарий администратора
      </h2>
      <div className="prose max-w-none text-gray-700">
      {listing.adminComment.split('\n').map((p, i) => (
        <p key={i} className="mb-4">
        {p}
        </p>
      ))}
      </div>
      <p className="text-sm text-gray-500 mt-4 italic">
      Этот комментарий виден только администраторам
      </p>
      </section>
    )}
    </div>
    
    {/* right sidebar */}
    <aside className="w-full md:w-1/3">
    <div className="bg-white shadow rounded-md p-6 sticky top-4">
    <div className="flex items-center mb-4">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
    <span className="text-3xl text-blue-500">{listing.user.name.charAt(0)}</span>
    </div>
    <div>
    <h3 className="font-bold">{listing.user.name}</h3>
    <p className="text-gray-600">Риелтор</p>
    </div>
    </div>
    <div className="border-t pt-4 text-sm">
    <p className="mb-2 flex items-center">
    <span className="mr-2">📱</span>
    <a href={`tel:${listing.user.phone}`} className="text-blue-500 hover:underline">
    {listing.user.phone}
    </a>
    </p>
    <p className="text-gray-500">Позвонить: {listing.user.phone}</p>
    </div>
    </div>
    </aside>
    </div>
    </div>
  );
}
