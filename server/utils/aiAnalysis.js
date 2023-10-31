const OpenAI = require("openai").default;
const mongoose = require('mongoose');
const Hotel = require('../models/hotelSchema');
require ("dotenv").config();
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect('mongodb+srv://andrewg:barcelonacode@hoteltesting.fxjzcen.mongodb.net/', {
  useNewUrlParser: true, useUnifiedTopology: true 
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB:', err);
});

async function searchHotelByName(hotelName) {
    return await Hotel.findOne({ name: hotelName });
}

async function runConversation(hotelName) {
    const messages = [{
        "role": "user",
        "content": `Provide the brand, opening date, and refurbished date of the hotel named ${hotelName} in the format: "Opened: [date - convert to ISO 8601 Format], Brand: [brand name], Refurbished: [date - convert to ISO 8601 Format or 'No date']".`
    }];
    
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
    });
    const responseMessage = response.choices[0].message.content;
    console.log("OpenAI Response:", response);
    console.log("OpenAI Assistant's Message:", response.choices[0].message.content);

    // Parse the response to extract the needed information
    const brandMatch = responseMessage.match(/Brand: ([\w\s]+),/);
    const openingDateMatch = responseMessage.match(/Opened: ([\d\-]+),/);
    const refurbishedDateMatch = responseMessage.match(/Refurbished: ([\w\s\-\/]+)/); // Changed the regular expression to match the new format

    let info = {};
    if (brandMatch) info.brand = brandMatch[1];
    if (openingDateMatch) info.openingDate = openingDateMatch[1];
    if (refurbishedDateMatch) info.refurbishedDate = refurbishedDateMatch[1] === 'No date' ? null : refurbishedDateMatch[1];

    return info;
}

async function updateHotelInfo(hotelName, info) {
    await Hotel.updateOne({ name: hotelName }, {
        $set: {
            brand: info.brand,
            openingDate: new Date(info.openingDate),  // Convert the string to a Date object
            refurbishedDate: info.refurbishedDate ? new Date(info.refurbishedDate) : null  // Convert only if not null
        }
    });
}

async function main() {
    const hotelName = "Corinthia London";  // Replace with the desired hotel name
    const hotel = await searchHotelByName(hotelName);

    if (!hotel) {
        console.log("Hotel not found.");
        return;
    }

    const info = await runConversation(hotelName);
    await updateHotelInfo(hotelName, info);
    console.log(`Updated hotel ${hotelName} with info:`, info);
}

main().then(() => {
    mongoose.disconnect();  // Close the MongoDB connection
}).catch(console.error);
