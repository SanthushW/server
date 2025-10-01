import { Router } from 'express';
import { ingestGps } from '../controllers/ingest.controller.js';
import { Joi, validateBody } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Ingestion from GPS devices: accept busId and GPS payload. No device auth by design for demo.
const deviceLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false, skip: () => process.env.NODE_ENV === 'test' });

router.post('/gps', deviceLimiter, validateBody(Joi.object({
  busId: Joi.number().integer().required(),
  timestamp: Joi.string().isoDate().optional(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional(),
  battery: Joi.number().min(0).max(100).optional(),
})), ingestGps);

export default router;
