import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    const response = await fetch(`${fastApiUrl}/photos?page=${page}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('Fetched photos data:', data);
    // Map photos to add url
    const photosWithUrl = data.photos.map(photo => ({
      ...photo,
      url: `${fastApiUrl}/photos/file/${photo.id}`
    }));
    return NextResponse.json({
      ...data,
      photos: photosWithUrl
    });
  } catch (error) {
    console.error('Fetch photos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
