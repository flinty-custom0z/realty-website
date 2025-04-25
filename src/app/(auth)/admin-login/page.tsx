import { Suspense } from 'react';
import AdminLoginForm from '@/components/AdminLoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={<div className="p-6 bg-white rounded shadow-md">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}