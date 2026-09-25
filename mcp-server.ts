#!/usr/bin/env tsx
/**
 * VoyageMCP - Standalone Model Context Protocol Server Entrypoint
 * Run with: npx tsx mcp-server.ts
 * Communicates via JSON-RPC 2.0 over standard I/O (stdio) or HTTP
 */

import readline from 'readline';
import { travelMcpServer, TRAVEL_MCP_TOOLS } from './src/mcp/travel-mcp-server';

console.error('🚀 VoyageMCP Travel Server starting in stdio JSON-RPC 2.0 mode...');
console.error(`📦 Registered ${TRAVEL_MCP_TOOLS.length} travel planning tools.`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const request = JSON.parse(trimmed);
    const response = await travelMcpServer.handleJsonRpc(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (err: any) {
    const errResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error: ' + (err.message || 'Invalid JSON'),
      },
    };
    process.stdout.write(JSON.stringify(errResponse) + '\n');
  }
});
