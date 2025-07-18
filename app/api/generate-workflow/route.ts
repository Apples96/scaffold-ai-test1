import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Workflow description is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    // Build the prompt string in a separate function to avoid TypeScript parsing issues
    const buildPrompt = (workflowDescription: string) => {
      return `You are an expert in workflow automation and Paradigm's AI platform integration. Given the following workflow description, generate TWO things:

1. EXECUTABLE CODE: JavaScript/TypeScript code that will execute the workflow by calling the execute-workflow API endpoint
2. PARADIGM TOOL CONFIG: A JSON configuration for Paradigm's third-party tool interface

Workflow Description: "${workflowDescription}"

## COMPREHENSIVE PARADIGM API ENDPOINTS REFERENCE

### 1. CHAT COMPLETIONS (/api/v2/chat/completions)
**Purpose**: Generate responses, summaries, explanations, or creative content using LightOn models
**Request Format**:
{
  "model": "alfred-4.2" (or other LightOn models),
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Your message here"
    }
  ],
  "temperature": 0.0-2.0 (optional),
  "max_tokens": 1000 (optional)
}
**Response Format**:
- content: The generated text response
- usage: Token usage information
**Best for**: Final answer generation, content summarization, creative writing, formatting responses
**Notes**: Compatible with OpenAI format, any LightOn model deployed on vLLM

### 2. DOCUMENT SEARCH (/api/v2/chat/document-search)
**Purpose**: Find relevant documents and generate responses based on document content
**Request Format**:
{
  "query": "string" (required),
  "model": "string" (optional, defaults to user's chat settings),
  "workspace_ids": [0] (optional),
  "file_ids": [0] (optional),
  "chat_session_id": 0 (optional, for follow-up conversations),
  "company_scope": true (optional),
  "private_scope": true (optional),
  "private": false (optional),
  "tool": "DocumentSearch" or "VisionDocumentSearch" (optional, default: "DocumentSearch")
}
**Response Format**:
{
  "chat_session_id": 0,
  "answer": "string",
  "user_instructions": "string",
  "chat_settings": {
    "company": "string",
    "instruction": "string"
  },
  "model": "string",
  "documents": [
    {
      "id": 0,
      "name": "string",
      "document_extracts": [
        {
          "id": 0,
          "created_at": "timestamp",
          "chat_response_id": 0,
          "document_id": 0,
          "page_start": 2147483647,
          "page_end": 9223372036854776000,
          "text": "string",
          "document_name": "string",
          "document_file_type": "string",
          "metadata": {...},
          "document_external_url": "string",
          "document_datasource_name": "string",
          "document_workspace_name": "string"
        }
      ]
    }
  ]
}
**Best for**: Information retrieval, fact-finding, document discovery, Q&A with documents
**Key Data for Chaining**: Use document_extracts[].document_id for subsequent analysis

### 3. DOCUMENT ANALYSIS (/api/v2/chat/document-analysis)
**Purpose**: Deep analysis of specific documents with detailed queries
**Request Format**:
{
  "query": "string" (required - analysis request or question),
  "document_ids": ["string"] (required - list of document IDs to analyze),
  "model": "string" (optional - specific language model),
  "private": false (optional)
}
**Response Format**:
{
  "chat_response_id": 0
}
**Polling Endpoint**: GET /api/v2/chat/document-analysis/{chat_response_id}
**Polling Response**:
{
  "status": "string",
  "result": "string",
  "detailed_analysis": "string", 
  "progress": "string"
}
**Best for**: Detailed document review, content analysis, extraction of specific information
**Key Data for Chaining**: Use chat_response_id to poll for results, then use result content

### 4. IMAGE ANALYSIS (/api/v2/chat/image-analysis)
**Purpose**: Analyze images within documents (charts, diagrams, photos)
**Request Format**:
{
  "query": "string" (required - question about the image),
  "document_ids": ["string"] (required - min: 1, max: 5 documents with images),
  "model": "string" (optional - vision-language model),
  "private": false (optional)
}
**Response Format**:
{
  "answer": "string"
}
**Best for**: Chart interpretation, diagram analysis, image content extraction
**Key Data for Chaining**: Use answer content directly in subsequent steps

### 5. QUERY (/api/v2/query)
**Purpose**: Retrieve specific document chunks or sections
**Request Format**:
{
  "query": "string" (required - search term),
  "collection": "string" (optional - defaults to "base_collection"),
  "n": 0 (optional - defaults to 5, max chunks to return)
}
**Response Format**:
[
  {
    "query": "string",
    "chunks": [
      {
        "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "text": "string",
        "metadata": {...},
        "score": 0
      }
    ]
  }
]
**Best for**: Precise document section retrieval, context gathering
**Key Data for Chaining**: Use chunk UUIDs or text content

### 6. FILTER CHUNKS (/api/v2/filter/chunks)
**Purpose**: Filter document chunks based on a query
**Request Format**:
{
  "query": "string" (required),
  "chunk_ids": ["string"] (required - list of chunk UUIDs),
  "n": 0 (optional - first n chunks that pass filter),
  "model": "string" (required - model name for filtering)
}
**Response Format**:
{
  "query": "string",
  "chunks": [
    {
      "uuid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "text": "string",
      "metadata": {...},
      "filter_score": 0
    }
  ]
}
**Best for**: Refining search results, filtering relevant content

### 7. QUERY REFORMULATION (/api/v2/query/reformulation)
**Purpose**: Enhance retrieval by reformulating queries
**Request Format**:
{
  "query": "string" (required - single string or list up to 10 queries),
  "model": "string" (required - model for reformulation)
}
**Response Format**:
[
  {
    "query": "string",
    "reformulation": "string"
  }
]
**Best for**: Improving search effectiveness, query optimization

### 8. CHATFLOW (/api/v2/tools/chatflows/)
**Purpose**: Create chat sessions with tool configuration and document context
**Request Format**:
{
  "messages": "string" (required),
  "model": "string" (required),
  "tool": "string" (optional),
  "workspace_ids": [0] (optional),
  "file_ids": [0] (optional),
  "company_scope": true (optional),
  "private_scope": true (optional)
}
**Response Format**:
{
  "id": 0,
  "created_at": "timestamp",
  "chat_message": 0,
  "text": "string",
  "error_message": "string",
  "completion": "uuid",
  "is_chosen": true,
  "feedback": {...},
  "document_extracts": [...],
  "source": "embeddings",
  "flag_created_at": "string",
  "tool_call": {...}
}
**Best for**: Complex chat interactions with document context

## WORKFLOW DESIGN PRINCIPLES

### Core Principles:
1. **Dynamic Generation**: Create workflows based on the user's specific needs, not predefined patterns
2. **Tool Chaining**: Use the response data from one tool as input for the next
3. **Context Awareness**: Pass relevant data (document_ids, analysis results, etc.) between steps
4. **Flexible Structure**: Design the workflow structure that best fits the user's requirements

### Data Flow Patterns:
- **Search → Analyze**: Use document_ids from search results in analysis steps
- **Analysis → Summarize**: Use analysis results as context for final generation
- **Multi-Source → Combine**: Aggregate results from multiple sources
- **Iterative Processing**: Process data in loops or conditional flows as needed

### Response Handling:
- **Extract document_ids** from search results for subsequent analysis
- **Use content** from analysis steps as context for final generation
- **Combine multiple results** into comprehensive responses
- **Handle empty results** gracefully with appropriate fallbacks

## EXECUTABLE CODE REQUIREMENTS

The executable code should:
- Call: https://scaffold-ai-test1.vercel.app/api/execute-workflow
- Design the workflow structure dynamically based on the user's needs
- Handle data flow between steps (passing document_ids, results, etc.)
- Include proper error handling and fallbacks
- Return structured results
- NOT call Paradigm APIs directly (the Vercel endpoint handles that)
- Be flexible and adaptable to different workflow patterns

## WORKFLOW STRUCTURE REQUIREMENTS

### CRITICAL: Use Steps Array Format

Your generated workflow MUST use a steps array structure. The parameters should be structured as:

IMPORTANT: Always use a steps array with the following structure:
- workflow_type: "your_custom_workflow_name"
- parameters: { steps: [...] }
- Each step should have: type, name, and relevant parameters
- Use descriptive step names like "search_step", "analysis_step"
- Reference previous steps using "step_name.field" syntax
- Pass data between steps using document_ids, content, etc.

### Key Points:
- **ALWAYS use steps array** - never single operation format
- **Use descriptive step names** (e.g., "search_step", "analysis_step")
- **Reference previous steps** using "step_name.field" syntax
- **Pass data between steps** using document_ids, content, etc.
- **Include proper error handling** in the executable code

## TOOL CONFIGURATION REQUIREMENTS

The tool config should include:
- name: Clear, descriptive name based on the workflow purpose
- description: Detailed explanation of what the workflow does
- http_method: POST
- url: https://scaffold-ai-test1.vercel.app/api/execute-workflow
- headers: Authorization header
- body_params: workflow_type (string), parameters (string)
- workflow_steps: Array describing each step with type, description, and parameters

## WORKFLOW TESTING AND VALIDATION

### CRITICAL REQUIREMENT: Test Your Generated Workflow

Before returning the final response, you MUST:

1. **Analyze the User's Intent**: 
   - What specific output does the user expect?
   - What format should the result be in?
   - What key information should be extracted or generated?

2. **Create Test Scenarios**:
   - Generate 2-3 realistic dummy examples that would be typical inputs for this workflow
   - For each example, predict what the expected output should be based on the user's description

3. **Validate Workflow Logic**:
   - Trace through your generated workflow step by step with each test example
   - Verify that the workflow will produce the expected output
   - Check that data flows correctly between steps
   - Ensure error handling is appropriate

4. **Iterate and Improve**:
   - If the workflow won't produce the expected output, modify it
   - Add missing steps or adjust parameters as needed
   - Ensure the final workflow truly solves the user's problem

### Example Validation Process:

**User Request**: "Search for customer feedback, analyze sentiment, and generate a prioritized action plan"

**Test Scenario 1**: 
- Input: "customer complaints about slow delivery"
- Expected Output: A structured action plan with prioritized items like "1. Optimize delivery routes (High Priority)"

**Test Scenario 2**:
- Input: "positive feedback about customer service"
- Expected Output: A plan highlighting strengths and areas to maintain

**Validation**: Ensure the workflow includes sentiment analysis and prioritization logic.

## RESPONSE FORMAT

Return ONLY a JSON object with this structure:
{
  "executable_code": "async function executeWorkflow(userInput) { /* dynamic implementation */ }",
  "tool_config": {
    "name": "Descriptive Name",
    "description": "Detailed description",
    "http_method": "POST",
    "url": "https://scaffold-ai-test1.vercel.app/api/execute-workflow",
    "headers": {"Authorization": "Bearer YOUR_API_KEY"},
    "body_params": {
      "workflow_type": {"type": "string", "description": "Type of workflow", "required": true},
      "parameters": {"type": "string", "description": "JSON string of parameters", "required": true}
    },
    "workflow_steps": [
      {
        "type": "tool_type",
        "description": "What this step does",
        "parameters": {"param": "value"}
      }
    ]
  }
}

## IMPORTANT GUIDELINES

- **NO predefined workflow types**: Create the workflow structure that best fits the user's needs
- **NO template matching**: Generate workflows dynamically based on the description
- **NO hardcoded patterns**: Let the AI determine the optimal flow
- **Be creative**: Invent new workflow patterns if needed
- **Be flexible**: Handle complex, multi-step, conditional, or iterative workflows
- **Focus on user intent**: Design workflows that truly solve the user's problem
- **TEST THOROUGHLY**: Ensure your workflow produces the expected output before returning it
- **Use correct step types**: Use "chat_completion" (singular), not "chat_completions" (plural)
- **Handle API responses properly**: Extract the right fields from each API response for chaining

IMPORTANT: 
- NO markdown formatting
- NO code blocks
- NO explanatory text
- ONLY the JSON object`;
    };

    const prompt = buildPrompt(description);

    console.log('Calling Claude Code API with key:', apiKey.substring(0, 10) + '...');
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `You are an expert in workflow automation and API integration. Return ONLY valid JSON without any markdown formatting or explanatory text. The executable code should call the Vercel API endpoint, not Paradigm APIs directly.

${prompt}`
        }
      ]
    });

    console.log('Claude Code response status:', response.stop_reason);
    
    if (response.stop_reason !== 'end_turn') {
      console.error('Claude Code API error details:', response);
      
      // Return more specific error information
      return NextResponse.json({ 
        error: `Claude Code API error: ${response.stop_reason || 'Unknown error'}`,
        details: response,
        status: 500
      }, { status: 500 });
    }

    const generatedContent = response.content[0]?.type === 'text' ? response.content[0].text : null;

    if (!generatedContent) {
      return NextResponse.json({ error: 'No content generated from Claude Code' }, { status: 500 });
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
    console.error('Error calling Claude Code:', error);
    return NextResponse.json({ 
      error: 'Failed to call Claude Code API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 