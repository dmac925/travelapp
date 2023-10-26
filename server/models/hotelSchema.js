const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    name: { type: String, required: true },
    brand: { type: String },
    location: {
        lat: { type: String, required: true },
        lng: { type: String, required: true }
    },
    address: {
        full: { type: String, required: true },
        postalCode: { type: String },
        street: { type: String },
        country: { type: String },
        region: { type: String }
    },
    stars: { type: Number, required: true, min: 1, max: 5 },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    bookingRating: { type: Number },
    tripadvisorRating: { type: Number },
    googleRating: { type: Number },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    totalRooms: { type: Number },
    hotelFacilities: { type: String },
    openDate: { type: Date },
refurbishedDate: { type: Date },
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
    hotelImages: [{
        label: { type: String, required: true },
        url: { type: String, required: true },
        imageLabels: [String],
        renamedImages: [{
            processed: { type: Boolean, default: false },
            label: { type: String, required: true },
            url: { type: String, required: true },
            imageLabels: [String]
        }]
    }],
    imageArchive: [String]
});

module.exports = mongoose.model("Hotel", hotelSchema);
