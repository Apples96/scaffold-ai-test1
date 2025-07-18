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
    
    // Check if API key is configured
    if (!PARADIGM_API_KEY) {
      console.log('No Paradigm API key found, returning error');
      return NextResponse.json({ 
        error: 'Paradigm API key not configured',
        details: 'Please set the PARADIGM_API_KEY environment variable to use this workflow execution service.',
        status: 500
      }, { status: 500 });
    }
    
    console.log('Paradigm API key found, making real API calls');
    console.log('Workflow type:', workflow_type);
    console.log('Parameters:', JSON.stringify(parsedParameters, null, 2));

    // Dynamic workflow execution - handle any workflow structure
    const result = await executeDynamicWorkflow(parsedParameters, PARADIGM_API_KEY, PARADIGM_BASE_URL);

    return NextResponse.json({
      success: true,
      result,
      workflow_type,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json({ 
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function executeDynamicWorkflow(parameters: any, apiKey: string, baseUrl: string) {
  const { steps, context, ...otherParams } = parameters;
  const results = [];
  let currentContext = context || {};
  let explanation = '';

  // If we have steps, execute them sequentially
  if (steps && Array.isArray(steps)) {
    for (const step of steps) {
      let stepResult;
      
      try {
        stepResult = await executeStep(step, apiKey, baseUrl, currentContext);
        
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
      workflow_results: results,
      final_context: currentContext,
      explanation
    };
  }

  // If no steps, check if this is a single operation with a type
  if (parameters.type || parameters.operation) {
    try {
      const singleResult = await executeStep(parameters, apiKey, baseUrl, currentContext);
      return {
        result: singleResult,
        context: currentContext
      };
    } catch (error) {
      throw new Error(`Single operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // If no steps and no type, this might be a simple parameter object
  // Try to infer the operation type from the parameters
  if (parameters.query) {
    // Likely a document search
    try {
      const searchResult = await executeDocumentSearch(parameters, apiKey, baseUrl);
      return {
        result: searchResult,
        context: currentContext
      };
    } catch (error) {
      throw new Error(`Document search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // If we can't determine the operation type, return an error
  throw new Error('Unable to determine workflow operation type. Please provide either a steps array or specify the operation type.');
}

async function executeStep(step: any, apiKey: string, baseUrl: string, context: any) {
  const stepType = step.type || step.operation;
  
  switch (stepType) {
    case 'document_search':
    case 'docsearch':
      return await executeDocumentSearch({
        query: step.query,
        model: step.model || 'alfred-4.2',
        workspace_ids: step.workspace_ids,
        file_ids: step.file_ids,
        chat_session_id: step.chat_session_id,
        company_scope: step.company_scope,
        private_scope: step.private_scope,
        tool: step.tool || 'DocumentSearch',
        private: step.private
      }, apiKey, baseUrl);
      
    case 'document_analysis':
    case 'docanalysis':
      return await executeDocumentAnalysis({
        query: step.query,
        document_ids: step.document_ids,
        model: step.model || 'alfred-4.2',
        private: step.private
      }, apiKey, baseUrl);
      
    case 'image_analysis':
    case 'imageanalysis':
      return await executeImageAnalysis({
        query: step.query,
        document_ids: step.document_ids,
        model: step.model || 'alfred-4.2',
        private: step.private
      }, apiKey, baseUrl);
      
    case 'query':
    case 'search':
      return await executeQuery({
        query: step.query,
        collection: step.collection,
        n: step.n
      }, apiKey, baseUrl);
      
    case 'chat':
    case 'chat_completion':
    case 'completion':
      return await executeChatCompletion({
        model: step.model || 'alfred-4.2',
        messages: step.messages,
        temperature: step.temperature,
        max_tokens: step.max_tokens
      }, apiKey, baseUrl);
      
    default:
      throw new Error(`Unknown or unsupported step type: ${stepType}`);
  }
}

async function executeDocumentSearch(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/document-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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
    throw new Error(`Document search failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function executeDocumentAnalysis(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/document-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: parameters.query,
      document_ids: parameters.document_ids,
      model: parameters.model || 'alfred-4.2',
      private: parameters.private
    })
  });

  if (!response.ok) {
    throw new Error(`Document analysis failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function executeImageAnalysis(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/image-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: parameters.query,
      document_ids: parameters.document_ids,
      model: parameters.model || 'alfred-4.2',
      private: parameters.private
    })
  });

  if (!response.ok) {
    throw new Error(`Image analysis failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function executeQuery(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query: parameters.query,
      collection: parameters.collection,
      n: parameters.n
    })
  });

  if (!response.ok) {
    throw new Error(`Query failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function executeChatCompletion(parameters: any, apiKey: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: parameters.model || 'alfred-4.2',
      messages: parameters.messages,
      temperature: parameters.temperature,
      max_tokens: parameters.max_tokens
    })
  });

  if (!response.ok) {
    throw new Error(`Chat completion failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
} 