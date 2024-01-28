require('dotenv').config();
const OpenAI = require("openai").default;
const mongoose = require('mongoose');
const Developer = require('../models/developer');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true, useUnifiedTopology: true 
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB:', err);
});

async function searchDeveloperByName(devName) {
    return await Developer.findOne({ name: devName }); 
}

async function getAllDevelopers() {
    return await Developer.find({}); 
}

async function runConversation(developerName) {
    const messages = [{
        "role": "user",
        "content": `Provide a brief summary about the UK property development company : ${developerName} . Only provide information specific to ${developerName}, factual, including as much company information as possible.  No need to mention when your last knowledge update was. This information should be able to go directly onto a property directory listing website. Don't waffle too much. `
    }];
    
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
    });
    return response.choices[0].message.content;  
}

async function updateDeveloperInfo(developerName, aiDescription) {
    await Developer.updateOne({ name: developerName }, {
        $set: {
            aiDescription: aiDescription  // Update the AI description
        }
    });
}

async function main() {
    const developers = await getAllDevelopers();

    for (const developer of developers) {
        try {
            const aiDescription = await runConversation(developer.name);
            await updateDeveloperInfo(developer.name, aiDescription);
            console.log(`Updated developer ${developer.name} with AI description:`, aiDescription);
        } catch (error) {
            console.error(`Error updating developer ${developer.name}:`, error);
        }
    }

    mongoose.disconnect();  // Close the MongoDB connection after all updates
}

main().catch(console.error);
