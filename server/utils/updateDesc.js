require('dotenv').config();
const OpenAI = require("openai").default;
const mongoose = require('mongoose');
const Hotel = require('../models/property'); 
const fs = require('fs').promises;
const logFilePath = './openai_api_log.txt';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

  const transformDescription = async (description) => {
    // Check if description is defined and is a string
    if (typeof description !== 'string') {
      console.error('Description is undefined or not a string:', description);
      return ""; // Return an empty string or handle the case appropriately
    }
  
    const cleanedDescription = description.replace(/<\/?[^>]+(>|$)/g, "");
  
    const messages = [{
      "role": "user",
      "content": `Transform the following property features into a coherent and engaging paragraph, do not sound too much like a sales agent, sound more like a factsheet providing all the facts about the property, it should not sound like it is coming from the property company or agent: ${cleanedDescription}`
    }];
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: messages,
      });
      // Log for debugging
      console.log("API Response:", JSON.stringify(response, null, 2));
  
      if (response && response.choices && response.choices.length > 0 && response.choices[0].message) {
        const messageContent = response.choices[0].message.content; // Adjusted based on expected structure
        return messageContent;
      } else {
        console.error("Unexpected response structure or empty response:", JSON.stringify(response, null, 2));
        return ""; // Handle unexpected structure or empty response appropriately
      }
    } catch (error) {
      console.error("Error in OpenAI chat completion:", error);
      throw error; // Rethrow the error to be caught by the caller
    }
  };
  
  
  
  const updateHotelDescriptions = async () => {
    // Find properties without a newDescription or where newDescription is null
    const properties = await Hotel.find({ 
      $or: [
        { newDescription: { $exists: false } },
        { newDescription: null }
      ] 
    });
  
    for (let property of properties) {
      const newDescription = await transformDescription(property.mainDescription);
      property.newDescription = newDescription; 
      await property.save();
      console.log(`Updated property ${property.propId} with new description.`);
      
      // Optionally, append this action to a log file
      const logEntry = {
        timestamp: new Date().toISOString(),
        propertyId: property._id,
        action: "Description updated"
      };
      await fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n');
    }
  };
  
  updateHotelDescriptions().catch(error => {
    console.error('Error occurred:', error);
  });