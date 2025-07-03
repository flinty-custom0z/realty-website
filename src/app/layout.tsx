import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { DealTypeProvider } from '@/contexts/DealTypeContext';
import ResponsiveNav from '@/components/ResponsiveNav';
import AdminNavClient from '@/components/AdminNavClient';
import SearchFormWrapper from '@/components/SearchFormWrapper';
import DealTypeThemeWrapper from '@/components/DealTypeThemeWrapper';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ОпораДом - Краснодарская недвижимость',
  description: 'Сайт недвижимости в Краснодаре',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning={true} className={inter.variable}>
      <head>
        {/* Yandex Webmaster verification */}
        <meta name="yandex-verification" content="251b6ab8ece55464" />
        
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(102977994, "init", {
                   clickmap:true,
                   trackLinks:true,
                   accurateTrackBounce:true,
                   webvisor:true
              });
            `
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/102977994" style={{position:'absolute', left:'-9999px'}} alt="" />
          </div>
        </noscript>
        
        {/* JSON-LD Structured Data */}
        {(() => {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';
          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "ОпораДом",
                  "description": "Краснодарская недвижимость - продажа и аренда квартир, домов, земельных участков и коммерческой недвижимости",
                  "url": baseUrl,
                  "telephone": ["+79624441579", "+79298510395"],
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Краснодар",
                    "addressCountry": "RU"
                  },
                  "areaServed": {
                    "@type": "City",
                    "name": "Краснодар"
                  },
                  "knowsAbout": ["недвижимость", "квартиры", "дома", "земельные участки", "коммерческая недвижимость", "аренда", "продажа"],
                  "serviceType": ["Продажа недвижимости", "Аренда недвижимости", "Консультации по недвижимости"]
                })
              }}
            />
          );
        })()}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ОпораДом - Краснодарская недвижимость",
              "description": "Найдите идеальную недвижимость для жизни, инвестиций или бизнеса. Большой выбор объектов во всех районах города.",
              "url": "https://oporadom.ru",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://oporadom.ru/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "ОпораДом"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Suspense fallback={<></>}>
          <DealTypeProvider>
            <DealTypeThemeWrapper>
              <header className="bg-white transition-all duration-300" id="site-header">
                <Suspense fallback={<div className="h-12 w-full bg-gray-100 animate-pulse rounded mb-4"></div>}>
                  <ResponsiveNav />
                </Suspense>
                <div className="w-full max-w-xl mx-auto mt-6 pb-6 px-4 hide-when-sticky">
                  <Suspense fallback={<div className="h-10 w-full bg-gray-100 animate-pulse rounded"></div>}>
                    <SearchFormWrapper />
                  </Suspense>
                </div>
              </header>
              <main className="bg-white min-h-screen pt-4 pb-12">
                {children}
              </main>
              <footer className="bg-white py-8 border-t border-gray-100">
                <div className="container mx-auto px-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">©Все права защищены 2025г.</p>
                    <Suspense fallback={<div className="h-6 w-40 bg-gray-100 animate-pulse rounded"></div>}>
                      <AdminNavClient />
                    </Suspense>
                    <p className="text-sm text-gray-500">Политика конфиденциальности</p>
                  </div>
                </div>
              </footer>
            </DealTypeThemeWrapper>
          </DealTypeProvider>
        </Suspense>
        <script dangerouslySetInnerHTML={{ __html: `
          // Wait for DOM content to fully load to avoid hydration mismatches
          document.addEventListener('DOMContentLoaded', () => {
            const header = document.getElementById('site-header');
            if (header) {
              // Apply initial state based on current scroll position
              if (window.scrollY > 100) {
                // Only add sticky class on desktop
                if (window.innerWidth >= 768) {
                  header.classList.add('sticky');
                }
              }
              
              // Set up scroll event listener
              window.addEventListener('scroll', () => {
                // Only handle sticky behavior on desktop (md breakpoint = 768px)
                if (window.innerWidth >= 768) {
                  if (window.scrollY > 100) {
                    header.classList.add('sticky');
                  } else {
                    header.classList.remove('sticky');
                  }
                }
              });
              
              // Update on resize
              window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                  if (window.scrollY > 100) {
                    header.classList.add('sticky');
                  } else {
                    header.classList.remove('sticky');
                  }
                } else {
                  // Always remove sticky class on mobile
                  header.classList.remove('sticky');
                }
              });
            }

            // Core Web Vitals monitoring for Russian mobile users
            if (typeof PerformanceObserver !== 'undefined') {
              const isRussian = navigator.language?.startsWith('ru') || false;
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              // Report Web Vitals to Yandex Metrica for Russian users
              function reportMetric(metric) {
                if (window.ym && isRussian) {
                  window.ym(102977994, 'reachGoal', 'web-vitals-' + metric.name, {
                    value: metric.value,
                    isMobile: isMobile,
                    timestamp: Date.now()
                  });
                }
              }

              // Measure LCP
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                  reportMetric({ name: 'LCP', value: lastEntry.startTime });
                }
              }).observe({ entryTypes: ['largest-contentful-paint'] });

              // Measure FID
              new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  const fid = entry.processingStart - entry.startTime;
                  reportMetric({ name: 'FID', value: fid });
                });
              }).observe({ entryTypes: ['first-input'] });

              // Measure CLS
              let clsValue = 0;
              new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    reportMetric({ name: 'CLS', value: clsValue });
                  }
                });
              }).observe({ entryTypes: ['layout-shift'] });
            }
          });
        `}} />
      </body>
    </html>
  );
}