import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getSnippets,
  createSnippet,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  regenerateSnippet,
  previewMeta
} from '../controllers/snippet.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSnippetSchema, updateSnippetSchema } from '../validators/snippet.schema.js';

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Too many AI requests. Try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

router.use(authMiddleware);

router.get('/', getSnippets);
router.post('/', aiLimiter, validate(createSnippetSchema), createSnippet);
router.get('/:id', getSnippetById);
router.put('/:id', validate(updateSnippetSchema), updateSnippet);
router.delete('/:id', deleteSnippet);
router.post('/preview-ai', aiLimiter, previewMeta);
router.post('/:id/regenerate', aiLimiter, regenerateSnippet);

export default router;
