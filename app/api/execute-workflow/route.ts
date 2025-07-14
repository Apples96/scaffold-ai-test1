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
    const PARADIGM_BASE_URL = 'https://paradigm.lighton.ai/api';
    
    if (!PARADIGM_API_KEY) {
      return NextResponse.json({ error: 'Paradigm API key not configured' }, { status: 500 });
    }

    let result;
    
    // Execute different workflow types by calling appropriate Paradigm endpoints
    switch (workflow_type) {
      case 'document_search':
        result = await executeDocumentSearch(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'web_search':
        result = await executeWebSearch(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'chat_completion':
        result = await executeChatCompletion(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'multi_step_workflow':
        result = await executeMultiStepWorkflow(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      default:
        return NextResponse.json({ error: 'Unknown workflow type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
      workflow_type,
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

async function executeDocumentSearch(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/docsearch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      documents: parameters.documents || [],
      max_results: parameters.max_results || 5
    })
  });

  if (!response.ok) {
    throw new Error(`Document search failed: ${response.statusText}`);
  }

  return await response.json();
}

async function executeWebSearch(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/websearch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      max_results: parameters.max_results || 5
    })
  });

  if (!response.ok) {
    throw new Error(`Web search failed: ${response.statusText}`);
  }

  return await response.json();
}

async function executeChatCompletion(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: parameters.model || 'gpt-4',
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

  for (const step of steps) {
    let stepResult;
    
    switch (step.type) {
      case 'docsearch':
        stepResult = await executeDocumentSearch({
          query: step.query,
          documents: step.documents,
          max_results: step.max_results
        }, apiKey, baseUrl);
        break;
        
      case 'websearch':
        stepResult = await executeWebSearch({
          query: step.query,
          max_results: step.max_results
        }, apiKey, baseUrl);
        break;
        
      case 'chat':
        stepResult = await executeChatCompletion({
          model: step.model,
          messages: step.messages,
          temperature: step.temperature,
          max_tokens: step.max_tokens
        }, apiKey, baseUrl);
        break;
        
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }

    results.push({
      step: step.name || step.type,
      result: stepResult,
      timestamp: new Date().toISOString()
    });

    // Update context for next steps
    currentContext[step.name || step.type] = stepResult;
  }

  return {
    workflow_results: results,
    final_context: currentContext
  };
} 