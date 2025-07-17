// Workflow Templates for Template-Based Generation
// These are proven, tested patterns that can be customized by AI

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  pattern: string; // Natural language pattern to match
  template: any; // The workflow structure
  requiredParams: string[]; // Required parameters
  optionalParams: string[]; // Optional parameters
  validation: (params: any) => { valid: boolean; errors: string[] };
  examples: string[]; // Example user descriptions
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'document_search',
    name: 'Document Search',
    description: 'Search through documents with a query',
    pattern: 'search documents for {query}',
    template: {
      workflow_type: 'document_search',
      parameters: {
        query: '{query}',
        model: 'alfred-4.2',
        tool: 'DocumentSearch'
      }
    },
    requiredParams: ['query'],
    optionalParams: ['model', 'workspace_ids', 'file_ids'],
    validation: (params) => {
      const errors = [];
      if (!params.query || typeof params.query !== 'string') {
        errors.push('Query parameter is required and must be a string');
      }
      return { valid: errors.length === 0, errors };
    },
    examples: [
      'Search documents for customer complaints',
      'Find information about AI workflows in our documents',
      'Look for sales data in the uploaded files'
    ]
  },
  
  {
    id: 'document_analysis',
    name: 'Document Analysis',
    description: 'Analyze specific documents with a query',
    pattern: 'analyze {documents} for {query}',
    template: {
      workflow_type: 'document_analysis',
      parameters: {
        query: '{query}',
        document_ids: '{document_ids}',
        model: 'alfred-4.2'
      }
    },
    requiredParams: ['query', 'document_ids'],
    optionalParams: ['model'],
    validation: (params) => {
      const errors = [];
      if (!params.query) errors.push('Query parameter is required');
      if (!params.document_ids || !Array.isArray(params.document_ids)) {
        errors.push('Document IDs array is required');
      }
      return { valid: errors.length === 0, errors };
    },
    examples: [
      'Analyze the quarterly report for financial trends',
      'Review the contract documents for key terms',
      'Examine the research papers for methodology'
    ]
  },
  
  {
    id: 'multi_step_research',
    name: 'Multi-Step Research',
    description: 'Search documents and then analyze the results',
    pattern: 'research {topic} by searching documents and analyzing findings',
    template: {
      workflow_type: 'multi_step_workflow',
      parameters: {
        steps: [
          {
            type: 'document_search',
            query: '{search_query}',
            model: 'alfred-4.2'
          },
          {
            type: 'document_analysis',
            query: '{analysis_query}',
            document_ids: '{found_document_ids}',
            model: 'alfred-4.2'
          }
        ]
      }
    },
    requiredParams: ['search_query', 'analysis_query'],
    optionalParams: ['model'],
    validation: (params) => {
      const errors = [];
      if (!params.search_query) errors.push('Search query is required');
      if (!params.analysis_query) errors.push('Analysis query is required');
      return { valid: errors.length === 0, errors };
    },
    examples: [
      'Research AI automation by searching documents and analyzing the findings',
      'Find information about customer feedback and then analyze the patterns',
      'Search for technical documentation and analyze the implementation details'
    ]
  },
  
  {
    id: 'chat_completion',
    name: 'Chat Completion',
    description: 'Generate a response using chat completion',
    pattern: 'generate a response about {topic}',
    template: {
      workflow_type: 'chat_completion',
      parameters: {
        messages: [
          {
            role: 'user',
            content: '{user_message}'
          }
        ],
        model: 'alfred-4.2',
        temperature: 0.7
      }
    },
    requiredParams: ['user_message'],
    optionalParams: ['model', 'temperature'],
    validation: (params) => {
      const errors = [];
      if (!params.user_message) errors.push('User message is required');
      return { valid: errors.length === 0, errors };
    },
    examples: [
      'Generate a response about AI workflow automation',
      'Create a summary of the key points',
      'Explain the benefits of process automation'
    ]
  }
];

// Function to find the best matching template
export function findBestTemplate(userDescription: string): WorkflowTemplate | null {
  const description = userDescription.toLowerCase();
  
  // Score each template based on pattern matching
  const scoredTemplates = WORKFLOW_TEMPLATES.map(template => {
    let score = 0;
    
    // Check if template pattern keywords are present
    const patternWords = template.pattern.toLowerCase().split(' ');
    patternWords.forEach(word => {
      if (description.includes(word)) score += 1;
    });
    
    // Check example matches
    template.examples.forEach(example => {
      const exampleWords = example.toLowerCase().split(' ');
      const commonWords = exampleWords.filter(word => description.includes(word));
      if (commonWords.length > 2) score += 2;
    });
    
    return { template, score };
  });
  
  // Return the highest scoring template
  scoredTemplates.sort((a, b) => b.score - a.score);
  return scoredTemplates[0].score > 0 ? scoredTemplates[0].template : null;
}

// Function to customize a template with user parameters
export function customizeTemplate(
  template: WorkflowTemplate, 
  userDescription: string,
  extractedParams: any
): any {
  let customizedTemplate = JSON.parse(JSON.stringify(template.template));
  
  // Replace placeholders with actual values
  const replaceInObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Replace placeholders like {query} with actual values
        obj[key] = obj[key].replace(/\{(\w+)\}/g, (match: string, paramName: string) => {
          return extractedParams[paramName] || match;
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceInObject(obj[key]);
      }
    }
  };
  
  replaceInObject(customizedTemplate);
  return customizedTemplate;
}

// Function to extract parameters from user description
export function extractParameters(
  template: WorkflowTemplate, 
  userDescription: string
): any {
  const params: any = {};
  
  // Extract query parameters
  if (template.requiredParams.includes('query')) {
    // Look for patterns like "for X" or "about X"
    const queryMatch = userDescription.match(/(?:for|about|regarding)\s+([^.,]+)/i);
    if (queryMatch) {
      params.query = queryMatch[1].trim();
    }
  }
  
  // Extract search query for multi-step workflows
  if (template.requiredParams.includes('search_query')) {
    const searchMatch = userDescription.match(/(?:search|find|look for)\s+([^.,]+)/i);
    if (searchMatch) {
      params.search_query = searchMatch[1].trim();
    }
  }
  
  // Extract analysis query for multi-step workflows
  if (template.requiredParams.includes('analysis_query')) {
    const analysisMatch = userDescription.match(/(?:analyze|examine|review)\s+([^.,]+)/i);
    if (analysisMatch) {
      params.analysis_query = analysisMatch[1].trim();
    }
  }
  
  // Extract user message for chat completion
  if (template.requiredParams.includes('user_message')) {
    params.user_message = userDescription;
  }
  
  return params;
} 