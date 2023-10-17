const { TEMPLATES } = require('../data/templates');
const OpenAIApi = require("openai");
const express = require('express');
const types = require('../data/types');
const router = express.Router();

const openai = new OpenAIApi({
    key: process.env.OPENAI_API_KEY
});

router.get('/types', (req, res) => {
    res.json(types);
});

router.post('/identify', async (req, res) => {
    const { content } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `Given the text, identify the most relevant type among the following options: ${types.join(", ")}.` },
                { role: "user", content: content }
            ],
            max_tokens: 50  // restrict the response length
        });
        
        console.log("OpenAI response:", completion); // Log the entire response
        
        const reply = completion.choices[0]?.message?.content?.trim();
        
        // Send the identified type back to the frontend.
        if (types.includes(reply)) {
            res.json({ type: reply });
        } else {
            console.log("Type not identified:", reply);  // Log this for clarity
            res.status(500).send("Unable to identify type");
        }
    } catch (error) {
        console.error("Error:", error);  // Log the specific error for clarity
        res.status(500).send("Error processing content");
    }
});

router.post('/extract', async (req, res) => {
    const { content, type } = req.body;

    if (!TEMPLATES[type]) {
        res.status(400).send("Invalid content type for extraction.");
        return;
    }

    const expectedFields = Object.keys(TEMPLATES[type]);

    try {
        const extractionCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: `For a ${type} content, extract the following fields: ${expectedFields.join(', ')}` },
                { role: "user", content: content }
            ]
        });

        const messageContent = extractionCompletion.choices[0]?.message?.content?.trim();

        // Let's parse the message content into a structured object
        let parsedData = { ...TEMPLATES[type] };
        for (let field of expectedFields) {
            const regex = new RegExp(`${field}: ([^\\n]+)`);
            const match = messageContent.match(regex);
            if (match) {
                parsedData[field] = match[1].trim();
            }
        }

        res.json({ data: parsedData });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error processing content for extraction.");
    }
});

module.exports = router;
