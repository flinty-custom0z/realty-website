'use client';

import { useState } from 'react';

export function SitemapStatusClient() {
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSitemap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/sitemap.xml');
      const text = await response.text();
      
      // Parse XML to count URLs
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const urls = xmlDoc.getElementsByTagName('url');
      
      setSitemapData({
        totalUrls: urls.length,
        lastChecked: new Date().toLocaleString(),
        sizeKB: Math.round(text.length / 1024),
      });
    } catch (error) {
      console.error('Sitemap check failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white shadow rounded-md p-6">
      <h3 className="text-lg font-semibold mb-4">Sitemap Status</h3>
      
      <button 
        onClick={checkSitemap}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Sitemap'}
      </button>
      
      {sitemapData && (
        <div className="mt-4 space-y-2">
          <p><strong>Total URLs:</strong> {sitemapData.totalUrls}</p>
          <p><strong>Size:</strong> {sitemapData.sizeKB} KB</p>
          <p><strong>Last Checked:</strong> {sitemapData.lastChecked}</p>
          <a 
            href="/sitemap.xml" 
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            View Sitemap →
          </a>
        </div>
      )}
    </div>
  );
} 