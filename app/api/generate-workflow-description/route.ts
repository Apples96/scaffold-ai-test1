import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const { executableCode } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not set.' }, { status: 500 });
  }
  if (!executableCode || typeof executableCode !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid executable code.' }, { status: 400 });
  }

  const prompt = `You are an expert in workflow automation and the Paradigm AI platform. I have generated executable code for a workflow, and I need you to translate it into a clear, step-by-step description that explicitly mentions the Paradigm tools being used.

Here is the executable code:
\`\`\`javascript
${executableCode}
\`\`\`

Please analyze this code and create a clear, concise workflow description that:

1. **Explains each step in plain English**
2. **Explicitly mentions Paradigm tools** (DocSearch, Document Analysis, Image Analysis, Chat Completion, etc.)
3. **Describes the flow of data** between steps
4. **Mentions any specific parameters or configurations**
5. **Explains the expected output**

Focus on making it easy for a non-technical person to understand what the workflow does.

Available Paradigm tools to reference:
- **DocSearch** (Document Search): Searches through documents with a query
- **Document Analysis**: Analyzes specific documents with a query
- **Image Analysis**: Analyzes images in documents
- **Chat Completion**: Generates responses using the AI model
- **Query**: Retrieves document chunks based on a query
- **Multi-Sentence Workflow**: Splits input into sentences and processes each separately
- **Multi-Step Workflow**: Executes multiple steps in sequence

Return ONLY the workflow description in clear, numbered steps. Do not include any markdown formatting, code blocks, or explanatory text.`;

  try {
    console.log('Generating workflow description for code length:', executableCode.length);
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `You are an expert at explaining technical workflows in simple terms. Return ONLY the workflow description without any markdown formatting or explanatory text.

${prompt}`
        }
      ]
    });

    console.log('Claude Code response status:', response.stop_reason);
    
    if (response.stop_reason !== 'end_turn') {
      console.error('Claude Code API error details:', response);
      
      return NextResponse.json({ 
        error: `Claude Code API error: ${response.stop_reason || 'Unknown error'}`,
        details: response,
        status: 500
      }, { status: 500 });
    }

    const generatedDescription = response.content[0]?.type === 'text' ? response.content[0].text : null;

    if (!generatedDescription) {
      return NextResponse.json({ error: 'No description generated from Claude Code' }, { status: 500 });
    }

    console.log('Generated description length:', generatedDescription.length);

    return NextResponse.json({
      workflow_description: generatedDescription.trim()
    });

  } catch (error) {
    console.error('Error generating workflow description with Claude Code:', error);
    return NextResponse.json({ 
      error: 'Failed to generate workflow description with Claude Code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 