import mongoose from 'mongoose';
import { Snippet } from '../models/Snippet.js';
import { generateMeta } from '../services/ai.service.js';

export async function getSnippets(req, res, next) {
  try {
    const { q, language, tag, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { owner: req.user.id };

    if (language && language !== 'all') {
      query.language = language.toLowerCase();
    }

    if (tag && tag !== 'all') {
      const cleanTag = tag.replace(/^#+/, '').toLowerCase();
      query.tags = cleanTag;
    }

    if (q && q.trim()) {
      const searchTerm = q.trim();
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: regex }, { summary: regex }, { tags: regex }, { notes: regex }];
    }

    const [items, total, allOwnerSnippets] = await Promise.all([
      Snippet.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Snippet.countDocuments(query),
      Snippet.find({ owner: req.user.id }).select('language tags').lean()
    ]);

    const languageCounts = {};
    const tagCounts = {};

    for (const s of allOwnerSnippets) {
      if (s.language) {
        languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
      }
      if (Array.isArray(s.tags)) {
        for (const t of s.tags) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      }
    }

    return res.status(200).json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      stats: {
        totalAll: allOwnerSnippets.length,
        languages: languageCounts,
        tags: tagCounts
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createSnippet(req, res, next) {
  try {
    const { title, content, language, notes, tags, summary } = req.body;

    const snippet = new Snippet({
      owner: req.user.id,
      title: title.trim(),
      content,
      language: language.trim().toLowerCase(),
      notes: notes || '',
      aiStatus: 'pending',
      tags: Array.isArray(tags) ? Array.from(new Set(tags.map((t) => t.replace(/^#+/, '').trim().toLowerCase()))).filter(Boolean) : [],
      summary: typeof summary === 'string' ? summary.trim() : ''
    });

    if (snippet.tags.length > 0 && snippet.summary) {
      snippet.aiStatus = 'done';
    } else {
      try {
        const meta = await generateMeta({
          title: snippet.title,
          language: snippet.language,
          content: snippet.content
        });
        if (snippet.tags.length === 0) snippet.tags = meta.tags;
        if (!snippet.summary) snippet.summary = meta.summary;
        snippet.aiStatus = 'done';
      } catch (aiErr) {
        snippet.aiStatus = 'failed';
      }
    }

    await snippet.save();
    return res.status(201).json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function getSnippetById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const snippet = await Snippet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!snippet) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function updateSnippet(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const snippet = await Snippet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!snippet) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { title, content, language, notes, tags, summary, aiStatus } = req.body;
    let codeChanged = false;

    if (content !== undefined && content !== snippet.content) {
      snippet.content = content;
      codeChanged = true;
    }
    if (title !== undefined && title.trim() !== snippet.title) {
      snippet.title = title.trim();
      codeChanged = true;
    }
    if (language !== undefined && language.trim().toLowerCase() !== snippet.language) {
      snippet.language = language.trim().toLowerCase();
      codeChanged = true;
    }
    if (notes !== undefined) {
      snippet.notes = notes;
    }

    if (tags !== undefined) {
      snippet.tags = Array.from(new Set(tags.map((t) => t.replace(/^#+/, '').trim().toLowerCase()))).filter(Boolean);
    }
    if (summary !== undefined) {
      snippet.summary = summary.trim();
    }
    if (aiStatus !== undefined) {
      snippet.aiStatus = aiStatus;
    }

    if (codeChanged && tags === undefined && summary === undefined) {
      try {
        const meta = await generateMeta({
          title: snippet.title,
          language: snippet.language,
          content: snippet.content
        });
        snippet.tags = meta.tags;
        snippet.summary = meta.summary;
        snippet.aiStatus = 'done';
      } catch {
        snippet.aiStatus = 'failed';
      }
    }

    await snippet.save();
    return res.status(200).json({ snippet });
  } catch (error) {
    next(error);
  }
}

export async function deleteSnippet(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!snippet) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function regenerateSnippet(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const snippet = await Snippet.findOne({ _id: req.params.id, owner: req.user.id });
    if (!snippet) {
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      const meta = await generateMeta({
        title: snippet.title,
        language: snippet.language,
        content: snippet.content
      });
      snippet.tags = meta.tags;
      snippet.summary = meta.summary;
      snippet.aiStatus = 'done';
      await snippet.save();
      return res.status(200).json({ snippet });
    } catch (aiErr) {
      snippet.aiStatus = 'failed';
      await snippet.save();
      return res.status(502).json({ error: 'AI generation failed', snippet });
    }
  } catch (error) {
    next(error);
  }
}

export async function previewMeta(req, res, next) {
  try {
    const { title, language, content } = req.body;
    const meta = await generateMeta({
      title: title || '',
      language: language || '',
      content: content || ''
    });
    return res.status(200).json({ meta });
  } catch (error) {
    next(error);
  }
}
