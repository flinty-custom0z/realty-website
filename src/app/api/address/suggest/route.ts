import { NextRequest, NextResponse } from 'next/server';
import { YandexMapsService } from '@/lib/services/YandexMapsService';

export async function POST(req: NextRequest) {
  try {
    const { text, center } = await req.json();
    
    if (!text || text.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await YandexMapsService.getSuggestions(text, {
      center,
      limit: 5
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in suggest API:', error);
    return NextResponse.json({ error: 'Error processing suggestion request' }, { status: 500 });
  }
} 