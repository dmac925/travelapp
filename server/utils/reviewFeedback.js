require('dotenv').config();
const OpenAI = require("openai").default;
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Hotel = require('../models/hotelSchema');
const path = require('path');
const fs = require('fs'); 
const logFilePath = './openai_api_log.txt';
const stringSimilarity = require('string-similarity');


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  }).then(() => {
      console.log('Connected to MongoDB');
  }).catch(err => {
      console.error('Could not connect to MongoDB:', err);
  });
  
  const Category = mongoose.model('Category', new Schema({ name: String }));
  
async function seedCategoriesAndKeywords() {
    const categories = [
        { name: 'Staff' },
        { name: 'Room' },
        { name: 'Bathroom' },
        { name: 'Location' },
        { name: 'Restaurant/Bar' },
        { name: 'Design/Style' },
        { name: 'Amenities' },
        { name: 'Value for Money' },
    ];
}

const getMonthlyReviews = async (identifier, monthYear) => {
    const results = await Hotel.find(
        { _id: identifier, "monthlyReviews.monthYear": monthYear }, 
        { "monthlyReviews.$": 1 }
    );
    console.log("Retrieved Reviews for hotel " + identifier + ":", results);
    return results;
};


// Function to analyze a single review
const analyzeReview = async (review) => {
    if (!review) return null; // Check if review is not null
    const words = review.split(/\s+/); // Split review into words

    if (words.length < 5) {
        // Skip reviews with less than 5 words
        console.log(`Review skipped (too short): "${review}"`);
        return null;
    }

    const reviewCategories = [
        "Overall Experience",
        "Staff Service",
        "Room Quality",
        "Restaurant & Food",
        "Value for Money",
        "Sustainability",
        "Location",
        "Amenities",
        "Decor & Atmosphere",
      ];

      console.log("Sending request to OpenAI API...");
      const startTime = new Date(); 
      
      const generatePrompt = (review) => {
        return {
            "role": "user",
            "content": `Analyze the following hotel review and summarize the sentiment for each keyword in a structured format. Provide a list of keywords mentioned in the review, categorize them under the relevant category, indicate the sentiment for each keyword (positive or negative), and note the number of mentions. Please combine similar keywords into one. Prioritize identifying any keywords with negative sentiment, as this is crucial for making improvements:\n\nCategories:\n- ${reviewCategories.join(
              "\n- "
            )}\n\nReview:\n"${review}"\n\nYou must stick to this exact response format:\n[Category]:\n- Keyword: [Keyword (max 3 words)], Sentiment: (Positive/Negative/Neutral), Mentions: [Number]\n(Repeat for each [keyword] in the category)`
        };
    };
      
      
      
      const messages = [generatePrompt(review)];
      console.log("Message sent to OpenAI:", messages);
      
    const gptResponse = await openai.chat.completions.create({
        model: "gpt-4-0613",
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
    fs.appendFileSync(logFilePath, JSON.stringify(apiLog) + '\n');

    const analysis = gptResponse.choices[0].message.content;
    console.log("OpenAI Response:", gptResponse);
    console.log("OpenAI Assistant's Analysis:", analysis);



    const sentimentAnalysis = {
        categories: [], 
        apiResponseId: gptResponse.id
    };

const analysisLines = analysis.split('\n'); 
let currentCategory = null;

console.log("Starting analysis line-by-line...");

analysisLines.forEach((line, index) => {
    console.log(`Processing line ${index}:`, line);

    // Extract the potential category from the line
    const potentialCategory = line.split(':')[0].trim();

    // Find the best match from the reviewCategories array
    const matches = stringSimilarity.findBestMatch(potentialCategory, reviewCategories);
    if (matches.bestMatch.rating > 0.5) { // you can adjust the threshold
        currentCategory = matches.bestMatch.target;
        console.log(`Detected category: ${currentCategory}`);
    } else if (line.trim().startsWith('- Keyword:'))   {  

        const keywordPattern = /- Keyword: ([\w\s]+), Sentiment: (Positive|Negative|Neutral), Mentions: (\d+)/;
        const keywordMatch = keywordPattern.exec(line);
        
        if (keywordMatch) {
            const keywordDetails = {
                keyword: keywordMatch[1].trim(),
                sentiment: keywordMatch[2].trim(),
                mentions: parseInt(keywordMatch[3], 10),
            };

            console.log(`Detected keyword details:`, keywordDetails);

            const categoryIndex = sentimentAnalysis.categories.findIndex(c => c.category === currentCategory);
            if (categoryIndex === -1) {
                console.log(`Adding new category at line ${index}:`, {
                    category: currentCategory,
                    keywords: [keywordDetails],
                });
                sentimentAnalysis.categories.push({
                    category: currentCategory,
                    keywords: [keywordDetails],
                });
            } else {
                console.log(`Adding keyword to existing category at line ${index}:`, keywordDetails);
                sentimentAnalysis.categories[categoryIndex].keywords.push(keywordDetails);
            }
            
        }
    } else {
        console.log('No category or keyword detected');
        currentCategory = null; // Reset currentCategory if no category is detected
    }
});

console.log('Final sentimentAnalysis object:', sentimentAnalysis);
return sentimentAnalysis;
}

const processReviews = async (identifier) => {
    try {
        const hotel = await Hotel.findById(identifier);
        if (!hotel) {
            console.log(`Hotel with ID ${identifier} not found.`);
            return;
        }

        for (const monthlyReview of hotel.monthlyReviews) {
            const monthYear = monthlyReview.monthYear;
            // Remove nulls and concatenate all reviews for the specific month
            const reviews = monthlyReview.reviewTexts.filter(text => text).join(". ");
            console.log(`Concatenated reviews for the month ${monthYear}:`, reviews);

            // Analyze the concatenated reviews
            const analysis = await analyzeReview(reviews);
            if (analysis) {
                console.log(analysis);
                // Update the monthlyReview with the sentiment analysis
                await Hotel.updateOne(
                    { _id: identifier, "monthlyReviews.monthYear": monthYear },
                    { $set: { "monthlyReviews.$.sentimentAnalysis": analysis } }
                );
            }
        }

    } catch (error) {
        console.error('Error processing reviews:', error);
    }
};

// Example usage for a single hotel for a specific month
processReviews('654277c1abc0c6a7612d8b1a');