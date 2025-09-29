import { Router } from 'express';
import { addSseClient } from '../utils/sse.js';

const router = Router();

/**
 * @openapi
 * /realtime/sse:
 *   get:
 *     summary: Subscribe to real-time bus updates via SSE
 *     responses:
 *       200:
 *         description: Event stream
 */
router.get('/sse', (req, res) => {
  addSseClient(res);
});

// Subscribe to SSE updates for a single bus id (server-side filtered)
router.get('/sse/:id', (req, res) => {
  const id = req.params.id;
  addSseClient(res, { id });
});

export default router;



