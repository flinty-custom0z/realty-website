import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://oporadom.ru";
  
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin pages
User-agent: *
Disallow: /admin/

# Disallow API routes from indexing
User-agent: *
Disallow: /api/

# Allow all other pages
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
} 