# Scaffold AI Landing Page

A modern landing page for Scaffold AI, featuring AI-powered workflow generation using Claude Code and Paradigm integration.

## Features

- **AI Workflow Generation**: Generate executable workflows from natural language descriptions using Claude Code
- **Paradigm Integration**: Seamless integration with Paradigm's AI platform for document search, analysis, and chat completions
- **Dynamic Workflow Execution**: Test generated workflows directly in the browser
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Claude Code (Anthropic) for workflow generation
- **Backend**: Next.js API routes
- **External APIs**: Paradigm AI platform integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key
- Paradigm API key (optional, for testing workflows)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cursor_test_3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Add your API keys to `.env`:
```env
# Anthropic API Key (required for workflow generation)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Paradigm API Key (optional, for testing workflows)
PARADIGM_API_KEY=your_paradigm_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/
│   ├── execute-workflow/
│   │   └── route.ts          # Dynamic workflow execution
│   ├── generate-workflow/
│   │   └── route.ts          # AI workflow generation
│   ├── generate-workflow-description/
│   │   └── route.ts          # Workflow description generation
│   ├── subscribe/
│   │   └── route.ts          # Email subscription API
│   └── test-claude/
│       └── route.ts          # Claude API testing
├── components/
│   ├── EmailSignup.tsx       # Email signup component
│   └── WorkflowGenerator.tsx # Workflow generation component
├── globals.css               # Global styles
├── layout.tsx                # Root layout
└── page.tsx                  # Main landing page
```

## Workflow Features

### AI Workflow Generation

The app generates executable workflows from natural language descriptions using Claude Code:

1. **Describe your workflow** in natural language
2. **Generate executable code** that calls the Paradigm API
3. **Get Paradigm tool configuration** for integration
4. **View workflow description** in human-readable format

### Dynamic Workflow Execution

Test generated workflows directly in the browser:

1. **Provide input** for the workflow (queries, questions, etc.)
2. **Execute workflow** using the `/api/execute-workflow` endpoint
3. **View results** with step-by-step execution details

### Supported Operations

- **Document Search**: Search through documents with queries
- **Document Analysis**: Analyze specific documents with detailed queries
- **Image Analysis**: Analyze images within documents
- **Chat Completion**: Generate responses using AI models
- **Query**: Retrieve specific document chunks
- **Multi-step Workflows**: Execute complex workflows with multiple steps

## API Endpoints

### `/api/generate-workflow`
Generates executable workflow code and Paradigm tool configuration from natural language descriptions.

**Method**: POST  
**Body**: `{ "description": "workflow description" }`  
**Response**: `{ "executable_code": "...", "tool_config": {...} }`

### `/api/execute-workflow`
Executes workflows by calling Paradigm API endpoints.

**Method**: POST  
**Body**: `{ "workflow_type": "...", "parameters": "..." }`  
**Response**: `{ "success": true, "result": {...}, "workflow_type": "...", "executed_at": "..." }`

### `/api/generate-workflow-description`
Generates human-readable descriptions of workflow code.

**Method**: POST  
**Body**: `{ "executableCode": "..." }`  
**Response**: `{ "description": "..." }`

### `/api/test-claude`
Tests the Claude Code API integration.

**Method**: POST  
**Response**: `{ "success": true, "message": "Claude Code API is working" }`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Code | Yes |
| `PARADIGM_API_KEY` | Paradigm API key for workflow execution | No |

## Development

### Running Tests

```bash
# Test Claude API integration
curl -X POST http://localhost:3000/api/test-claude

# Test workflow generation
curl -X POST http://localhost:3000/api/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{"description": "Search for customer feedback and analyze sentiment"}'
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 