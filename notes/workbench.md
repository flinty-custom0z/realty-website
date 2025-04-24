## Backlog


### NOW

- Preview in edit history not working

- Логотип

- Добавить аренду (коммерция и жилая)
- Убрать промышленную

### Next

### Later

- Host website
- Decide on domain name
- Help mom and her coworker set up
- SEO

- Заполнение договоров




## To Change

Below is a **two-step fix** that always works with **Next .js 15**:

* **Step 1 — take the `'use client'` directive out of the page file** so the page is rendered on the server and can be declared `async`.  
* **Step 2 — move `ListingDetailClient` into its own file** (`ListingDetailClient.tsx`) that **does** keep the `'use client'` pragma.  
  * This lets you `await` the new **Promise-based** `params` prop in the page, while the interactive gallery and buttons stay on the client.

This is the pattern the Next .js team recommends whenever you need both server and client code for the same route citeturn1search6turn1search2 and avoids the Promise-type error you’re seeing citeturn1search0.

---

## 1  Why the error appears

Starting with **Next 15** every dynamic-route prop (`params`, `searchParams`) is delivered as a **Promise**; the old synchronous shape exists only for temporary backward compatibility citeturn1search2turn1search9.  
If the file is marked `'use client'`, the whole module must be a client component, and client components can’t be `async`, so you can’t `await params`; the TypeScript checker therefore complains that your `{ id:string }` isn’t a proper `Promise` citeturn1search4.

---

## 2  Folder structure after the split

```
app/
└─ listing/
   └─ [id]/
      ├─ page.tsx              ← server component (no 'use client')
      └─ ListingDetailClient.tsx  ← client component ('use client')
```

---

## 3  `page.tsx` (the server component)

```tsx
// app/listing/[id]/page.tsx
import ListingDetailClient from './ListingDetailClient';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;          // ← 1. type as Promise
}) {
  const { id } = await params;              // ← 2. await it
  return <ListingDetailClient id={id} />;   // pass plain string to client code
}
```

* Because the file **no longer** has `'use client'`, it can be `async` and freely `await` the promise citeturn1search2.  
* The **resolved ID** is forwarded as a normal prop to the client component.

---

## 4  `ListingDetailClient.tsx` (the client component)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageGallery from '@/components/ImageGallery';
import Button from '@/components/Button';
import { ArrowLeft } from 'lucide-react';
import {
  formatPhoneNumber,
  formatDate,
  formatPrice,
} from '@/lib/utils';

export default function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --- fetch listing once --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error('Listing not found');
        setListing(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  /* --- UI states --- */
  if (isLoading) return <p className="p-8">Загрузка…</p>;
  if (error || !listing) return <p className="p-8">{error}</p>;

  const formattedDate = formatDate(listing.dateAdded);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        className="flex items-center text-blue-600 mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} className="mr-1" /> Назад
      </button>

      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
      <ImageGallery images={listing.images} title={listing.title} />

      <p className="mt-4 text-gray-500">Добавлено: {formattedDate}</p>
      {/* …rest of your JSX from the original component… */}
    </div>
  );
}
```

Nothing about this component changes except the file location; it can stay exactly as you wrote it, still marked `'use client'`.

---

## 5  Alternate quick-and-dirty workaround (keep one file)

If you **must** keep everything in the same file, keep the `'use client'` pragma and unwrap the promise inside a `useEffect`:

```tsx
'use client';
import { useEffect, useState } from 'react';

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));     // unwrap asynchronously
  }, [params]);

  if (!id) return null;                     // or a loading spinner
  return <ListingDetailClient id={id} />;
}
```

But splitting the files is clearer, avoids an extra round-trip on the client, and keeps your bundle smaller citeturn1search6.

---

## 6  Take-aways & other files to check

| File type                     | v14 prop type             | v15 prop type                              | Must `await`? |
| ----------------------------- | ------------------------- | ------------------------------------------ | ------------- |
| **Page / Layout** `params`    | `{ id:string }`           | `Promise<{ id:string }>`                   | Yes (server)  |
| **Page** `searchParams`       | `{ q:string }`            | `Promise<Record<string,string|string[]>>`  | Yes           |
| **Route handler** `params`    | `{ params:{id:string} }`  | `{ params:Promise<{ id:string }> }`        | Yes           |
| Client component (`'use client'`) | N/A (use `useParams`) | use the `useParams()` hook instead         | No (hook)     |

Everywhere you formerly wrote `params.id`, change to `const { id } = await params` on the server, or unwrap in an effect if you deliberately keep a client component citeturn1search0turn1search4.

---

### Key references

1. Upgrading guide — props are promises in v15 citeturn1search6  
2. Official page-convention doc (params/searchParams now Promise) citeturn1search2  
3. Next.js error message explanation citeturn1search9  
4. StackOverflow answers showing the fix citeturn1search3turn1search4  
5. Medium article walking through the change citeturn1search0  
6. GitHub discussion on param awaiting citeturn1search5  
7. YouTube tutorial on async params in v15 citeturn1search7  
8. useParams hook doc for client components citeturn1search1  
9. Community thread on client vs server conflict citeturn1search8