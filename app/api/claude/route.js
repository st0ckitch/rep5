import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { questionText, testQuestion } = await req.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `მოცემულია მათემატიკის ტესტის ამოცანა: "${testQuestion}" მომხმარებლის კითხვა: "${questionText}" გთხოვთ დეტალურად აუხსნათ მომხმარებელს ამ ამოცანასთან დაკავშირებული საკითხები.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Claude' },
      { status: 500 }
    );
  }
}
