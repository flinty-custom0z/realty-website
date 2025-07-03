import { createLogger } from '@/lib/logging';

const logger = createLogger('SearchEngineService');

export class SearchEngineService {
  private static baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';

  /**
   * Ping Google to reindex the sitemap
   */
  static async pingGoogleSitemap(): Promise<void> {
    try {
      const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      
      await fetch(pingUrl, { method: 'GET' });
      logger.info('Successfully pinged Google sitemap', { sitemapUrl });
    } catch (error) {
      logger.error('Failed to ping Google sitemap', { error });
    }
  }

  /**
   * Ping Yandex IndexNow API for a specific URL
   */
  static async pingYandexIndexNow(url: string): Promise<void> {
    try {
      const indexNowUrl = `https://yandex.com/indexnow?url=${encodeURIComponent(url)}`;
      
      await fetch(indexNowUrl, { method: 'GET' });
      logger.info('Successfully pinged Yandex IndexNow', { url });
    } catch (error) {
      logger.error('Failed to ping Yandex IndexNow', { error, url });
    }
  }

  /**
   * Ping both Google and Yandex when a listing is created or updated
   */
  static async notifySearchEngines(listingId: string): Promise<void> {
    const listingUrl = `${this.baseUrl}/listing/${listingId}`;
    
    // Run both pings in parallel
    await Promise.allSettled([
      this.pingGoogleSitemap(),
      this.pingYandexIndexNow(listingUrl),
    ]);
  }

  /**
   * Ping search engines when sitemap changes (e.g., new category, bulk updates)
   */
  static async notifySearchEnginesSitemap(): Promise<void> {
    await Promise.allSettled([
      this.pingGoogleSitemap(),
    ]);
  }
} 