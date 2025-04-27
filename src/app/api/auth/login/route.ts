import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, getSecureCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('Login API route called');
    const body = await req.json();
    const { username, password } = body;
    
    // Don't log usernames
    console.log('Authentication attempt');

    const user = await authenticateUser(username, password);
    if (!user) {
      console.log('Authentication failed');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Avoid logging user names
    console.log('Authentication successful');
    const token = generateToken(user.id);
    
    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      }
    });
    
    // Set the cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: token,
      ...getSecureCookieOptions(60 * 60 * 24), // 1 day in seconds
    });
    
    return response;
  } catch (error) {
    // Avoid logging full error objects
    console.error('Login error occurred');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}