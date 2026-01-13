import { Request, Response } from 'express';
import { realtimeService, SSECompatibleResponse } from '../services/realtime.service.js';
import { config } from '../config/index.js';

/**
 * GET /realtime/events - SSE endpoint
 */
export const getEvents = (req: Request, res: Response) => {
  const clientId = req.user?.id || `guest-${String(Date.now())}`;

  // SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx
  });

  // Add client to service
  realtimeService.addClient(clientId, res);

  // Keep connection alive with heartbeats
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
    const sseRes = res as SSECompatibleResponse;
    if (sseRes.flush) {
      sseRes.flush();
    }
  }, config.realtime.sseHeartbeatInterval);

  // Handle connection close
  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeService.removeClient(clientId);
  });
};
