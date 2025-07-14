import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }
  if (!description || typeof description !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid description.' }, { status: 400 });
  }

  // Prompt for OpenAI to generate both executable code and tool configuration
  const prompt = `You are an expert in workflow automation and Paradigm's third-party tool integration. Given the following workflow description, generate TWO things:

1. EXECUTABLE CODE: JavaScript/TypeScript code that will execute the workflow by calling the execute-workflow API endpoint
2. PARADIGM TOOL CONFIG: A JSON configuration for Paradigm's third-party tool interface

Workflow Description: "${description}"

Available Paradigm API endpoints (from https://paradigm.lighton.ai/api/schema/swagger-ui/#/):
- Document Search: POST /docsearch
- Web Search: POST /websearch  
- Chat Completions: POST /chat/completions
- And other endpoints available in the Swagger documentation

Your response should be a JSON object with two fields:
1. "executable_code": JavaScript/TypeScript code that calls the execute-workflow API
2. "tool_config": JSON configuration for Paradigm third-party tool

The executable code should:
- Parse the workflow description into appropriate API calls
- Handle the workflow execution logic
- Return structured results

The tool config should include:
- name: Descriptive name for the tool
- description: Detailed description for tool routing
- http_method: POST
- url: https://scaffold-ai-test1.vercel.app/api/execute-workflow
- headers: Authorization header for API key
- body_params: Parameters needed for the workflow

Generate both the executable code and the Paradigm tool configuration in valid JSON format.`;

  try {
    console.log('Calling OpenAI API with key:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in workflow automation and API integration. Generate both executable code and tool configurations in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error details:', errorData);
      
      // Return more specific error information
      return NextResponse.json({ 
        error: `OpenAI API error: ${errorData.error?.message || errorData.error?.type || 'Unknown error'}`,
        details: errorData,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json({ error: 'No content generated from OpenAI' }, { status: 500 });
    }

    console.log('Generated content length:', generatedContent.length);

    // Try to parse the response as JSON
    try {
      const parsedResponse = JSON.parse(generatedContent);
      return NextResponse.json({
        executable_code: parsedResponse.executable_code,
        tool_config: parsedResponse.tool_config
      });
    } catch (parseError) {
      console.log('Failed to parse as JSON, returning raw content');
      // If parsing fails, return the raw content
      return NextResponse.json({
        raw_response: generatedContent,
        note: 'Response could not be parsed as JSON. Please review and format manually.'
      });
    }

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json({ 
      error: 'Failed to call OpenAI API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 