import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set' }, { status: 500 });
  }

  try {
    console.log('Testing OpenAI API with key:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, API is working!"'
          }
        ],
        max_tokens: 10
      })
    });

    console.log('Test response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Test API error:', errorData);
      
      return NextResponse.json({
        error: `OpenAI API test failed: ${errorData.error?.message || 'Unknown error'}`,
        details: errorData,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working!',
      response: content,
      usage: data.usage
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Failed to test OpenAI API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 