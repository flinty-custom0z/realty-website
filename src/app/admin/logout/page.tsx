'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.replace('/'); // Redirect to home page after logout
    };
    logout();
  }, [router]);

  return <div className="p-6 text-center">Выход...</div>;
} 