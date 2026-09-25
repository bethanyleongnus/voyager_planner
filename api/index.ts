/**
 * Vercel Serverless Function Entrypoint
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from '../src/server/apiHandler';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  let body = req.body;

  if (!body && (req.method === 'POST' || req.method === 'PUT')) {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(buffers).toString('utf-8');
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw;
    }
  }

  const result = await handleApiRequest(req.url || '/', req.method || 'GET', body);

  for (const [k, v] of Object.entries(result.headers)) {
    res.setHeader(k, v);
  }

  res.statusCode = result.status;
  res.end(JSON.stringify(result.body));
}
