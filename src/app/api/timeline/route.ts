import { NextResponse } from 'next/server';
import { timeline } from '@/data/timeline';

export async function GET() {
  return NextResponse.json({ timeline });
}
