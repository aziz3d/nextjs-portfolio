import { NextResponse } from 'next/server';
import { skills } from '@/data/skills';

export async function GET() {
  return NextResponse.json({ skills });
}
