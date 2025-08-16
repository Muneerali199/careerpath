// app/api/perplexity/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const apiKey = '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';
    const apiUrl = 'https://api.perplexity.ai/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-small-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an AI career assistant that helps with career exploration, resume optimization, skill development, and job searching. Provide concise, actionable advice.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Perplexity API error:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}