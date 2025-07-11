import { Suspense } from 'react';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { JWT_SECRET } from '@/lib/env';
import { SystemStatus } from '@/components/monitoring/SystemStatus';
import { HealthMetrics } from '@/components/monitoring/HealthMetrics';
import { LogViewer } from '@/components/monitoring/LogViewer';
import { ErrorTest } from '@/components/monitoring/ErrorTest';
import { ResourceLimits } from '@/components/monitoring/ResourceLimits';
import AdminNavMenu from '@/components/AdminNavMenu';
import { SitemapStatusClient } from '@/components/monitoring/SitemapStatusClient';

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    
    return user;
  } catch {
    return null;
  }
}

export default async function MonitoringDashboardPage() {
  const user = await getUserFromCookie();
  
  if (!user) {
    return null;
  }
  
  return (
    <div>
      <AdminNavMenu userName={user.name} />
      
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Suspense fallback={<div className="p-4 border rounded">Loading system status...</div>}>
            <SystemStatus />
          </Suspense>
          <SitemapStatusClient />
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Resource Monitoring</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<div className="p-4 border rounded">Loading metrics...</div>}>
            <HealthMetrics />
          </Suspense>
          
          <Suspense fallback={<div className="p-4 border rounded">Loading resource limits...</div>}>
            <ResourceLimits />
          </Suspense>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Logs & Diagnostics</h2>
        <div className="grid grid-cols-1 mb-6">
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
    </div>
  );
} 