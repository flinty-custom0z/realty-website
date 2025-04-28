'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Database, RefreshCw, Server, Clock } from 'lucide-react';

interface ResourceLimit {
  name: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  warning: string;
}

export function ResourceLimits() {
  const [limits, setLimits] = useState<ResourceLimit[]>([
    {
      name: 'Edge Function Execution',
      used: 0,
      limit: 100,
      unit: 'GB-hours',
      icon: <Server className="h-4 w-4" />,
      warning: 'Most real-estate traffic OK.'
    },
    {
      name: 'Build Hours',
      used: 0,
      limit: 1,
      unit: 'hours',
      icon: <Clock className="h-4 w-4" />,
      warning: 'Don\'t trigger builds on every commit; use a develop branch.'
    },
    {
      name: 'Blob Storage Egress',
      used: 0,
      limit: 100,
      unit: 'GB',
      icon: <BarChart3 className="h-4 w-4" />,
      warning: 'Web-optimise images (already done).'
    },
    {
      name: 'Neon Postgres',
      used: 0,
      limit: 3,
      unit: 'GB',
      icon: <Database className="h-4 w-4" />,
      warning: 'Archive old listing history or pay $0.25/GB overage.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResourceUsage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system/resource-limits');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resource limits: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map API response to our state format with icons
      if (data.resourceLimits && Array.isArray(data.resourceLimits)) {
        setLimits(prevLimits => 
          prevLimits.map(limit => {
            const apiLimit = data.resourceLimits.find(
              (item: any) => item.name === limit.name
            );
            
            if (apiLimit) {
              return {
                ...limit,
                used: apiLimit.used,
                limit: apiLimit.limit,
                unit: apiLimit.unit,
                warning: apiLimit.warning || limit.warning
              };
            }
            
            return limit;
          })
        );
      }
    } catch (error) {
      console.error('Failed to fetch resource limits:', error);
      setError(error instanceof Error ? error.message : 'Failed to load resource limits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceUsage();
    
    const interval = setInterval(fetchResourceUsage, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm h-full">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h2 className="text-lg font-medium">Resource Limits: Error</h2>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={fetchResourceUsage}
          className="rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium">Resource Limits</h2>
        </div>
        <button 
          onClick={fetchResourceUsage}
          disabled={isLoading}
          className="rounded bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100 text-xs flex items-center gap-1"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Refresh
        </button>
      </div>
      
      <div className="space-y-5">
        {limits.map((resource, index) => (
          <div key={index} className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600">{resource.icon}</span>
                <h3 className="text-sm font-medium">{resource.name}</h3>
              </div>
              <div className="text-xs font-medium">
                {resource.used} / {resource.limit} {resource.unit}
              </div>
            </div>
            
            <div className="mt-2 mb-3">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    resource.used / resource.limit > 0.9 ? 'bg-red-500' : 
                    resource.used / resource.limit > 0.7 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (resource.used / resource.limit) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{resource.warning}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 