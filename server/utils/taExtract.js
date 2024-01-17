require('dotenv').config();
const fs = require('fs').promises; // Corrected to use fs.promises
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = path.join(__dirname, 'hoteldata.json');

async function processHotels() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const hotelsData = JSON.parse(data);

    for (const hotelData of hotelsData) {
        const hotel = new Hotel({
            tripadvisorID: hotelData.id,
            tripadvisorCategory: hotelData.category,
            tripadvisorSubcategory: hotelData.subcategories,
            name: hotelData.name,
            location: {
                lat: hotelData.latitude,
                lng: hotelData.longitude
            },
            address: {
                full: hotelData.address,
                postalCode: hotelData.addressObj?.postalcode,
                street1: hotelData.addressObj?.street1,
                street2: hotelData.addressObj?.street2,
                city: hotelData.addressObj?.city,
                state: hotelData.addressObj?.state,
                country: hotelData.addressObj?.country,
                neighbourhood: hotelData.neighborhoodLocations?.map(loc => loc.name).join(', ')
            },
            hotelClass: parseFloat(hotelData.hotelClass),
            description: hotelData.description,
            phone: hotelData.phone,
            website: hotelData.website,
            email: hotelData.email,
            tripadvisorRating: hotelData.rating,
            tripadvisorReviewNum: hotelData.numberOfReviews,
            amenities: hotelData.amenities?.join(', '),
            totalRooms: hotelData.numberOfRooms,
            price: parseFloat(hotelData.priceRange?.split('-')[0].replace(/[^0-9.-]+/g,"")), 
            currency: hotelData.priceLevel,
        });
    

        try {
            await hotel.save();
            console.log(`Hotel ${hotel.name} saved successfully.`);
        } catch (saveError) {
            console.error('Error saving hotel:', saveError);
        }
    }

    console.log('All hotels processed.');
} catch (err) {
    console.error('Error in processHotels:', err);
} finally {
    mongoose.disconnect();
}
}

processHotels();