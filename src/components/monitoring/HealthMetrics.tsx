'use client';

import { useEffect, useState } from 'react';
import { Activity, Database, Server } from 'lucide-react';

interface ResourceMetrics {
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  uptime: string;
}

export function HealthMetrics() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated resource metrics - in a real application, 
  // these would come from a backend API that collects actual metrics
  const fetchResourceMetrics = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to get actual metrics
      // For this demo, we'll create a simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate resource data
      const simulatedData: ResourceMetrics = {
        memory: {
          rss: `${Math.round(100 + Math.random() * 150)}MB`,
          heapTotal: `${Math.round(50 + Math.random() * 100)}MB`,
          heapUsed: `${Math.round(40 + Math.random() * 80)}MB`,
          external: `${Math.round(5 + Math.random() * 20)}MB`,
        },
        uptime: `${Math.round(1000 + Math.random() * 10000)}s`,
      };
      
      setMetrics(simulatedData);
    } catch (error) {
      console.error('Failed to fetch resource metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceMetrics();
    
    const interval = setInterval(fetchResourceMetrics, 15000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="rounded-lg border p-6 shadow-sm h-full">
        <h2 className="text-lg font-medium mb-4">System Resources</h2>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="rounded-lg border p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-medium">System Resources</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Server className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium">Memory Usage</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500 mb-1">RSS</div>
              <div className="flex items-center justify-between">
                <div className="h-2 w-4/5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full" 
                    style={{ width: `${parseInt(metrics.memory.rss) / 3}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.memory.rss}</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Heap Total</div>
              <div className="flex items-center justify-between">
                <div className="h-2 w-4/5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full" 
                    style={{ width: `${parseInt(metrics.memory.heapTotal) / 2}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.memory.heapTotal}</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Heap Used</div>
              <div className="flex items-center justify-between">
                <div className="h-2 w-4/5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full rounded-full" 
                    style={{ width: `${parseInt(metrics.memory.heapUsed) / 1.5}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.memory.heapUsed}</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">External</div>
              <div className="flex items-center justify-between">
                <div className="h-2 w-4/5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full" 
                    style={{ width: `${parseInt(metrics.memory.external) * 3}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{metrics.memory.external}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Database className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium">System Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Uptime</div>
              <div className="text-sm font-medium">{metrics.uptime}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Node.js Version</div>
              <div className="text-sm font-medium">v18.x.x</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Process ID</div>
              <div className="text-sm font-medium">1234</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 