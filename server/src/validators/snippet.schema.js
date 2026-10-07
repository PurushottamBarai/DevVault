import { z } from 'zod';

export const createSnippetSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title cannot exceed 120 characters'),
  content: z.string().min(1, 'Content is required').max(20000, 'Content cannot exceed 20,000 characters'),
  language: z.string().trim().min(1, 'Language is required').max(50),
  notes: z.string().max(5000, 'Notes cannot exceed 5,000 characters').optional().default(''),
  tags: z.array(z.string()).max(10).optional(),
  summary: z.string().max(500).optional()
});

export const updateSnippetSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().min(1).max(20000).optional(),
  language: z.string().trim().min(1).max(50).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  summary: z.string().max(500).optional(),
  aiStatus: z.enum(['pending', 'done', 'failed']).optional()
});
