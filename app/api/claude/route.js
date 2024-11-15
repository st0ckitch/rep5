import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { questionText, testQuestion } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2024-02-29'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 150,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: `მოკლე პასუხი: ამოცანა: "${testQuestion}" კითხვა: "${questionText}"`
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'გთხოვთ სცადოთ თავიდან' },
      { status: 500 }
    );
  }
}
