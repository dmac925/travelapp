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
          if (!review.publishedAtDate) {
            console.error('Review missing published date:', review._id);
            return; // Skip this review if the date is missing
          }
        
          const publishedDate = new Date(review.publishedAtDate);
          if (isNaN(publishedDate.getTime())) {
            console.error('Invalid date for review:', review._id);
            return; // Skip this review if the date is invalid
          }
        
          const monthYear = publishedDate.toISOString().substring(0, 7);
        
          // Initialize monthly review data if it doesn't exist
          if (!monthlyReviewMap.has(monthYear)) {
            monthlyReviewMap.set(monthYear, {
              reviewTexts: [],
              reviewIds: [], // Add a new array to keep track of review IDs
              averageRating: 0,
              reviewCount: 0,
              totalStars: 0
            });
          }
        
          // Update monthly review data
          let monthlyData = monthlyReviewMap.get(monthYear);
          monthlyData.reviewTexts.push(review.text);
          monthlyData.reviewIds.push(review._id); // Add the review ID to the array
          monthlyData.totalStars += review.stars;
          monthlyData.reviewCount++;
        });
        

        // Convert Map to the desired format and calculate average ratings
        let monthlyReviews = [];
        monthlyReviewMap.forEach((value, key) => {
          console.log('Monthly review map:', monthlyReviewMap);
          value.averageRating = value.reviewCount > 0 ? value.totalStars / value.reviewCount : 0;
          console.log('Monthly reviews before save:', monthlyReviews);

          monthlyReviews.push({
            monthYear: key,
            reviewTexts: value.reviewTexts,
            reviewIds: value.reviewIds, // Include the review IDs
            averageRating: value.averageRating,
            reviewCount: value.reviewCount,
            sentimentAnalysis: [] // Placeholder for sentiment analysis data
          });
        });

        // Update the hotel's monthlyReviews field
        hotel.monthlyReviews = monthlyReviews;
        await hotel.save();
        console.log('Hotel saved with monthly reviews:', hotel.monthlyReviews);

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