'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Server } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: {
    database: string;
    api: string;
  };
  performance: {
    responseTime: string;
  };
  environment: string;
}

export function SystemStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data: HealthStatus = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check system health');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Server className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && !health) {
    return (
      <div className="col-span-3 rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-center h-36">
          <RefreshCw className="h-10 w-10 animate-spin text-gray-300" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-3 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h2 className="text-lg font-medium">System Status: Error</h2>
        </div>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchHealthStatus}
          className="mt-4 rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <>
      <div className="rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(health.status)}
            <h2 className="text-lg font-medium">System Status</h2>
          </div>
          <span className={`font-medium ${getStatusColor(health.status)}`}>
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          Last updated: {new Date(health.timestamp).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          Environment: {health.environment}
        </p>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h3 className="font-medium mb-4">Database</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon(health.components.database)}
          <span className={getStatusColor(health.components.database)}>
            {health.components.database}
          </span>
        </div>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h3 className="font-medium mb-4">Performance</h3>
        <p className="text-sm mb-2">
          Response time: <span className="font-medium">{health.performance.responseTime}</span>
        </p>
        <button 
          onClick={fetchHealthStatus}
          className="mt-2 rounded bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100 text-xs flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>
    </>
  );
} 