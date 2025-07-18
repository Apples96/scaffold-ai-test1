export interface WorkflowParameters {
  workflow_type: string;
  parameters: any;
}

export interface ParsedWorkflow {
  workflow_type: string;
  parameters: any;
  rawCode: string;
  isValid: boolean;
  error?: string;
}

/**
 * Extracts workflow parameters from generated executable code
 * Supports multiple code patterns and formats
 */
export function parseWorkflowCode(code: string): ParsedWorkflow {
  const rawCode = code.trim();
  
  try {
    // Pattern 1: Direct JSON.stringify call with workflow_type and parameters
    const jsonPattern = /JSON\.stringify\(\s*\{\s*workflow_type:\s*['"`]([^'"`]+)['"`]\s*,\s*parameters:\s*JSON\.stringify\(\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\s*\)\s*\}\s*\)/;
    const jsonMatch = rawCode.match(jsonPattern);
    
    if (jsonMatch) {
      const workflowType = jsonMatch[1];
      const parametersStr = jsonMatch[2];
      
              try {
          // Clean up the parameters string to make it valid JSON
          let cleanParams = parametersStr
            .replace(/(\w+):/g, '"$1":') // Add quotes to property names
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          // Handle variable references by replacing them with empty strings
          cleanParams = cleanParams.replace(/:\s*(\w+)(?=\s*[,\}])/g, ': ""');
          
          const parameters = JSON.parse(cleanParams);
          return {
            workflow_type: workflowType,
            parameters,
            rawCode,
            isValid: true
          };
        } catch (parseError) {
          return {
            workflow_type: workflowType,
            parameters: {},
            rawCode,
            isValid: false,
            error: `Failed to parse parameters JSON: ${parseError}`
          };
        }
    }

    // Pattern 2: Object literal with workflow_type and parameters
    const objectPattern = /workflow_type:\s*['"`]([^'"`]+)['"`]\s*,\s*parameters:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/;
    const objectMatch = rawCode.match(objectPattern);
    
    if (objectMatch) {
      const workflowType = objectMatch[1];
      const parametersStr = objectMatch[2];
      
              try {
          // Clean up the parameters string to make it valid JSON
          let cleanParams = parametersStr
            .replace(/(\w+):/g, '"$1":') // Add quotes to property names
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          // Handle variable references by replacing them with empty strings
          cleanParams = cleanParams.replace(/:\s*(\w+)(?=\s*[,\}])/g, ': ""');
          
          const parameters = JSON.parse(cleanParams);
          return {
            workflow_type: workflowType,
            parameters,
            rawCode,
            isValid: true
          };
        } catch (parseError) {
          return {
            workflow_type: workflowType,
            parameters: {},
            rawCode,
            isValid: false,
            error: `Failed to parse parameters object: ${parseError}`
          };
        }
    }

    // Pattern 3: Function parameters in executeWorkflow call
    const functionPattern = /executeWorkflow\(\s*['"`]([^'"`]+)['"`]\s*\)/;
    const functionMatch = rawCode.match(functionPattern);
    
    if (functionMatch) {
      const userInput = functionMatch[1];
      return {
        workflow_type: 'multi_sentence_workflow',
        parameters: { user_input: userInput },
        rawCode,
        isValid: true
      };
    }

    // Pattern 4: Multi-step workflow with multiple API calls (check this BEFORE single workflow patterns)
    // First, count how many workflow_type patterns we find
    const workflowTypeMatches = rawCode.match(/workflow_type:\s*['"`]([^'"`]+)['"`]/g);
    const hasMultipleWorkflows = workflowTypeMatches && workflowTypeMatches.length > 1;
    
    if (hasMultipleWorkflows) {
      // Extract all workflow steps from the code
      const workflowSteps = [];
      const stepRegex = /workflow_type:\s*['"`]([^'"`]+)['"`]\s*,\s*parameters:\s*JSON\.stringify\(\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\s*\)/g;
      let stepMatch;
      
      while ((stepMatch = stepRegex.exec(rawCode)) !== null) {
        try {
          const stepType = stepMatch[1];
          const stepParamsStr = stepMatch[2];
          
          // Clean up the parameters string
          let cleanParams = stepParamsStr
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*(\w+)(?=\s*[,\}])/g, ': ""');
          
          const stepParams = JSON.parse(cleanParams);
          
          workflowSteps.push({
            type: stepType,
            ...stepParams
          });
        } catch (parseError) {
          console.warn(`Failed to parse step parameters: ${parseError}`);
        }
      }
      
      if (workflowSteps.length > 1) {
        return {
          workflow_type: 'multi_step_workflow',
          parameters: { steps: workflowSteps },
          rawCode,
          isValid: true
        };
      }
    }

    // Pattern 5: Multi-step workflow with steps array
    const multiStepPattern = /steps:\s*\[([^\]]+)\]/;
    const multiStepMatch = rawCode.match(multiStepPattern);
    
    if (multiStepMatch) {
      try {
        const stepsStr = `[${multiStepMatch[1]}]`;
        const steps = eval(`(${stepsStr})`);
        return {
          workflow_type: 'multi_step_workflow',
          parameters: { steps },
          rawCode,
          isValid: true
        };
      } catch (parseError) {
        return {
          workflow_type: 'multi_step_workflow',
          parameters: { steps: [] },
          rawCode,
          isValid: false,
          error: `Failed to parse multi-step workflow: ${parseError}`
        };
      }
    }

    // Pattern 6: Simple query parameter
    const queryPattern = /query:\s*['"`]([^'"`]+)['"`]/;
    const queryMatch = rawCode.match(queryPattern);
    
    if (queryMatch) {
      const query = queryMatch[1];
      return {
        workflow_type: 'document_search',
        parameters: { query },
        rawCode,
        isValid: true
      };
    }

    // Pattern 7: Function that calls executeWorkflow with userInput parameter
    const userInputPattern = /executeWorkflow\(\s*userInput\s*\)/;
    const userInputMatch = rawCode.match(userInputPattern);
    
    if (userInputMatch) {
      return {
        workflow_type: 'multi_sentence_workflow',
        parameters: { user_input: '' }, // Will be filled by user input
        rawCode,
        isValid: true
      };
    }

    // Pattern 8: Function that calls executeWorkflow with query parameter
    const queryParamPattern = /executeWorkflow\(\s*query\s*\)/;
    const queryParamMatch = rawCode.match(queryParamPattern);
    
    if (queryParamMatch) {
      return {
        workflow_type: 'document_search',
        parameters: { query: '' }, // Will be filled by user input
        rawCode,
        isValid: true
      };
    }

    // If no patterns match, return invalid result
    return {
      workflow_type: '',
      parameters: {},
      rawCode,
      isValid: false,
      error: 'Could not extract workflow parameters from the generated code'
    };

  } catch (error) {
    return {
      workflow_type: '',
      parameters: {},
      rawCode,
      isValid: false,
      error: `Parsing error: ${error}`
    };
  }
}

/**
 * Executes a workflow directly using the parsed parameters
 */
export async function executeWorkflowDirectly(parsedWorkflow: ParsedWorkflow): Promise<any> {
  if (!parsedWorkflow.isValid) {
    throw new Error(`Invalid workflow: ${parsedWorkflow.error}`);
  }

  const response = await fetch('/api/execute-workflow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_type: parsedWorkflow.workflow_type,
      parameters: parsedWorkflow.parameters
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Validates if the workflow code can be executed
 */
export function validateWorkflowCode(code: string): { isValid: boolean; error?: string; workflowType?: string } {
  const parsed = parseWorkflowCode(code);
  
  if (!parsed.isValid) {
    return { isValid: false, error: parsed.error };
  }

  // Check if workflow type is supported
  const supportedTypes = [
    'document_search',
    'document_analysis', 
    'image_analysis',
    'query',
    'chat_completion',
    'multi_sentence_workflow',
    'multi_step_workflow'
  ];

  if (!supportedTypes.includes(parsed.workflow_type)) {
    return { 
      isValid: false, 
      error: `Unsupported workflow type: ${parsed.workflow_type}`,
      workflowType: parsed.workflow_type
    };
  }

  return { isValid: true, workflowType: parsed.workflow_type };
} 