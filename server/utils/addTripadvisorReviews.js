require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');
const fuzzball = require('fuzzball'); 

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = path.join(__dirname, 'tripadvisorReviews.json');

async function mergeTripadvisorReviews() {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const reviews = JSON.parse(data);
  
      const existingHotels = await Hotel.find({
        'address.postalCode': { $in: reviews.map((r) => r.placeInfo.addressObj.postalcode) },
      });
      console.log('Hotels fetched from the database:', existingHotels);
  
      const fieldMapping = {
        name: 'placeInfo.name',
        rating: 'placeInfo.rating',
        reviewsCount: 'placeInfo.numberOfReviews',
      };
  
      const existingHotelsMap = existingHotels.reduce((acc, hotel) => {
        acc[hotel.address.postalCode] = hotel;
        return acc;
      }, {});
  
      const bulkUpdates = [];
      for (const review of reviews) {
        for (const existingHotel of existingHotels) {
          const ratio = fuzzball.ratio(review.placeInfo.name, existingHotel.name);
  
          if (ratio >= 45 && review.placeInfo.addressObj.postalcode === existingHotel.address.postalCode) {
            const updateOps = {};
  
            for (const [revKey, existKey] of Object.entries(fieldMapping)) {
              if (review[revKey] && !existingHotel[existKey]) {
                updateOps[existKey] = review[revKey];
              }
            }
  
            // Check if 'user' object exists before accessing 'name' property
            if (review.user && review.user.name) {
              // Add review texts to the hotel's reviews array
              if (review.text) {
                updateOps.$push = {
                  reviews: {
                    $each: [
                      {
                        reviewerName: review.user.name,
                        reviewerCount: review.user.contributions.totalContributions,
                        localGuide: false, // TripAdvisor does not have local guides like Google
                        text: review.text,
                        publishedAtDate: review.publishedDate,
                        stars: review.rating,
                        reviewLiked: review.helpfulVotes,
                        reviewType: 'TripAdvisor',
                      },
                    ],
                  },
                };
              }
  
              if (Object.keys(updateOps).length > 0) {
                bulkUpdates.push({
                  updateOne: {
                    filter: { _id: existingHotel._id },
                    update: updateOps,
                  },
                });
              }
            }
          }
        }
      }
  
      if (bulkUpdates.length > 0) {
        await Hotel.bulkWrite(bulkUpdates);
      }
  
      console.log('All hotel data merged successfully');
    } catch (err) {
      console.error('Error in mergeTripadvisorReviews:', err);
    }
  }
  
  mergeTripadvisorReviews();