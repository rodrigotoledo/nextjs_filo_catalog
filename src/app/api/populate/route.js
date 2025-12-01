import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { term } = body;

    if (!term) {
      return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('term', term);

    const response = await fetch(`${fastApiUrl}/photos/populate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Populate FastAPI error:', errorText);
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Populate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
