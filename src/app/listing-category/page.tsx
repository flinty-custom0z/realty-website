export const runtime = "edge";

import { redirect } from 'next/navigation';

// This is a server component that will redirect to the search page
export default function CategoryRootPage() {
  // Server-side redirect
  redirect('/search');
  
  // This won't be rendered, but is here for TypeScript
  return null;
}