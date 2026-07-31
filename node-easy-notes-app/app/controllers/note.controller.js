const Note = require('../models/note.model.js');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        tags: req.body.tags || [],
        category: req.body.category || "Uncategorized",
        subCategory: req.body.subCategory || "None",
        color: req.body.color || "default",
        pinned: req.body.pinned || false,
        archive: req.body.archive || false
    });

    // Save Note in the database
    note.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        if (err.code === 11000) {
            return res.status(400).send({
                message: "Note with this title already exists."
            });
        }
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'asc';
    const pinned = req.query.pinned;
    const archive = req.query.archive;

    let query = {};

    if(pinned !== undefined) {
        query.pinned = pinned;
    }
    if(archive !== undefined) {
        query.archive = archive;
    }

    Note.find(query)
    .sort({ [sort]: order })
    .skip((page - 1) * limit)
    .limit(limit)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Find note and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        tags: req.body.tags || [],
        category: req.body.category || "Uncategorized",
        subCategory: req.body.subCategory || "None",
        color: req.body.color || "default",
        pinned: req.body.pinned || false,
        archive: req.body.archive || false
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};

// Search notes by tag
exports.searchByTag = (req, res) => {
    Note.find({ tags: req.params.tag })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found with tag " + req.params.tag
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with tag " + req.params.tag
        });
    });
};

// Search notes by multiple tags
exports.searchByMultipleTags = (req, res) => {
    const tags = req.params.tags.split(',');
    Note.find({ tags: { $in: tags } })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found with tags " + req.params.tags
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with tags " + req.params.tags
        });
    });
};

// Search notes by category
exports.searchByCategory = (req, res) => {
    Note.find({ category: req.params.category })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found with category " + req.params.category
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with category " + req.params.category
        });
    });
};

// Search notes by subCategory
exports.searchBySubCategory = (req, res) => {
    Note.find({ subCategory: req.params.subCategory })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found with subCategory " + req.params.subCategory
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with subCategory " + req.params.subCategory
        });
    });
};

// Search notes by content or title
exports.searchByText = (req, res) => {
    const searchQuery = req.params.query;
    Note.find({ $or: [{ title: { $regex: searchQuery, $options: 'i' }}, { content: { $regex: searchQuery, $options: 'i' }}] })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found matching query " + searchQuery
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with query " + searchQuery
        });
    });
};

// Advanced search with additional filtering options
exports.advancedSearch = (req, res) => {
    const title = req.query.title;
    const content = req.query.content;
    const category = req.query.category;
    const subCategory = req.query.subCategory;
    const tags = req.query.tags;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'asc';
    const pinned = req.query.pinned;
    const archive = req.query.archive;

    let query = {};

    if(title) {
        query.title = { $regex: title, $options: 'i' };
    }
    if(content) {
        query.content = { $regex: content, $options: 'i' };
    }
    if(category) {
        query.category = category;
    }
    if(subCategory) {
        query.subCategory = subCategory;
    }
    if(tags) {
        const tagsArray = tags.split(',');
        query.tags = { $in: tagsArray };
    }
    if(pinned !== undefined) {
        query.pinned = pinned;
    }
    if(archive !== undefined) {
        query.archive = archive;
    }

    Note.find(query)
    .sort({ [sort]: order })
    .skip((page - 1) * limit)
    .limit(limit)
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found matching query"
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes"
        });
    });
};

// New endpoint: Search notes by multiple categories
exports.searchByMultipleCategories = (req, res) => {
    const categories = req.params.categories.split(',');
    Note.find({ category: { $in: categories } })
    .then(notes => {
        if(!notes || notes.length === 0) {
            return res.status(404).send({
                message: "No notes found with categories " + req.params.categories
            });
        }
        res.send(notes);
    }).catch(err => {
        return res.status(500).send({
            message: "Error searching notes with categories " + req.params.categories
        });
    });
};
