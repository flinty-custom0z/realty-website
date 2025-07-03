/**
 * SEO utilities for debugging and verifying metadata
 */

export interface SEOAuditResult {
  title: {
    length: number;
    isOptimal: boolean;
    warning?: string;
  };
  description: {
    length: number;
    isOptimal: boolean;
    warning?: string;
  };
  keywords: {
    count: number;
    isOptimal: boolean;
    warning?: string;
  };
  images: {
    count: number;
    hasOgImage: boolean;
    warning?: string;
  };
  structured: {
    hasJsonLd: boolean;
    hasRealEstateListing: boolean;
    warning?: string;
  };
}

export function auditListingSEO(metadata: any, structuredData: any): SEOAuditResult {
  const result: SEOAuditResult = {
    title: {
      length: metadata.title?.length || 0,
      isOptimal: false
    },
    description: {
      length: metadata.description?.length || 0,
      isOptimal: false
    },
    keywords: {
      count: metadata.keywords?.split(',').length || 0,
      isOptimal: false
    },
    images: {
      count: metadata.openGraph?.images?.length || 0,
      hasOgImage: false
    },
    structured: {
      hasJsonLd: !!structuredData,
      hasRealEstateListing: false
    }
  };

  // Title audit (optimal: 30-60 chars)
  if (result.title.length === 0) {
    result.title.warning = 'Отсутствует заголовок';
  } else if (result.title.length < 30) {
    result.title.warning = 'Заголовок слишком короткий (< 30 символов)';
  } else if (result.title.length > 60) {
    result.title.warning = 'Заголовок слишком длинный (> 60 символов)';
  } else {
    result.title.isOptimal = true;
  }

  // Description audit (optimal: 120-160 chars)
  if (result.description.length === 0) {
    result.description.warning = 'Отсутствует описание';
  } else if (result.description.length < 120) {
    result.description.warning = 'Описание слишком короткое (< 120 символов)';
  } else if (result.description.length > 160) {
    result.description.warning = 'Описание слишком длинное (> 160 символов)';
  } else {
    result.description.isOptimal = true;
  }

  // Keywords audit (optimal: 5-15 keywords)
  if (result.keywords.count === 0) {
    result.keywords.warning = 'Отсутствуют ключевые слова';
  } else if (result.keywords.count < 5) {
    result.keywords.warning = 'Мало ключевых слов (< 5)';
  } else if (result.keywords.count > 15) {
    result.keywords.warning = 'Слишком много ключевых слов (> 15)';
  } else {
    result.keywords.isOptimal = true;
  }

  // Images audit
  result.images.hasOgImage = result.images.count > 0;
  if (!result.images.hasOgImage) {
    result.images.warning = 'Отсутствует Open Graph изображение';
  }

  // Structured data audit
  if (structuredData) {
    result.structured.hasRealEstateListing = structuredData['@type'] === 'RealEstateListing';
    if (!result.structured.hasRealEstateListing) {
      result.structured.warning = 'Отсутствует RealEstateListing схема';
    }
  } else {
    result.structured.warning = 'Отсутствуют структурированные данные';
  }

  return result;
}

export function generateSEOReport(auditResult: SEOAuditResult): string {
  const warnings = [];
  const successes = [];

  if (auditResult.title.isOptimal) {
    successes.push('✅ Заголовок оптимизирован');
  } else if (auditResult.title.warning) {
    warnings.push(`❌ ${auditResult.title.warning}`);
  }

  if (auditResult.description.isOptimal) {
    successes.push('✅ Описание оптимизировано');
  } else if (auditResult.description.warning) {
    warnings.push(`❌ ${auditResult.description.warning}`);
  }

  if (auditResult.keywords.isOptimal) {
    successes.push('✅ Ключевые слова оптимизированы');
  } else if (auditResult.keywords.warning) {
    warnings.push(`❌ ${auditResult.keywords.warning}`);
  }

  if (auditResult.images.hasOgImage) {
    successes.push('✅ Open Graph изображения настроены');
  } else if (auditResult.images.warning) {
    warnings.push(`❌ ${auditResult.images.warning}`);
  }

  if (auditResult.structured.hasRealEstateListing) {
    successes.push('✅ Структурированные данные настроены');
  } else if (auditResult.structured.warning) {
    warnings.push(`❌ ${auditResult.structured.warning}`);
  }

  return [...successes, ...warnings].join('\n');
}

/**
 * Extract key SEO metrics from a listing for quick overview
 */
export function getListingSEOMetrics(listing: any) {
  return {
    hasTitle: !!listing.title,
    hasDescription: !!listing.publicDescription,
    hasImages: listing.images?.length > 0,
    hasLocation: !!(listing.city || listing.districtRef),
    hasPrice: !!listing.price,
    hasArea: !!(listing.houseArea || listing.landArea),
    completeness: calculateSEOCompleteness(listing)
  };
}

function calculateSEOCompleteness(listing: any): number {
  const factors = [
    !!listing.title,
    !!listing.publicDescription,
    listing.images?.length > 0,
    !!(listing.city || listing.districtRef),
    !!listing.price,
    !!(listing.houseArea || listing.landArea),
    !!listing.propertyType,
    !!listing.category,
    !!(listing.latitude && listing.longitude),
    !!listing.address || !!listing.fullAddress
  ];

  const score = factors.filter(Boolean).length;
  return Math.round((score / factors.length) * 100);
} 