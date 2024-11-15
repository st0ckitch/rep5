import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use edge runtime for streaming
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const { questionText, testQuestion } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2024-02-29'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4080,
        temperature: 0.7,
        stream: true, // Enable streaming
        messages: [{
          role: 'user',
          content: `მოკლე პასუხი: ამოცანა: "${testQuestion}" კითხვა: "${questionText}"`
        }]
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const stream = response.body;
    const reader = stream.getReader();

    let result = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      result += chunk;
    }

    try {
      const jsonResponse = JSON.parse(result);
      return NextResponse.json(jsonResponse);
    } catch {
      return NextResponse.json({ content: [{ text: result }] });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'გთხოვთ სცადოთ თავიდან' },
      { status: 500 }
    );
  }
}
