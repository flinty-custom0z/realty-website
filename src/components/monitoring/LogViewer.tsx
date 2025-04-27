'use client';

import { useState, useEffect } from 'react';
import { Clock, Download, FileText, Filter, Search } from 'lucide-react';

// Mock log entry for demonstration purposes
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  source: string;
  message: string;
  context?: Record<string, any>;
}

export function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // In a real app, this would fetch from a backend API that accesses actual logs
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      // Simulating API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample log data (in a real app, this would come from the server)
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          level: 'INFO',
          source: 'AuthApi',
          message: 'Authentication successful',
          context: { userId: '123abc', ip: '192.168.1.1' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          level: 'WARN',
          source: 'AuthApi',
          message: 'Failed authentication attempt',
          context: { ip: '192.168.1.100' }
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          level: 'ERROR',
          source: 'ApiErrorHandler',
          message: 'Database constraint error',
          context: { code: 'P2002', meta: { target: 'email' } }
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          level: 'DEBUG',
          source: 'SystemMonitor',
          message: 'Resource usage stats',
          context: {
            memory: {
              rss: '120MB',
              heapTotal: '80MB',
              heapUsed: '65MB',
              external: '10MB'
            }
          }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          level: 'INFO',
          source: 'HealthCheck',
          message: 'Health check completed successfully',
          context: { responseTime: 120 }
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          level: 'FATAL',
          source: 'SystemMonitor',
          message: 'Database connection failed',
          context: { error: 'Connection timeout' }
        },
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and search logs
  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'DEBUG':
        return 'text-gray-500';
      case 'INFO':
        return 'text-blue-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'ERROR':
        return 'text-red-500';
      case 'FATAL':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="rounded-lg border p-6 shadow-sm h-full">
        <h2 className="text-lg font-medium mb-4">System Logs</h2>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium">System Logs</h2>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            title="Download Logs"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={fetchLogs}
            title="Refresh Logs"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row mb-4">
        <div className="flex-1 flex gap-2 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="pl-2 pr-7 py-1.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
            <option value="FATAL">Fatal</option>
          </select>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b grid grid-cols-12 text-xs font-medium text-gray-500">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-1">Level</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-6">Message</div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No logs matching your criteria
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="px-4 py-2 border-b grid grid-cols-12 text-xs hover:bg-gray-50"
              >
                <div className="col-span-3 text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className={`col-span-1 font-medium ${getLevelColor(log.level)}`}>
                  {log.level}
                </div>
                <div className="col-span-2 text-gray-600">
                  {log.source}
                </div>
                <div className="col-span-6 text-gray-700">
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 