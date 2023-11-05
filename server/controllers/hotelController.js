const Hotel = require('../models/hotelSchema');
const { processImages } = require('../utils/vision');
const OpenAI = require("openai").default;
const calculateAverageRatings = require('../utils/ratingCalculator');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class HotelController {
  async findAll(req, res) {
    try {
      const hotels = await Hotel.find();
      res.send(hotels);
    } catch (e) {
      res.send({ error: e });
    }
  }

  async findBrands(req, res) {
    try {
      const hotels = await Hotel.find().select('brand -_id');
      const uniqueBrands = [...new Set(hotels.map((hotel) => hotel.brand))];
      res.send(uniqueBrands);
    } catch (e) {
      res.send({ error: e });
    }
  }

  async findOne(req, res) {
    let { hotel_id } = req.params;
    try {
      const hotel = await Hotel.findOne({ _id: hotel_id });
      res.send(hotel);
    } catch (e) {
      res.send({ error: e });
    }
  }

  async insert(req, res) {
    const hotel = req.body;
    console.log(hotel);

    const renamedImages = await processImages(hotel);
    hotel.renamedImages = renamedImages;

    try {
      const done = await Hotel.create(hotel);
      res.send(done);
    } catch (e) {
      res.send({ error: e });
    }
  }

  async delete(req, res) {
    let { hotelId } = req.body;

    try {
      const removed = await Hotel.deleteOne({ _id: hotelId });

      res.send({ removed });
    } catch (error) {
      res.send({ error });
    }
  }

  async update(req, res) {
    let { hotelId, ...data } = req.body;

    try {
      const updated = await Hotel.updateOne({ _id: hotelId }, { $set: data });
      res.send({ updated });
    } catch (error) {
      res.send({ error });
    }
  }

  async getReviewResponse(req, res) {
    console.log('Received request to generate review response');
    const { reviewText } = req.body;
    console.log('Review Text:', reviewText);

    try {
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `In less than 100 words. Please provide a concise, polite and professional response to the following customer review: "${reviewText}". Skip any formal salutations or closing remarks like 'Dear [Name]' or 'Best regards, [Your Name]' in the response` }
            ],
            temperature: 0.7,
        });

        console.log('Response received from OpenAI:', gptResponse);
        const generatedResponse = gptResponse.choices[0].message.content; // Extracting the content of the message
        console.log('Generated Response:', generatedResponse);

        res.json({ response: generatedResponse }); // Send the generated response
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ message: 'Error generating response' });
    }
}

  async getSentimentAnalysis(req, res) {
    let { hotel_id } = req.params;

    try {
      const hotel = await Hotel.findOne({ _id: hotel_id });

      const sentimentAnalysis = hotel.monthlyReviews.map((monthReview) => {
        if (
          monthReview.sentimentAnalysis &&
          monthReview.sentimentAnalysis.length > 0
        ) {
          const sentimentData = monthReview.sentimentAnalysis[0];
          return {
            monthYear: monthReview.monthYear,
            averageRating: monthReview.averageRating,
            reviewCount: monthReview.reviewCount,
            sentimentAnalysis: {
              categories: sentimentData.categories.map((category) => ({
                category: category.category,
                keywords: category.keywords.map((keyword) => ({
                  keyword: keyword.keyword,
                  sentiment: keyword.sentiment,
                  mentions: keyword.mentions,
                })),
              })),
              improvements: sentimentData.improvements,
              apiResponseId: sentimentData.apiResponseId,
            },
          };
        }
        return null;
      }).filter((e) => e != null);

      res.json(sentimentAnalysis);
    } catch (e) {
      console.error('Error in getSentimentAnalysis:', e);
      res
        .status(500)
        .json({ error: 'An error occurred while fetching sentiment analysis.' });
    }
  }

  async getAverageRatings(req, res) {
    const { hotel_id } = req.params;

    try {
      const hotel = await Hotel.findOne({ _id: hotel_id });
      const reviews = hotel.reviews;

      if (!reviews) {
        return res
          .status(404)
          .json({ error: 'Reviews not found for this hotel.' });
      }

      console.log('Fetched reviews:', reviews);
      const monthlyRatings = calculateAverageRatings(reviews);
      console.log('Calculated monthly ratings:', monthlyRatings);

      res.json(monthlyRatings);
    } catch (e) {
      console.error('Error in getAverageRatings:', e);
      res
        .status(500)
        .json({ error: 'An error occurred while fetching average ratings.' });
    }
  }
}

module.exports = new HotelController();
