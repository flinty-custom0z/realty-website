import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, getSecureCookieOptions } from '@/lib/auth';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      throw new ApiError('Username and password are required', 400);
    }
    
    // Don't log usernames
    console.log('Authentication attempt');

    const user = await authenticateUser(username, password);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
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
    return handleApiError(error);
  }
}