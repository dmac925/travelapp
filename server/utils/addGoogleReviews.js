require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');
const fuzzball = require('fuzzball');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = path.join(__dirname, 'googleReviews.json');

async function mergeGoogleReviews() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const reviews = JSON.parse(data);

        const postalCodes = reviews.map(r => r.postalCode).filter(Boolean);

        console.log("Generated Postal Codes:", postalCodes);

        const existingHotels = await Hotel.find({ 'address.postalCode': { $in: postalCodes } });
        console.log("Hotels fetched from the database:", existingHotels);

        const fieldMapping = {
            title: 'name',
            googleRating: 'rating',
            googleReviewNum: 'reviewsCount',
            googleDescription: 'description'
        };
        
        const bulkUpdates = [];
        for (const review of reviews) {
            for (const existingHotel of existingHotels) {
                const ratio = fuzzball.ratio(review.title, existingHotel.name);
        
                if (ratio >= 45 && review.postalCode === existingHotel.address.postalCode) {
                    const updateOps = {};
        
                    for (const [revKey, existKey] of Object.entries(fieldMapping)) {
                        if (review[revKey] && !existingHotel[existKey]) {
                            updateOps[existKey] = review[revKey];
                        }
                    }
        
                    // Add review texts to the hotel's reviews array
                    if (review.reviews && review.reviews.length > 0) {
                        const combinedText = review.reviews.map(r => r.text).join(' '); // Combine all review texts
                    
                        updateOps.$push = { 
                            reviews: { $each: review.reviews.map(r => ({ 
                                reviewerName: r.name, 
                                reviewerCount: r.reviewerNumberOfReviews,
                                localGuide: r.isLocalGuide,
                                text: r.text, 
                                publishedAtDate: r.publishedAtDate, 
                                stars: r.stars,
                                reviewLiked: r.likesCount,
                                reviewType: "Google"  // <- Here's where we add the reviewType for each review
                            })) } 
                        };
                                    
                        // Add the combined text to the hotel
                        updateOps.combinedReviewText = combinedText;
                    }

                    if (review.totalScore && !existingHotel.googleRating) {
                        updateOps.googleRating = review.totalScore;
                    }

                    if (review.reviewsCount && !existingHotel.googleReviewNum) {
                        updateOps.googleReviewNum = review.reviewsCount;
                    }
        
                    if (Object.keys(updateOps).length > 0) {
                        bulkUpdates.push({
                            updateOne: {
                                filter: { _id: existingHotel._id },
                                update: updateOps
                            }
                        });
                    }
                }
            }
        }

        if (bulkUpdates.length > 0) {
            await Hotel.bulkWrite(bulkUpdates);
        }

        console.log('All hotel data merged successfully');
    } catch (err) {
        console.error('Error in mergeGoogleReviews:', err);
    }
}

mergeGoogleReviews();