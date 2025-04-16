// src/app/listing-category/page.tsx
import { redirect } from 'next/navigation';

export default function CategoryRootPage() {
  // Redirect to search page when someone visits /listing-category without a slug
  redirect('/search');
}