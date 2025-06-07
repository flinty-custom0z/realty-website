import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { createLogger } from '@/lib/logging';

const logger = createLogger('CitiesAPI');
const citySchema = z.object({
  name: z.string().min(1, 'City name is required'),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(cities);
  } catch (error) {
    logger.error('Error fetching cities:', { error });
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    logger.info('Creating city with data:', body);
    const { name } = citySchema.parse(body);
    const slug = slugify(name);
    
    let city = await prisma.city.findUnique({ where: { slug } });
    if (!city) {
      city = await prisma.city.create({ data: { name, slug } });
      logger.info('City created:', { id: city.id, name: city.name });
    } else {
      logger.info('City already exists:', { id: city.id, name: city.name });
    }
    
    return NextResponse.json(city);
  } catch (error) {
    logger.error('Error creating city:', { error });
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 400 });
  }
} 