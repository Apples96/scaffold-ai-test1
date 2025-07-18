'use client';

import { useState } from 'react';

interface WorkflowResult {
  executable_code: string;
  tool_config: any;
}

interface ExecutionResult {
  success: boolean;
  result: any;
  workflow_type: string;
  executed_at: string;
}

export default function WorkflowGenerator() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Direct execution state
  const [directExecutionInput, setDirectExecutionInput] = useState('');
  const [directExecutionLoading, setDirectExecutionLoading] = useState(false);
  const [directExecutionError, setDirectExecutionError] = useState('');
  const [directExecutionResult, setDirectExecutionResult] = useState<ExecutionResult | null>(null);

  const generateWorkflow = async () => {
    if (!description.trim()) {
      setError('Please enter a workflow description');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!result?.executable_code) {
      setDescriptionError('No workflow code available');
      return;
    }

    setDescriptionLoading(true);
    setDescriptionError('');
    setWorkflowDescription('');

    try {
      const response = await fetch('/api/generate-workflow-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ executableCode: result.executable_code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }

      setWorkflowDescription(data.description);
    } catch (err) {
      setDescriptionError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDescriptionLoading(false);
    }
  };

  const executeWorkflowDirectly = async (workflowData: any): Promise<ExecutionResult> => {
    const response = await fetch('/api/execute-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_type: workflowData.workflow_type,
        parameters: JSON.stringify(workflowData.parameters)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to execute workflow');
    }

    return await response.json();
  };

  const executeWorkflow = async () => {
    if (!result?.executable_code) {
      setDirectExecutionError("No workflow code available to execute");
      return;
    }

    if (!directExecutionInput.trim()) {
      setDirectExecutionError("Please provide input for the workflow");
      return;
    }

    setDirectExecutionLoading(true);
    setDirectExecutionError("");
    setDirectExecutionResult(null);

    try {
      // Simplified regex to extract workflow parameters from the generated code
      const codeMatch = result.executable_code.match(/workflow_type:\s*['"`]([^'"`]+)['"`][^}]*parameters:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/);
      
      if (!codeMatch) {
        throw new Error("Could not extract workflow parameters from generated code");
      }

      const workflowType = codeMatch[1];
      let parameters;
      
      try {
        // Clean up the parameters string to make it valid JSON
        let cleanParams = codeMatch[2]
          .replace(/(\w+):/g, '"$1":') // Add quotes to property names
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        
        parameters = JSON.parse(cleanParams);
      } catch (parseError) {
        throw new Error(`Failed to parse workflow parameters: ${parseError}`);
      }

      // Update parameters with user input
      if (parameters.search_query) {
        parameters.search_query = directExecutionInput;
      }
      if (parameters.query) {
        parameters.query = directExecutionInput;
      }
      if (parameters.user_input) {
        parameters.user_input = directExecutionInput;
      }

      // Execute the workflow
      const executionResult = await executeWorkflowDirectly({
        workflow_type: workflowType,
        parameters: parameters
      });

      setDirectExecutionResult(executionResult);
    } catch (error) {
      setDirectExecutionError(error instanceof Error ? error.message : 'Execution failed');
    } finally {
      setDirectExecutionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Workflow Generation Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Generate Workflow</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your workflow
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Search for customer feedback, analyze sentiment, and generate a prioritized action plan"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <button
            onClick={generateWorkflow}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Workflow'}
          </button>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
        </div>
      </div>

      {/* Generated Workflow Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Generated Workflow</h3>
          
          {/* Executable Code */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Executable Code</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm text-gray-900">
              <code>{result.executable_code}</code>
            </pre>
          </div>

          {/* Tool Configuration */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2 text-gray-700">Tool Configuration</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm text-gray-900">
              <code>{JSON.stringify(result.tool_config, null, 2)}</code>
            </pre>
          </div>

          {/* Generate Description Button */}
          <div className="mb-6">
            <button
              onClick={generateDescription}
              disabled={descriptionLoading}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {descriptionLoading ? 'Generating...' : 'Generate Description'}
            </button>
            {descriptionError && (
              <div className="text-red-600 text-sm mt-2">{descriptionError}</div>
            )}
          </div>

          {/* Workflow Description */}
          {workflowDescription && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-700">Workflow Description</h4>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap">{workflowDescription}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Direct Execution Section */}
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Test Workflow</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="execution-input" className="block text-sm font-medium text-gray-700 mb-2">
                Input for workflow
              </label>
              <input
                id="execution-input"
                type="text"
                value={directExecutionInput}
                onChange={(e) => setDirectExecutionInput(e.target.value)}
                placeholder="Enter your query or input"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <button
              onClick={executeWorkflow}
              disabled={directExecutionLoading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {directExecutionLoading ? 'Executing...' : 'Execute Workflow'}
            </button>
            {directExecutionError && (
              <div className="text-red-600 text-sm">{directExecutionError}</div>
            )}
          </div>

          {/* Execution Results */}
          {directExecutionResult && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-700">Execution Results</h4>
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="mb-2">
                  <strong>Status:</strong> {directExecutionResult.success ? 'Success' : 'Failed'}
                </div>
                {directExecutionResult.workflow_type && (
                  <div className="mb-2">
                    <strong>Workflow Type:</strong> {directExecutionResult.workflow_type}
                  </div>
                )}
                <div className="mb-2">
                  <strong>Executed At:</strong> {new Date(directExecutionResult.executed_at).toLocaleString()}
                </div>
                <div>
                  <strong>Result:</strong>
                  <pre className="mt-2 bg-white p-3 rounded text-sm overflow-x-auto text-gray-900">
                    <code>{JSON.stringify(directExecutionResult.result, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 