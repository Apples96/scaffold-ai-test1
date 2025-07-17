import { WORKFLOW_TEMPLATES, findBestTemplate, customizeTemplate, extractParameters, WorkflowTemplate } from './workflowTemplates';

export interface TemplateGenerationResult {
  success: boolean;
  workflow: any;
  template: WorkflowTemplate | null;
  confidence: number;
  errors: string[];
  fallbackToAI: boolean;
}

export async function generateWorkflowWithTemplates(
  userDescription: string,
  openaiApiKey: string
): Promise<TemplateGenerationResult> {
  
  // Step 1: Try to find a matching template
  const bestTemplate = findBestTemplate(userDescription);
  
  if (bestTemplate) {
    // Step 2: Extract parameters from user description
    const extractedParams = extractParameters(bestTemplate, userDescription);
    
    // Step 3: Validate extracted parameters
    const validation = bestTemplate.validation(extractedParams);
    
    if (validation.valid) {
      // Step 4: Customize the template
      const customizedWorkflow = customizeTemplate(bestTemplate, userDescription, extractedParams);
      
      return {
        success: true,
        workflow: customizedWorkflow,
        template: bestTemplate,
        confidence: 0.9, // High confidence for template-based generation
        errors: [],
        fallbackToAI: false
      };
    } else {
      // Parameters are invalid, try to use AI to fix them
      return await enhanceTemplateWithAI(bestTemplate, userDescription, extractedParams, validation.errors, openaiApiKey);
    }
  }
  
  // No template found, fallback to AI generation
  return {
    success: false,
    workflow: null,
    template: null,
    confidence: 0.0,
    errors: ['No matching template found'],
    fallbackToAI: true
  };
}

async function enhanceTemplateWithAI(
  template: WorkflowTemplate,
  userDescription: string,
  extractedParams: any,
  validationErrors: string[],
  openaiApiKey: string
): Promise<TemplateGenerationResult> {
  
  const prompt = `I have a workflow template that needs parameter enhancement. Here are the details:

Template: ${template.name}
Description: ${template.description}
Required Parameters: ${template.requiredParams.join(', ')}
Optional Parameters: ${template.optionalParams.join(', ')}

User Description: "${userDescription}"

Extracted Parameters: ${JSON.stringify(extractedParams, null, 2)}

Validation Errors: ${validationErrors.join(', ')}

Please help me extract or infer the missing parameters from the user description. Return ONLY a JSON object with the corrected parameters. If you cannot determine a parameter, use a reasonable default or placeholder.

Example response format:
{
  "query": "extracted or inferred query",
  "document_ids": ["default_document_id"],
  "model": "alfred-4.2"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting workflow parameters from natural language descriptions. Return ONLY valid JSON without any markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to enhance template with AI');
    }

    const data = await response.json();
    const enhancedParams = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    // Merge extracted and enhanced parameters
    const finalParams = { ...extractedParams, ...enhancedParams };
    
    // Validate again
    const finalValidation = template.validation(finalParams);
    
    if (finalValidation.valid) {
      const customizedWorkflow = customizeTemplate(template, userDescription, finalParams);
      
      return {
        success: true,
        workflow: customizedWorkflow,
        template: template,
        confidence: 0.7, // Medium confidence due to AI enhancement
        errors: [],
        fallbackToAI: false
      };
    } else {
      return {
        success: false,
        workflow: null,
        template: template,
        confidence: 0.3,
        errors: finalValidation.errors,
        fallbackToAI: true
      };
    }
    
  } catch (error) {
    return {
      success: false,
      workflow: null,
      template: template,
      confidence: 0.0,
      errors: ['Failed to enhance template with AI'],
      fallbackToAI: true
    };
  }
}

// Function to get template suggestions for a user description
export function getTemplateSuggestions(userDescription: string): WorkflowTemplate[] {
  const description = userDescription.toLowerCase();
  
  return WORKFLOW_TEMPLATES
    .map(template => {
      let score = 0;
      
      // Score based on pattern matching
      const patternWords = template.pattern.toLowerCase().split(' ');
      patternWords.forEach(word => {
        if (description.includes(word)) score += 1;
      });
      
      // Score based on example matches
      template.examples.forEach(example => {
        const exampleWords = example.toLowerCase().split(' ');
        const commonWords = exampleWords.filter(word => description.includes(word));
        if (commonWords.length > 1) score += 1;
      });
      
      return { template, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) // Return top 3 suggestions
    .map(item => item.template);
}

// Function to explain why a template was chosen
export function explainTemplateChoice(template: WorkflowTemplate, userDescription: string): string {
  const description = userDescription.toLowerCase();
  const reasons = [];
  
  // Check pattern matches
  const patternWords = template.pattern.toLowerCase().split(' ');
  const matchedWords = patternWords.filter(word => description.includes(word));
  if (matchedWords.length > 0) {
    reasons.push(`Matched keywords: ${matchedWords.join(', ')}`);
  }
  
  // Check example matches
  const matchingExamples = template.examples.filter(example => {
    const exampleWords = example.toLowerCase().split(' ');
    const commonWords = exampleWords.filter(word => description.includes(word));
    return commonWords.length > 1;
  });
  
  if (matchingExamples.length > 0) {
    reasons.push(`Similar to examples: ${matchingExamples.slice(0, 2).join(', ')}`);
  }
  
  return `Chose "${template.name}" template because: ${reasons.join('; ')}`;
} 