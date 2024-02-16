// IMPORTS
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

// OPENAI CONFIGURATION
const openai = new OpenAI({
	organization: '',
	apiKey: ''
});

// OPENAI API CALL
const convertAudioToText = async (req, res) => {
	// Take request paramaters
	if (req.file) {
		// Processing OpenAI request
		const filePath = req.file.path;
		console.log(filePath)
		try {
			const translation = await openai.audio.translations.create({
				file: fs.createReadStream(filePath),
				model: "whisper-1",	
			});

			console.log(translation.text);
			fs.unlinkSync(filePath);
			return res.json({ text: translation.text });
		} catch (error) {
			console.error('Error converting audio to text: ', error);
			return res.status(500).send('Error processing the file.');
		}
	}

	return req.status(400).send('No file uploaded.');
};

// EXPORTS
module.exports = { convertAudioToText };