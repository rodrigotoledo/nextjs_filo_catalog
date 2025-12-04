import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const clientId = formData.get('clientId');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required for frontend association' }, { status: 400 });
    }

    // Create a new FormData to send to FastAPI
    const fastApiFormData = new FormData();
    files.forEach((file, index) => {
      fastApiFormData.append('file', file);
    });
    fastApiFormData.append('create_client', 'true');
    // Note: clientId is not sent to FastAPI as the endpoint doesn't expect it
    // The clientId is used only for frontend association

    // Get the FastAPI URL from env
    const fastApiUrl = process.env.FASTAPI_URL;
    if (!fastApiUrl) {
      return NextResponse.json({ error: 'FastAPI URL not configured' }, { status: 500 });
    }

    // Send to FastAPI
    const response = await fetch(`${fastApiUrl}/clients/upload-document`, {
      method: 'POST',
      body: fastApiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
