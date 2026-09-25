/**
 * MCP Server Explorer Modal
 * Inspects VoyageMCP JSON-RPC 2.0 tools, status, and execution
 */

import React, { useState } from 'react';
import { Server, Code, Play, CheckCircle2, X, Terminal, Cpu } from 'lucide-react';
import { TRAVEL_MCP_TOOLS } from '../mcp/travel-mcp-server';
import { mcpClient } from '../services/mcpClient';

interface McpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpServerModal: React.FC<McpServerModalProps> = ({ isOpen, onClose }) => {
  const [selectedTool, setSelectedTool] = useState(TRAVEL_MCP_TOOLS[0].name);
  const [toolArgs, setToolArgs] = useState('{\n  "query": "Tokyo"\n}');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentTool = TRAVEL_MCP_TOOLS.find((t) => t.name === selectedTool) || TRAVEL_MCP_TOOLS[0];

  const handleRunTool = async () => {
    setIsLoading(true);
    setExecutionResult(null);
    try {
      const parsed = JSON.parse(toolArgs);
      const res = await mcpClient.callTool(selectedTool, parsed);
      setExecutionResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setExecutionResult(`Error: ${err.message || 'Tool execution failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    const tool = TRAVEL_MCP_TOOLS.find((t) => t.name === toolName);
    if (toolName === 'search_destinations') setToolArgs('{\n  "query": "Tokyo"\n}');
    else if (toolName === 'get_live_weather') setToolArgs('{\n  "destination": "Tokyo",\n  "travelMonth": "November"\n}');
    else if (toolName === 'check_visa_requirements') setToolArgs('{\n  "destinationCountry": "Japan",\n  "passportCountry": "Singapore (🇸🇬)"\n}');
    else if (toolName === 'get_currency_rates') setToolArgs('{\n  "currencyCode": "JPY",\n  "amountSGD": 500\n}');
    else if (toolName === 'search_flights') setToolArgs('{\n  "destination": "Tokyo",\n  "originAirport": "SIN",\n  "tripDurationDays": 8\n}');
    else if (toolName === 'search_accommodations') setToolArgs('{\n  "destination": "Tokyo",\n  "budgetPerNightSGD": 300\n}');
    else if (toolName === 'search_places_attractions') setToolArgs('{\n  "destination": "Tokyo",\n  "category": "culture"\n}');
    else if (toolName === 'calculate_route_transit') setToolArgs('{\n  "fromLocation": "Shibuya Sky",\n  "toLocation": "Meiji Jingu"\n}');
    else if (toolName === 'generate_itinerary') setToolArgs('{\n  "destination": "Tokyo",\n  "durationDays": 5,\n  "budgetTotalSGD": 3500\n}');
    else setToolArgs('{}');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">VoyageMCP Travel Protocol Server</h3>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active JSON-RPC 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Independent open travel architecture • No commercial API keys required • Standalone stdio & HTTP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Tool list sidebar */}
          <div className="border-r border-slate-800 bg-slate-950/40 p-4 md:col-span-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Registered MCP Tools ({TRAVEL_MCP_TOOLS.length})
              </span>
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              {TRAVEL_MCP_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition flex flex-col gap-1 border ${
                    selectedTool === tool.name
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-white shadow-xs'
                      : 'border-transparent text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-emerald-400">{tool.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="line-clamp-1 text-[11px] text-slate-400">
                    {tool.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-white font-medium">
                <Terminal className="h-3.5 w-3.5 text-sky-400" />
                <span>CLI Execution:</span>
              </div>
              <code className="block rounded bg-black/60 p-2 font-mono text-[11px] text-emerald-300">
                npm run mcp
              </code>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Runs <span className="font-mono text-slate-300">mcp-server.ts</span> in stdio mode compatible with Claude Desktop, Cursor, and any MCP client.
              </p>
            </div>
          </div>

          {/* Tool Details & Runner */}
          <div className="flex flex-col p-6 md:col-span-8 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-emerald-400" />
                <h4 className="font-mono text-base font-semibold text-white">{currentTool.name}</h4>
              </div>
              <p className="mt-1 text-sm text-slate-300">{currentTool.description}</p>
            </div>

            {/* Input Arguments */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  JSON-RPC Tool Arguments
                </label>
                <span className="text-[11px] text-slate-500 font-mono">schema: inputSchema.json</span>
              </div>
              <textarea
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Run Button */}
            <div className="flex justify-end">
              <button
                onClick={handleRunTool}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-emerald-400 transition disabled:opacity-50 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isLoading ? 'Executing Tool...' : 'Test Run MCP Tool'}
              </button>
            </div>

            {/* Results Console */}
            <div className="flex-1">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tool Output (JSON-RPC 2.0 Response)
              </span>
              <div className="min-h-[160px] max-h-[300px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                {executionResult ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{executionResult}</pre>
                ) : (
                  <span className="text-slate-500 italic">
                    Click "Test Run MCP Tool" to execute and inspect real normalized travel response data.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Protocol: <strong className="text-slate-200">2024-11-05</strong></span>
            <span>Transport: <strong className="text-slate-200">In-process / HTTP / Stdio</strong></span>
            <span>Commercial API Dependencies: <strong className="text-emerald-400">None (0)</strong></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
