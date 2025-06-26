'use client';

import { useEffect, useState } from 'react';
import { detectUserContext, ImageOptimizationConfig } from '@/lib/utils/webVitals';

interface WebVitalsMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

interface UseWebVitalsReturn {
  metrics: WebVitalsMetrics;
  userConfig: ImageOptimizationConfig;
  isGoodPerformance: boolean;
  recommendations: string[];
}

export function useWebVitals(): UseWebVitalsReturn {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [userConfig, setUserConfig] = useState(() => detectUserContext());

  useEffect(() => {
    // Update user context on visibility change and resize
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setUserConfig(detectUserContext());
      }
    };

    const handleResize = () => {
      setUserConfig(detectUserContext());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Web Vitals measurement for Russian mobile users
    if (typeof window === 'undefined') return;

    let observer: PerformanceObserver;

    // Measure LCP (Largest Contentful Paint)
    const measureLCP = () => {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };
        
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }
    };

    // Measure FID (First Input Delay)
    const measureFID = () => {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };
          
          const fid = fidEntry.processingStart - fidEntry.startTime;
          setMetrics(prev => ({ ...prev, fid }));
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }
    };

    // Measure CLS (Cumulative Layout Shift)
    const measureCLS = () => {
      let clsValue = 0;
      
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    };

    // Measure FCP (First Contentful Paint)
    const measureFCP = () => {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // FCP not supported
      }
    };

    // Measure TTFB (Time to First Byte)
    const measureTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
      }
    };

    // Initialize measurements
    measureLCP();
    measureFID();
    measureCLS();
    measureFCP();
    measureTTFB();

    // Clean up observers on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Determine if performance is good based on Core Web Vitals thresholds
  const isGoodPerformance = (() => {
    const { lcp, fid, cls } = metrics;
    
    // Good thresholds for Core Web Vitals
    const lcpGood = !lcp || lcp <= 2500; // 2.5s
    const fidGood = !fid || fid <= 100; // 100ms
    const clsGood = !cls || cls <= 0.1; // 0.1
    
    return lcpGood && fidGood && clsGood;
  })();

  // Generate performance recommendations for Russian mobile users
  const recommendations = (() => {
    const recs: string[] = [];
    const { lcp, fid, cls, fcp, ttfb } = metrics;
    const { isMobile, connectionSpeed, isRussian } = userConfig;

    if (lcp && lcp > 2500) {
      if (isMobile) {
        recs.push('Оптимизируйте изображения для мобильных устройств');
      }
      if (connectionSpeed === 'slow') {
        recs.push('Используйте сжатие изображений для медленных соединений');
      }
      recs.push('Рассмотрите использование WebP формата для изображений');
    }

    if (fid && fid > 100) {
      recs.push('Уменьшите JavaScript на главной странице');
      if (isMobile) {
        recs.push('Оптимизируйте touch-обработчики для мобильных');
      }
    }

    if (cls && cls > 0.1) {
      recs.push('Зарезервируйте место для изображений недвижимости');
      recs.push('Избегайте вставки контента выше существующего');
    }

    if (fcp && fcp > 1800) {
      recs.push('Предварительно загружайте критические ресурсы');
      if (isRussian) {
        recs.push('Используйте CDN с серверами в России');
      }
    }

    if (ttfb && ttfb > 600) {
      recs.push('Оптимизируйте время ответа сервера');
      if (isRussian) {
        recs.push('Рассмотрите хостинг ближе к российским пользователям');
      }
    }

    return recs;
  })();

  return {
    metrics,
    userConfig,
    isGoodPerformance,
    recommendations,
  };
}

// Performance reporting for analytics
export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
}) {
  // Report to analytics service (e.g., Google Analytics, Yandex Metrica)
  if (typeof window !== 'undefined' && (window as any).ym) {
    // Report to Yandex Metrica for Russian users
    (window as any).ym(102977994, 'reachGoal', 'web-vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id,
    });
  }

  // Also log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${metric.name}`, metric.value);
  }
} 