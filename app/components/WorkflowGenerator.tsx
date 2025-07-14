"use client"

import { useState, useRef } from "react";
import { Copy, Check, Sparkles, Code, Settings } from "lucide-react";
import { motion } from "framer-motion";

const PLACEHOLDER = `Describe the input (user action and any provided data, such as prompts or documents). Specify the expected output (AI system response, including any artifacts like reports or actions in external tools). Clearly outline each intermediate step, detailing the inputs, outputs, and any additional tools, documents, or data sources involved.`;

export default function WorkflowGenerator() {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [executableCode, setExecutableCode] = useState("");
  const [toolConfig, setToolConfig] = useState("");
  const [error, setError] = useState("");
  const [copiedExecutable, setCopiedExecutable] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);

  // Example workflow config for demo
  const DEMO_WORKFLOW_TYPE = "multi_step_workflow";
  const DEMO_PARAMETERS = {
    steps: [
      { type: "docsearch", query: "AI workflow automation" },
      { type: "websearch", query: "AI workflow automation" }
    ],
    question: chatInput
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter a workflow description");
      return;
    }

    setIsGenerating(true);
    setError("");
    setExecutableCode("");
    setToolConfig("");

    try {
      const response = await fetch("/api/generate-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate workflow");
      }

      if (data.executable_code && data.tool_config) {
        setExecutableCode(data.executable_code);
        // Ensure tool_config is properly formatted as JSON string
        setToolConfig(typeof data.tool_config === 'string' 
          ? data.tool_config 
          : JSON.stringify(data.tool_config, null, 2)
        );
      } else if (data.raw_response) {
        setExecutableCode(data.raw_response);
        setToolConfig("See executable code for complete configuration");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'executable' | 'config') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'executable') {
        setCopiedExecutable(true);
        setTimeout(() => setCopiedExecutable(false), 2000);
      } else {
        setCopiedConfig(true);
        setTimeout(() => setCopiedConfig(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleChatSend = async () => {
    setChatError("");
    setChatResponse(null);
    if (!chatInput.trim()) {
      setChatError("Please enter a question to test the workflow.");
      return;
    }
    setChatLoading(true);
    try {
      const response = await fetch("https://scaffold-ai-test1.vercel.app/api/execute-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // No Authorization header for demo; add if needed
        },
        body: JSON.stringify({
          workflow_type: DEMO_WORKFLOW_TYPE,
          parameters: JSON.stringify({ ...DEMO_PARAMETERS, question: chatInput })
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to execute workflow");
      }
      setChatResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <section className="section-padding bg-gray-900/50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Generate Executable
            <span className="text-gradient block">AI Workflows</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Describe your workflow in natural language and get both executable code and Paradigm tool configuration.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Workflow Description
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Workflow
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {(executableCode || toolConfig) && (
            <div className="space-y-8">
              {/* Executable Code */}
              {executableCode && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Executable Code</h3>
                  </div>
                  <div className="relative">
                    <textarea
                      value={executableCode}
                      readOnly
                      className="w-full h-64 px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white font-mono text-sm resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(executableCode, 'executable')}
                      className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-md transition-colors"
                    >
                      {copiedExecutable ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white/70" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tool Configuration */}
              {toolConfig && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Paradigm Tool Configuration</h3>
                  </div>
                  <div className="relative">
                    <textarea
                      value={toolConfig}
                      readOnly
                      className="w-full h-48 px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white font-mono text-sm resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(toolConfig, 'config')}
                      className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-md transition-colors"
                    >
                      {copiedConfig ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white/70" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Next Steps:</h4>
                <ol className="text-white/80 text-sm space-y-1">
                  <li>1. Copy the Paradigm Tool Configuration and paste it into Paradigm's "Add Third Party Tool" form</li>
                  <li>2. The tool will point to your Vercel API endpoint: <code className="bg-gray-700 px-1 rounded">https://scaffold-ai-test1.vercel.app/api/execute-workflow</code></li>
                  <li>3. Add your Paradigm API key to the environment variables</li>
                  <li>4. The executable code shows how the workflow will be processed</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        {/* Chat Demo Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gray-800/60 border border-blue-500/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Demo: Test Your Workflow
            </h3>
            <p className="text-white/70 mb-4 text-sm">Enter a question below to test the generated workflow using the live API endpoint. This demo uses a sample multi-step workflow (docsearch + websearch).</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask a question to test the workflow..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading}
                className="btn-primary px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chatLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                Test Workflow
              </button>
            </div>
            {chatError && (
              <div className="mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{chatError}</p>
              </div>
            )}
            {chatResponse && (
              <div className="mt-4">
                <label className="block text-white/80 mb-1 text-sm">API Response:</label>
                <textarea
                  value={chatResponse}
                  readOnly
                  className="w-full h-40 px-4 py-3 bg-gray-900 border border-white/10 rounded-lg text-white font-mono text-xs resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 