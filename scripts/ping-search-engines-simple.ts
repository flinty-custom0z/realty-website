#!/usr/bin/env ts-node
import { config } from 'dotenv';
config();

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';

async function pingGoogle(): Promise<void> {
  /* try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    console.log('🔍 Pinging Google Search Console...');
    const response = await fetch(pingUrl, { method: 'GET' });
    
    if (response.ok) {
      console.log('✅ Successfully pinged Google sitemap');
    } else {
      console.log('⚠️  Google ping returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to ping Google:', error);
  } */
  console.log('⚠️ Google sitemap ping is deprecated. Please submit sitemap via Google Search Console manually.');
}

async function pingYandex(): Promise<void> {
  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const pingUrl = `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    console.log('🔍 Pinging Yandex Webmaster...');
    const response = await fetch(pingUrl, { method: 'GET' });
    
    if (response.ok) {
      console.log('✅ Successfully pinged Yandex sitemap');
    } else {
      console.log('⚠️  Yandex ping returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to ping Yandex:', error);
  }
}

async function pingBing(): Promise<void> {
  try {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const pingUrl = `http://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    console.log('🔍 Pinging Bing Webmaster...');
    const response = await fetch(pingUrl, { method: 'GET' });
    
    if (response.ok) {
      console.log('✅ Successfully pinged Bing sitemap');
    } else {
      console.log('⚠️  Bing ping returned status:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to ping Bing:', error);
  }
}

async function main() {
  console.log('🚀 Pinging search engines for updated sitemap...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`🗺️  Sitemap URL: ${baseUrl}/sitemap.xml`);
  console.log('');
  
  // Run all pings in parallel
  await Promise.allSettled([
    // pingGoogle(), // Commented out due to deprecation
    pingYandex(),
    pingBing(),
  ]);
  
  console.log('');
  console.log('✨ Search engine ping complete!');
  console.log('🕐 It may take a few minutes to hours for search engines to process the update.');
}

main().catch((error) => {
  console.error('❌ Search engine ping failed:', error);
  process.exit(1);
}); 