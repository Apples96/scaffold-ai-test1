import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { workflow_type, parameters } = await req.json();
    // If parameters is a string (Paradigm workaround), parse it as JSON
    let parsedParameters = parameters;
    if (typeof parameters === 'string') {
      try {
        parsedParameters = JSON.parse(parameters);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid parameters: could not parse JSON string.' }, { status: 400 });
      }
    }
    
    // Paradigm API configuration
    const PARADIGM_API_KEY = process.env.PARADIGM_API_KEY;
    const PARADIGM_BASE_URL = 'https://paradigm.lighton.ai/api/v2';
    
    if (!PARADIGM_API_KEY) {
      return NextResponse.json({ error: 'Paradigm API key not configured' }, { status: 500 });
    }

    let result;
    let explanation = '';
    
    // Execute different workflow types by calling appropriate Paradigm endpoints
    switch (workflow_type) {
      case 'document_search':
        explanation = 'Document search is currently not available via the Paradigm API.';
        result = null;
        break;
      case 'web_search':
        explanation = 'Web search is not available via the Paradigm API.';
        result = null;
        break;
      case 'chat_completion':
        result = await executeChatCompletion(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'multi_step_workflow':
        const multiStep = await executeMultiStepWorkflow(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        result = multiStep.result;
        explanation = multiStep.explanation;
        break;
      default:
        return NextResponse.json({ error: 'Unknown workflow type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
      workflow_type,
      explanation,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Document search is not available
// async function executeDocumentSearch(parameters: any, apiKey: string, baseUrl: string) { ... }

// Web search is not available
// async function executeWebSearch(parameters: any, apiKey: string, baseUrl: string) { ... }

async function executeChatCompletion(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'alfred-4.2',
      messages: parameters.messages,
      temperature: parameters.temperature || 0.7,
      max_tokens: parameters.max_tokens || 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Chat completion failed: ${response.statusText}`);
  }

  return await response.json();
}

async function executeMultiStepWorkflow(parameters: any, apiKey: string, baseUrl: string) {
  const { steps, context } = parameters;
  const results = [];
  let currentContext = context || {};
  let explanation = '';

  for (const step of steps) {
    let stepResult;
    if (step.type === 'websearch' || step.type === 'web_search') {
      explanation += `Step '${step.name || step.type}': Web search is not available via the Paradigm API.\n`;
      results.push({
        step: step.name || step.type,
        result: null,
        explanation: 'Web search is not available via the Paradigm API.',
        timestamp: new Date().toISOString()
      });
      continue;
    }
    if (step.type === 'docsearch' || step.type === 'document_search') {
      explanation += `Step '${step.name || step.type}': Document search is not available via the Paradigm API.\n`;
      results.push({
        step: step.name || step.type,
        result: null,
        explanation: 'Document search is not available via the Paradigm API.',
        timestamp: new Date().toISOString()
      });
      continue;
    }
    if (step.type === 'chat' || step.type === 'chat_completion') {
      stepResult = await executeChatCompletion({
        messages: step.messages,
        temperature: step.temperature,
        max_tokens: step.max_tokens
      }, apiKey, baseUrl);
      results.push({
        step: step.name || step.type,
        result: stepResult,
        timestamp: new Date().toISOString()
      });
      currentContext[step.name || step.type] = stepResult;
      continue;
    }
    // Unknown step type
    explanation += `Step '${step.name || step.type}': Unknown or unsupported step type.\n`;
    results.push({
      step: step.name || step.type,
      result: null,
      explanation: 'Unknown or unsupported step type.',
      timestamp: new Date().toISOString()
    });
  }

  return {
    result: {
      workflow_results: results,
      final_context: currentContext
    },
    explanation
  };
} 