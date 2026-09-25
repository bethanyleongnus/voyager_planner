/**
 * VoyageMCP Express Server
 * Supports AI Studio dev preview, full-stack Node container, and MCP endpoints
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleApiRequest } from './src/server/apiHandler';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API route delegation
app.all('/api/*', async (req, res) => {
  const result = await handleApiRequest(req.url, req.method, req.body);
  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v);
  }
  res.status(result.status).send(result.body);
});

// Serve frontend in production or when dist exists
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`VoyageMCP server listening on http://0.0.0.0:${port}`);
});
