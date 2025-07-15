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

IMPORTANT: The only available Paradigm API endpoint is chat completion (POST /v2/chat/completions) with model 'alfred-4.2'. Web search and document search are NOT available. If the user requests web search or document search, do NOT include those steps in the workflow. Instead, add an explanation in the final answer to the user stating that those steps are not available via the Paradigm API.

The executable code should:
- Call the Vercel API endpoint: https://scaffold-ai-test1.vercel.app/api/execute-workflow
- Send the workflow description and parameters
- Stringify the parameters object before sending (Paradigm UI only supports string, not object, for body params)
- Handle the response and return results
- NOT call Paradigm APIs directly (the Vercel endpoint handles that)
- Only use available endpoints (chat completion with model 'alfred-4.2')
- If a step is unavailable, add an explanation to the user in the final result

The tool config should include:
- name: Descriptive name for the tool
- description: Detailed description for tool routing
- http_method: POST
- url: https://scaffold-ai-test1.vercel.app/api/execute-workflow
- headers: Authorization header for API key
- body_params: Parameters needed for the workflow (parameters must be type 'string' due to Paradigm UI limitation)
- Only include available steps (chat completion)

Example response format:
{
  "executable_code": "async function executeWorkflow(question) { const response = await fetch('https://scaffold-ai-test1.vercel.app/api/execute-workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflow_type: 'multi_step_workflow', parameters: JSON.stringify({ steps: [...] }) }) }); return response.json(); }",
  "tool_config": {
    "name": "Scaffold AI Workflow Executor",
    "description": "Executes AI workflows by calling the Scaffold.ai API endpoint which handles Paradigm API integration. Only chat completion is available. Web search and document search are not available.",
    "http_method": "POST",
    "url": "https://scaffold-ai-test1.vercel.app/api/execute-workflow",
    "headers": {"Authorization": "Bearer YOUR_API_KEY"},
    "body_params": {"workflow_type": "string", "parameters": "string"}
  }
}

Do NOT include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.`;

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
            content: 'You are an expert in workflow automation and API integration. Return ONLY valid JSON without any markdown formatting or explanatory text. The executable code should call the Vercel API endpoint, not Paradigm APIs directly.'
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

    // Try to parse the response as JSON, handling markdown wrapping
    try {
      let jsonContent = generatedContent.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsedResponse = JSON.parse(jsonContent);
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