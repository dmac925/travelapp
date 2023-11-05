require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('../models/hotelSchema');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    updateMonthlyReviews(); 
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

async function updateMonthlyReviews() {
  try {
    console.log('Hotel model:', Hotel); // Debug: Check the Hotel model

    // Fetch all hotels
    const hotels = await Hotel.find();
    console.log('Fetched hotels:', hotels.length); // Debug: Log fetched hotels count

    for (let hotel of hotels) {
      try {
        let monthlyReviewMap = new Map();

        // Process each review
        hotel.reviews.forEach(review => {
          // Extract month and year from the review date
          const monthYear = new Date(review.publishedAtDate).toISOString().substring(0, 7);

          // Initialize monthly review data if it doesn't exist
          if (!monthlyReviewMap.has(monthYear)) {
            monthlyReviewMap.set(monthYear, {
              reviewTexts: [],
              averageRating: 0,
              reviewCount: 0,
              totalStars: 0
            });
          }

          // Update monthly review data
          let monthlyData = monthlyReviewMap.get(monthYear);
          monthlyData.reviewTexts.push(review.text);
          monthlyData.totalStars += review.stars;
          monthlyData.reviewCount++;
        });

        // Convert Map to the desired format and calculate average ratings
        let monthlyReviews = [];
        monthlyReviewMap.forEach((value, key) => {
          value.averageRating = value.reviewCount > 0 ? value.totalStars / value.reviewCount : 0;
          monthlyReviews.push({
            monthYear: key,
            reviewTexts: value.reviewTexts,
            averageRating: value.averageRating,
            reviewCount: value.reviewCount,
            sentimentAnalysis: [] // Placeholder for sentiment analysis data
          });
        });

        // Update the hotel's monthlyReviews field
        hotel.monthlyReviews = monthlyReviews;
        await hotel.save();
        console.log(`Updated monthly reviews for hotel: ${hotel.name}`);
      } catch (error) {
        if (error instanceof mongoose.Error.VersionError) {
          console.error('VersionError occurred:', error);
          // Refetch the document
          const freshHotel = await Hotel.findById(hotel._id);
          // Apply your changes
          freshHotel.monthlyReviews = monthlyReviews;
          // Try saving again
          await freshHotel.save();
        } else {
          console.error(`Error updating hotel: ${hotel.name}`, error);
        }
      }
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      console.log('Closing MongoDB connection');
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}
