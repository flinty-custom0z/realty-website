import { Suspense } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { SystemStatus } from '@/components/monitoring/SystemStatus';
import { HealthMetrics } from '@/components/monitoring/HealthMetrics';
import { LogViewer } from '@/components/monitoring/LogViewer';
import { ErrorTest } from '@/components/monitoring/ErrorTest';

export default function MonitoringDashboardPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Suspense fallback={<div className="p-4 border rounded">Loading system status...</div>}>
            <SystemStatus />
          </Suspense>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<div className="p-4 border rounded">Loading metrics...</div>}>
            <HealthMetrics />
          </Suspense>
          
          <Suspense fallback={<div className="p-4 border rounded">Loading log viewer...</div>}>
            <LogViewer />
          </Suspense>
        </div>
        
        <div className="mb-6">
          <Suspense fallback={<div className="p-4 border rounded">Loading error test...</div>}>
            <ErrorTest />
          </Suspense>
        </div>
      </div>
    </AdminLayout>
  );
} 