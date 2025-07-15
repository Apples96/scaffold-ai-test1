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
        result = await executeDocumentSearch(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'document_analysis':
        result = await executeDocumentAnalysis(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'image_analysis':
        result = await executeImageAnalysis(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
        break;
      case 'query':
        result = await executeQuery(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);
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

async function executeDocumentSearch(parameters: any, apiKey: string, baseUrl: string) {
  // Validate required parameters
  if (!parameters.query) {
    throw new Error('Query parameter is required for document search');
  }

  const response = await fetch(`${baseUrl}/chat/document-search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      model: parameters.model || 'alfred-4.2',
      workspace_ids: parameters.workspace_ids,
      file_ids: parameters.file_ids,
      chat_session_id: parameters.chat_session_id,
      company_scope: parameters.company_scope,
      private_scope: parameters.private_scope,
      tool: parameters.tool || 'DocumentSearch',
      private: parameters.private
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Document search failed: ${response.statusText} - ${errorData.error || ''}`);
  }

  return await response.json();
}

async function executeDocumentAnalysis(parameters: any, apiKey: string, baseUrl: string) {
  // Validate required parameters
  if (!parameters.query) {
    throw new Error('Query parameter is required for document analysis');
  }
  if (!parameters.document_ids || !Array.isArray(parameters.document_ids) || parameters.document_ids.length === 0) {
    throw new Error('Document IDs array is required for document analysis');
  }

  // Start the analysis
  const response = await fetch(`${baseUrl}/chat/document-analysis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      document_ids: parameters.document_ids,
      model: parameters.model || 'alfred-4.2',
      private: parameters.private
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Document analysis failed: ${response.statusText} - ${errorData.error || ''}`);
  }

  const result = await response.json();
  
  // If we got a chat_response_id, poll for completion
  if (result.chat_response_id) {
    return await pollDocumentAnalysis(result.chat_response_id, apiKey, baseUrl);
  }
  
  return result;
}

async function pollDocumentAnalysis(chatResponseId: number, apiKey: string, baseUrl: string, maxAttempts: number = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${baseUrl}/chat/document-analysis/${chatResponseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to poll document analysis: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'completed') {
      return result;
    } else if (result.status === 'failed') {
      throw new Error('Document analysis failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Document analysis timed out');
}

async function executeImageAnalysis(parameters: any, apiKey: string, baseUrl: string) {
  // Validate required parameters
  if (!parameters.query) {
    throw new Error('Query parameter is required for image analysis');
  }
  if (!parameters.document_ids || !Array.isArray(parameters.document_ids) || parameters.document_ids.length === 0) {
    throw new Error('Document IDs array is required for image analysis');
  }
  if (parameters.document_ids.length > 5) {
    throw new Error('Maximum 5 documents allowed for image analysis');
  }

  const response = await fetch(`${baseUrl}/chat/image-analysis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      document_ids: parameters.document_ids,
      model: parameters.model || 'alfred-4.2',
      private: parameters.private
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Image analysis failed: ${response.statusText} - ${errorData.error || ''}`);
  }

  return await response.json();
}

async function executeQuery(parameters: any, apiKey: string, baseUrl: string) {
  // Validate required parameters
  if (!parameters.query) {
    throw new Error('Query parameter is required for query');
  }

  const response = await fetch(`${baseUrl}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: parameters.query,
      collection: parameters.collection || 'base_collection',
      n: parameters.n || 5
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Query failed: ${response.statusText} - ${errorData.error || ''}`);
  }

  return await response.json();
}

async function executeChatCompletion(parameters: any, apiKey: string, baseUrl: string) {
  // Validate required parameters
  if (!parameters.messages || !Array.isArray(parameters.messages) || parameters.messages.length === 0) {
    throw new Error('Messages array is required for chat completion');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: parameters.model || 'alfred-4.2',
      messages: parameters.messages,
      temperature: parameters.temperature || 0.7,
      max_tokens: parameters.max_tokens || 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Chat completion failed: ${response.statusText} - ${errorData.error || ''}`);
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
    
    try {
      switch (step.type) {
        case 'document_search':
          stepResult = await executeDocumentSearch({
            query: step.query,
            model: step.model,
            workspace_ids: step.workspace_ids,
            file_ids: step.file_ids,
            chat_session_id: step.chat_session_id,
            company_scope: step.company_scope,
            private_scope: step.private_scope,
            tool: step.tool,
            private: step.private
          }, apiKey, baseUrl);
          break;
          
        case 'document_analysis':
          stepResult = await executeDocumentAnalysis({
            query: step.query,
            document_ids: step.document_ids,
            model: step.model,
            private: step.private
          }, apiKey, baseUrl);
          break;
          
        case 'image_analysis':
          stepResult = await executeImageAnalysis({
            query: step.query,
            document_ids: step.document_ids,
            model: step.model,
            private: step.private
          }, apiKey, baseUrl);
          break;
          
        case 'query':
          stepResult = await executeQuery({
            query: step.query,
            collection: step.collection,
            n: step.n
          }, apiKey, baseUrl);
          break;
          
        case 'websearch':
        case 'web_search':
          explanation += `Step '${step.name || step.type}': Web search is not available via the Paradigm API.\n`;
          results.push({
            step: step.name || step.type,
            result: null,
            explanation: 'Web search is not available via the Paradigm API.',
            timestamp: new Date().toISOString()
          });
          continue;
          
        case 'chat':
        case 'chat_completion':
          stepResult = await executeChatCompletion({
            model: step.model,
            messages: step.messages,
            temperature: step.temperature,
            max_tokens: step.max_tokens
          }, apiKey, baseUrl);
          break;
          
        default:
          explanation += `Step '${step.name || step.type}': Unknown or unsupported step type.\n`;
          results.push({
            step: step.name || step.type,
            result: null,
            explanation: 'Unknown or unsupported step type.',
            timestamp: new Date().toISOString()
          });
          continue;
      }

      results.push({
        step: step.name || step.type,
        result: stepResult,
        timestamp: new Date().toISOString()
      });

      // Update context for next steps
      currentContext[step.name || step.type] = stepResult;
      
    } catch (error) {
      explanation += `Step '${step.name || step.type}': Failed with error: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
      results.push({
        step: step.name || step.type,
        result: null,
        explanation: `Failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    result: {
      workflow_results: results,
      final_context: currentContext
    },
    explanation
  };
} 