require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');
const fuzzball = require('fuzzball');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = path.join(__dirname, 'additionalData.json');

function trimLastCharacter(postalCode) {
    return postalCode.slice(0, -1);
}

async function mergeData() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const additionalHotels = JSON.parse(data);

        const postalCodes = additionalHotels.map(h => h.addressObj.postalcode).filter(Boolean);
        const postalCodeRegexes = postalCodes.map(pc => new RegExp(`^${trimLastCharacter(pc)}\\w$`));

        console.log("Generated Postal Codes:", postalCodes);
        console.log("Generated Regex Patterns:", postalCodeRegexes);

        const existingHotels = await Hotel.find({ 'address.postalCode': { $in: postalCodeRegexes } });
        console.log("Hotels fetched from the database:", existingHotels);

        const hotelsByPostalCode = {};
        for (const hotel of existingHotels) {
            const trimmedPostalCode = trimLastCharacter(hotel.address.postalCode);
            if (!hotelsByPostalCode[trimmedPostalCode]) {
                hotelsByPostalCode[trimmedPostalCode] = [];
            }
            hotelsByPostalCode[trimmedPostalCode].push(hotel);
        }

        const bulkUpdates = [];
        const fieldMapping = {
            rating: 'tripadvisorRating',
            numberOfRooms: 'totalRooms',
            numberOfReviews: 'tripadvisorReviewNum',
            description: 'tripadvisorDescription',
            email: 'email',
            website: 'website',
            phone: 'phone',
            hotelClassAttribution: 'hotelClassAgency'
        };

        for (const additionalHotel of additionalHotels) {
            if (additionalHotel.addressObj && additionalHotel.addressObj.postalcode) {
                const trimmedPostalCode = trimLastCharacter(additionalHotel.addressObj.postalcode);
                const postalCodeHotels = hotelsByPostalCode[trimmedPostalCode] || [];

                for (const existingHotel of postalCodeHotels) {
                    const ratio = fuzzball.ratio(additionalHotel.name, existingHotel.name);

                    if (ratio >= 45) {
                        const updateOps = {};

                        for (const [addKey, existKey] of Object.entries(fieldMapping)) {
                            if (additionalHotel[addKey] && !existingHotel[existKey]) {
                                updateOps[existKey] = additionalHotel[addKey];
                            }
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
        }

        if (bulkUpdates.length > 0) {
            await Hotel.bulkWrite(bulkUpdates);
        }

        console.log('All hotel data merged successfully');
    } catch (err) {
        console.error('Error in mergeData:', err);
    }
}

mergeData();
