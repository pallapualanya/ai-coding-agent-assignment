module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');

    // Create a new Note
    app.post('/notes', notes.create);

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Retrieve a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.put('/notes/:noteId', notes.update);

    // Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);

    // Search notes by tag
    app.get('/notes/tag/:tag', notes.searchByTag);

    // Search notes by category
    app.get('/notes/category/:category', notes.searchByCategory);

    // Search notes by subCategory
    app.get('/notes/subcategory/:subCategory', notes.searchBySubCategory);

    // Search notes by content or title
    app.get('/notes/search/:query', notes.searchByText);

    // Advanced search
    app.get('/notes/advanced-search', notes.advancedSearch);
};
