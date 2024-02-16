// IMPORTS
const express = require('express');
const multer = require('multer');
require('dotenv').config();
const { convertAudioToText } = require('./controllers/openAIController.js');

// CONSTANTS
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + '.mp3');
	}
});
const upload = multer({ storage: storage });

// SETUP EXPRESS
const app = express();
const port = 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

// JSON MIDDLEWARE
app.use(express.json());

// ROUTES
app.post('/api/audio-to-text', upload.single('audioFile'), convertAudioToText);