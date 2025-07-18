import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { executableCode } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
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
            content: 'You are an expert at explaining technical workflows in simple terms. Return ONLY the workflow description without any markdown formatting or explanatory text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error details:', errorData);
      
      return NextResponse.json({ 
        error: `OpenAI API error: ${errorData.error?.message || errorData.error?.type || 'Unknown error'}`,
        details: errorData,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    const generatedDescription = data.choices[0]?.message?.content;

    if (!generatedDescription) {
      return NextResponse.json({ error: 'No description generated from OpenAI' }, { status: 500 });
    }

    console.log('Generated description length:', generatedDescription.length);

    return NextResponse.json({
      workflow_description: generatedDescription.trim()
    });

  } catch (error) {
    console.error('Error generating workflow description:', error);
    return NextResponse.json({ 
      error: 'Failed to generate workflow description',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 