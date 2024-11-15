import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Add this to use Edge Runtime
export const maxDuration = 30; // This sets max duration to 30 seconds

export async function POST(req) {
  try {
    const { questionText, testQuestion } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2024-02-29'  // Updated version
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `მოცემულია მათემატიკის ტესტის ამოცანა: "${testQuestion}" მომხმარებლის კითხვა: "${questionText}" გთხოვთ დეტალურად აუხსნათ მომხმარებელს ამ ამოცანასთან დაკავშირებული საკითხები.`
        }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Anthropic API Error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server Error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
