import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, maxlength: 20000 },
    language: { type: String, required: true, lowercase: true, trim: true },
    notes: { type: String, default: '', maxlength: 5000 },
    tags: { type: [String], default: [] },
    summary: { type: String, default: '', maxlength: 500 },
    aiStatus: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

snippetSchema.index({ owner: 1, createdAt: -1 });
snippetSchema.index({ owner: 1, tags: 1 });
snippetSchema.index(
  { title: 'text', summary: 'text', tags: 'text' },
  { default_language: 'none', language_override: 'none' }
);

export const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', snippetSchema);
