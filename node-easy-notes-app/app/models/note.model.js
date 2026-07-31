const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    title: String,
    content: String,
    tags: [{ type: String }],
    category: String,
    subCategory: String,
    createdAt: Date,
    updatedAt: Date,
    // Additional metadata for better organization
    color: String,
    pinned: Boolean,
    archive: Boolean
}, {
    timestamps: true
});

// Indexing for faster search queries
NoteSchema.index({ title: 'text', content: 'text' });
NoteSchema.index({ category: 1 });
NoteSchema.index({ subCategory: 1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ color: 1 });
NoteSchema.index({ pinned: 1 });
NoteSchema.index({ archive: 1 });

module.exports = mongoose.model('Note', NoteSchema);
