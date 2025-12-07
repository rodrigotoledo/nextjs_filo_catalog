import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    const response = await fetch(`${fastApiUrl}/photos/search/text/?processed_only=true&q=${encodeURIComponent(q)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    // Map results to add url
    const resultsWithUrl = data.results.map(result => ({
      ...result.photo,
      url: `${fastApiUrl}/photos/file/${result.photo.id}`,
      similarity_score: result.similarity_score
    }));
    return NextResponse.json({
      results: resultsWithUrl,
      message: data.message
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
