import { NextResponse } from 'next/server';
import { getSecureCookieOptions } from '@/lib/auth';

export async function POST() {
  try {
    // Create the response
    const response = NextResponse.json({ success: true });
    
    // Set an expired cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      ...getSecureCookieOptions(0), // Immediate expiration
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}