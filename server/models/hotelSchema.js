const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sentimentAnalysisSchema = new Schema({
    categories: [{
        category: { type: String },
        keywords: [{ 
            keyword: { type: String },
            sentiment: { type: String },
            mentions: { type: Number }
        }]
    }],
    improvements: { type: String }, // Field to store general improvements
    apiResponseId: { type: String } // Field to store OpenAI API response ID
});


const reviewSchema = new Schema({
    reviewerName: { type: String, default: null },
    reviewerCount: { type: Number, default: 0 },
    localGuide: { type: Boolean, default: false },
    text: { type: String, default: null },
    publishedAtDate: { type: Date },
    stars: { type: Number },
    reviewLiked: { type: Number, default: 0 },
    responseFromOwnerDate: { type: Date },
    responseFromOwnerText: { type: String, default: null },
    reviewType: { type: String }
});

const hotelSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    address: {
        full: { type: String, required: true },
        postalCode: { type: String },
        street1: { type: String },
        street2: { type: String },
        city: { type: String },
        state: { type: String },
        region: { type: String },
        country: { type: String },
        neighbourhood: { type: String },
    },
    hotelClass: { type: Number },
    hotelClassAgency: { type: String },
    description: { type: String },
    price: { type: Number },
    currency: { type: String },
    bookingRating: { type: Number },
    bookingReviewNum: { type: Number },
    bookingDescription: { type: String },
    tripadvisorRating: { type: Number },
    tripadvisorReviewNum: { type: Number },
    tripadvisorDescription: { type: String },
    googleRating: { type: Number },
    googleReviewNum: { type: Number },
    googleDescription: { type: String },
    reviews: [reviewSchema], 
    combinedReviewText: { type: String, default: null },
    checkIn: { type: String },
    checkOut: { type: String },
    totalRooms: { type: Number },
    hotelFacilities: { type: String },
    openingDate: { type: Date },
    refurbDate: { type: Date },
    website: { type: String },
    email: { type: String },
    phone: { type: String },
    similarGoogleHotels: { type: String },
    refurbishedDate: { type: Date },
    parentCompany: { type: String },
    monthlyReviews: [{
        monthYear: String,
        reviewTexts: [String],
        averageRating: Number,
        reviewCount: Number,
        sentimentAnalysis: [sentimentAnalysisSchema],
    }],
    hotelRooms: [{
        roomType: { type: String, default: 'Standard' },
        roomSize: { type: String },
        bedType: { type: String },
        roomPrice: { type: Number },
        roomPriceCurr: { type: String },
        images: [{
            url: { type: String, required: true },
            label: { type: String },  
        }]
    }],
});

module.exports = mongoose.model("Hotel", hotelSchema);

