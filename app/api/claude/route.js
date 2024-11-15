import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { questionText, testQuestion } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `მოცემულია მათემატიკის ტესტის ამოცანა: "${testQuestion}" მომხმარებლის კითხვა: "${questionText}" გთხოვთ დეტალურად აუხსნათ მომხმარებელს ამ ამოცანასთან დაკავშირებული საკითხები.`
        }]
      })
    });

    const data = await response.json();

    // Check if the response contains an error
    if (!response.ok) {
      console.error('Anthropic API Error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to get response from Claude' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
