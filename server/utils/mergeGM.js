require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const Hotel = require('../models/hotelSchema');
const mongoose = require('mongoose');
const fuzzball = require('fuzzball');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = path.join(__dirname, 'gmData.json');

function trimLastCharacter(postalCode) {
    return postalCode.slice(0, -1);
}

async function mergeData() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const gmData = JSON.parse(data);

        const bulkUpdates = [];
        
        const fieldMapping = {
            rating: 'googleRating',
            reviewsCount: 'googleReviewNum',
            neighborhood: 'address.neighbourhood',
            hotelDescription: 'googleDescription'
        };

        for (const gmHotel of gmData) {
            const postalCode = gmHotel.address.postalCode;
            const trimmedPostalCode = trimLastCharacter(postalCode);
            
            const existingHotels = await Hotel.find({ 'address.postalCode': trimmedPostalCode });
            
            for (const existingHotel of existingHotels) {
                const ratio = fuzzball.ratio(gmHotel.name, existingHotel.name);

                if (ratio >= 45) {
                    const updateOps = {};

                    for (const [addKey, existKey] of Object.entries(fieldMapping)) {
                        if (gmHotel[addKey] && !existingHotel[existKey]) {
                            updateOps[existKey] = gmHotel[addKey];
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

        if (bulkUpdates.length > 0) {
            await Hotel.bulkWrite(bulkUpdates);
        }

        console.log('All hotel data merged successfully');

    } catch (error) {
        console.error('Error processing the data:', error);
    }
}

mergeData();
