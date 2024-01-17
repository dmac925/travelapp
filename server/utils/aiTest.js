require('dotenv').config();
const OpenAI = require("openai").default;
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Hotel = require('../models/hotelSchema');
const path = require('path');
const fs = require('fs').promises; 
const logFilePath = './openai_api_log.txt';
const stringSimilarity = require('string-similarity');


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  
const analyzeReview = async (review) => {

      console.log("Sending request to OpenAI API...");
      const startTime = new Date(); 

      const reviewContent = await fs.readFile(path.join(__dirname, 'review.txt'), 'utf8');

      
      const generatePrompt = (reviewContent) => {
        return {
            "role": "user",
            "content": `You are only allowed to use existing sentences and you cannot modify or add any new content. You can also not use two sentences in a row. Use a mixture/selection of sentences from the following text to create a 200 word hotel review. Using this text: ${reviewContent}`
        };
    };
      
      
      
      const messages = [generatePrompt(reviewContent)];
      console.log("Message sent to OpenAI:", messages);
      
    const gptResponse = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: messages,
    });

    const endTime = new Date(); // End time after receiving the response
    console.log(`Received response from OpenAI API in ${(endTime - startTime)}ms`);


    const apiLog = {
        timestamp: new Date().toISOString(),
        apiResponseId: gptResponse.id,
        model: gptResponse.model,
        promptTokens: gptResponse.usage.prompt_tokens,
        completionTokens: gptResponse.usage.completion_tokens,
        totalTokens: gptResponse.usage.total_tokens,
    };
    
    // Asynchronously append to the log file
    await fs.appendFile(logFilePath, JSON.stringify(apiLog) + '\n');

    const analysis = gptResponse.choices[0].message.content;
    console.log("OpenAI Response:", gptResponse);
    console.log("OpenAI Assistant's Analysis:", analysis);

console.log("Starting analysis line-by-line...");


}

analyzeReview().catch(error => {
    console.error('Error occurred:', error);
});
