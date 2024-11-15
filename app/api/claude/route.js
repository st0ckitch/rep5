export const maxDuration = 60; // Set maximum duration to 60 seconds
export const dynamic = 'force-dynamic'; // Ensure the function is dynamic

import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { questionText, testQuestion } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2024-02-29'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500, // Reduced max tokens for faster response
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `მოკლედ აუხსენი მომხმარებელს შემდეგი: ამოცანა: "${testQuestion}" კითხვა: "${questionText}"`
        }]
      }),
      signal: controller.signal,
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
        { error: 'მოთხოვნამ ძალიან დიდხანს გასტანა. გთხოვთ სცადოთ თავიდან.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'სერვერის შეცდომა. გთხოვთ სცადოთ თავიდან.' },
      { status: 500 }
    );
  }
}
