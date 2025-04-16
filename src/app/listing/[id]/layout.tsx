// Force dynamic rendering so server components can use cookies()
export const dynamic = 'force-dynamic';

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}