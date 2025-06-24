import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function StructuredDataBreadcrumb({ items }: StructuredDataBreadcrumbProps) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbStructuredData)
      }}
    />
  );
} 