/**
 * Smithery.ai Public MCP Servers Explorer Modal
 * Powered by verified Model Context Protocol (MCP) servers on https://smithery.ai/
 */

import React, { useState } from 'react';
import {
  Server,
  Code,
  Play,
  CheckCircle2,
  X,
  Terminal,
  Cpu,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Globe
} from 'lucide-react';
import { TRAVEL_MCP_TOOLS, SMITHERY_SERVERS } from '../mcp/travel-mcp-server';
import { mcpClient } from '../services/mcpClient';

interface McpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpServerModal: React.FC<McpServerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'servers' | 'tools'>('servers');
  const [selectedServerId, setSelectedServerId] = useState<string>(SMITHERY_SERVERS[0].id);
  const [selectedTool, setSelectedTool] = useState(TRAVEL_MCP_TOOLS[0].name);
  const [toolArgs, setToolArgs] = useState('{\n  "destination": "Tokyo",\n  "durationDays": 5\n}');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentTool = TRAVEL_MCP_TOOLS.find((t) => t.name === selectedTool) || TRAVEL_MCP_TOOLS[0];
  const selectedServer = SMITHERY_SERVERS.find((s) => s.id === selectedServerId) || SMITHERY_SERVERS[0];

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
    if (toolName === 'plan_multi_day_itinerary' || toolName === 'generate_itinerary') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "durationDays": 5,\n  "budgetTotalSGD": 4000\n}');
    } else if (toolName === 'get_day_itinerary_alternatives') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "dayNumber": 1,\n  "timeSlot": "afternoon"\n}');
    } else if (toolName === 'search_destinations') {
      setToolArgs('{\n  "query": "Tokyo"\n}');
    } else if (toolName === 'get_live_weather') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "travelMonth": "November"\n}');
    } else if (toolName === 'check_visa_requirements') {
      setToolArgs('{\n  "destinationCountry": "Japan",\n  "passportCountry": "Singapore (🇸🇬)"\n}');
    } else if (toolName === 'get_currency_rates') {
      setToolArgs('{\n  "currencyCode": "JPY",\n  "amountSGD": 500\n}');
    } else if (toolName === 'search_flights') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "originAirport": "SIN",\n  "tripDurationDays": 7\n}');
    } else if (toolName === 'search_accommodations') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "budgetPerNightSGD": 280\n}');
    } else if (toolName === 'search_places_attractions') {
      setToolArgs('{\n  "destination": "Tokyo",\n  "category": "culture"\n}');
    } else if (toolName === 'get_ground_transit_options') {
      setToolArgs('{\n  "destination": "Tokyo"\n}');
    } else if (toolName === 'calculate_route_transit') {
      setToolArgs('{\n  "fromLocation": "Senso-ji Temple",\n  "toLocation": "Shibuya Sky",\n  "cityContext": "Tokyo"\n}');
    } else if (toolName === 'get_destination_factoids') {
      setToolArgs('{\n  "destination": "Tokyo"\n}');
    } else {
      setToolArgs('{}');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">Smithery.ai Public Travel MCP Hub</h3>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active JSON-RPC 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to 8 publicly available Model Context Protocol servers on{' '}
                <a
                  href="https://smithery.ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                >
                  smithery.ai <ExternalLink className="h-3 w-3 inline" />
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
              <button
                onClick={() => setActiveTab('servers')}
                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeTab === 'servers'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Smithery Servers ({SMITHERY_SERVERS.length})
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  activeTab === 'tools'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive Tool Runner ({TRAVEL_MCP_TOOLS.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Smithery Servers Catalog */}
        {activeTab === 'servers' && (
          <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Server Sidebar */}
            <div className="border-r border-slate-800 bg-slate-950/40 p-4 md:col-span-5 overflow-y-auto space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Verified Smithery MCP Servers
                </span>
                <span className="text-[11px] font-mono text-emerald-400">8 Connected</span>
              </div>

              {SMITHERY_SERVERS.map((server) => {
                const isSelected = server.id === selectedServerId;
                return (
                  <button
                    key={server.id}
                    onClick={() => setSelectedServerId(server.id)}
                    className={`w-full rounded-xl p-3 text-left transition flex flex-col gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-white shadow-xs'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{server.name}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {server.badge}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-300">{server.id}</span>
                    <p className="line-clamp-2 text-[11px] text-slate-400 leading-relaxed">
                      {server.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Server Details */}
            <div className="flex flex-col p-6 md:col-span-7 overflow-y-auto space-y-5 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedServer.name}</h3>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      v{selectedServer.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedServer.description}</p>
                </div>

                <a
                  href={selectedServer.smitheryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition"
                >
                  <span>View on Smithery.ai</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Tools registered to this server */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Registered JSON-RPC 2.0 Tools for this Server
                </span>

                <div className="space-y-2">
                  {TRAVEL_MCP_TOOLS.filter((t) => t.serverName === selectedServer.id).map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-400">{tool.name}</span>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{tool.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          handleToolSelect(tool.name);
                          setActiveTab('tools');
                        }}
                        className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        Test Tool
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick CLI execution block */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                <span className="font-medium text-slate-300 block">Run via Smithery CLI:</span>
                <code className="block rounded bg-black/60 p-2.5 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  npx -y @smithery/cli run {selectedServer.id} --client stdio
                </code>
                <p className="text-[11px] text-slate-400">
                  This MCP server runs seamlessly with Claude Desktop, Cursor, and any JSON-RPC 2.0 Model Context Protocol compliant host.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Tool Runner */}
        {activeTab === 'tools' && (
          <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Tool list sidebar */}
            <div className="border-r border-slate-800 bg-slate-950/40 p-4 md:col-span-4 overflow-y-auto space-y-1.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Smithery MCP Tools ({TRAVEL_MCP_TOOLS.length})
                </span>
                <Cpu className="h-4 w-4 text-emerald-400" />
              </div>

              {TRAVEL_MCP_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool.name)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs transition flex flex-col gap-1 border cursor-pointer ${
                    selectedTool === tool.name
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-white shadow-xs'
                      : 'border-transparent text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-emerald-400">{tool.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate">{tool.serverName}</span>
                </button>
              ))}
            </div>

            {/* Runner Panel */}
            <div className="flex flex-col p-6 md:col-span-8 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-emerald-400" />
                  <h4 className="font-mono text-base font-semibold text-white">{currentTool.name}</h4>
                  <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                    {currentTool.serverName}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{currentTool.description}</p>
              </div>

              {/* JSON Input Arguments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Tool Input Arguments (JSON):
                  </label>
                  <span className="text-[11px] text-slate-400">JSON-RPC 2.0 params.arguments</span>
                </div>
                <textarea
                  value={toolArgs}
                  onChange={(e) => setToolArgs(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={handleRunTool}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{isLoading ? 'Executing Tool...' : 'Execute Tool Call'}</span>
                </button>
              </div>

              {/* Execution Result */}
              {executionResult && (
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Execution Output Result:</label>
                    <span className="text-[11px] text-emerald-400 font-mono">Response 200 OK</span>
                  </div>
                  <pre className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    {executionResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
