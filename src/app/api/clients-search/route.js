import { NextResponse } from 'next/server';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    // Construir URL com parâmetros
    let apiUrl = fastApiUrl;

    apiUrl += `/clients/search?q=${encodeURIComponent(q)}&page=${page}&limit=10`;

    console.log(apiUrl)
    console.log('Fetching clients from:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
