import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { term } = body;

    // Para clients, se não houver term, usar um valor padrão
    const populateTerm = term || 'clients';

    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    const formData = new FormData();
    formData.append('term', populateTerm);

    const response = await fetch(`${fastApiUrl}/clients/populate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Populate clients FastAPI error:', errorText);
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Populate clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
