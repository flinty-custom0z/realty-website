import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('Login API route called');
    const body = await req.json();
    const { username, password } = body;
    
    console.log(`Attempting to authenticate user: ${username}`);

    const user = await authenticateUser(username, password);
    if (!user) {
      console.log('Authentication failed: Invalid credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`User authenticated successfully: ${user.name}`);
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
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}