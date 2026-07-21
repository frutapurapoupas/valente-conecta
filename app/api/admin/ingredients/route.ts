import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function GET() {
  const response = await fetch(`${BASE_URL}/api/cozinha/ingredients`);
  const data = await response.json();
  return NextResponse.json(data.data || []);
}

