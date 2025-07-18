import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not set' }, { status: 500 });
  }

  try {
    console.log('Testing Claude Code API with key:', apiKey.substring(0, 10) + '...');
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, API is working!"'
        }
      ]
    });

    console.log('Test response status:', response.stop_reason);

    if (response.stop_reason !== 'end_turn') {
      console.error('Test API error:', response);
      
      return NextResponse.json({
        error: `Claude Code API test failed: ${response.stop_reason || 'Unknown error'}`,
        details: response,
        status: 500
      }, { status: 500 });
    }

    const content = response.content[0]?.type === 'text' ? response.content[0].text : null;

    return NextResponse.json({
      success: true,
      message: 'Claude Code API is working!',
      response: content,
      usage: response.usage
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Failed to test Claude Code API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 