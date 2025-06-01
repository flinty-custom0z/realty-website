import { NextRequest, NextResponse } from 'next/server';
import { YandexMapsService } from '@/lib/services/YandexMapsService';

export async function POST(req: NextRequest) {
  try {
    const { address, uri } = await req.json();
    
    let result;
    
    if (uri) {
      result = await YandexMapsService.geocodeByUri(uri);
    } else if (address) {
      result = await YandexMapsService.geocodeAddress(address);
    } else {
      return NextResponse.json({ error: 'Address or URI required' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Could not geocode address' }, { status: 404 });
    }

    return NextResponse.json({
      coordinates: {
        lat: result.lat,
        lng: result.lng
      },
      fullAddress: result.fullAddress
    });
  } catch (error) {
    console.error('Error in geocode API:', error);
    return NextResponse.json({ error: 'Error processing geocode request' }, { status: 500 });
  }
} 