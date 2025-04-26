import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSecureCookieOptions } from '@/lib/auth';

export async function POST() {
  try {
    // Update cookies handling to use await
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      ...getSecureCookieOptions(0), // Immediate expiration
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}