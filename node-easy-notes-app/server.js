const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

<<<<<<< HEAD
const dbUrl = process.env.MONGODB_URI || dbConfig.url;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
=======
mongoose.connect(dbConfig.url).then(() => {
>>>>>>> e70d5be (Fix database connection for Mongoose)
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit(1);
});

app.get('/', (req, res) => {
    res.json({"message": "Welcome to EasyNotes application."});
});

require('./app/routes/note.routes.js')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is listening on port " + PORT);
});