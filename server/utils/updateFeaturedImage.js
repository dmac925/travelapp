require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100; // Adjust the batch size as needed

async function updateFeaturedImage() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({})
                                          .skip(offset)
                                          .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break;
        }

        const bulkOperations = properties.map(property => {
            // Check if imageList exists and has at least one image
            if (property.imageList && property.imageList !== '') {
                const images = property.imageList.split('|');
                if (images.length > 0) {
                    // Always update featuredImage to the first image from imageList
                    return {
                        updateOne: {
                            filter: { _id: property._id },
                            update: { $set: { featuredImage: images[0].trim() } }
                        }
                    };
                }
            }
            return null; // If there's no imageList or it's empty, return null
        }).filter(operation => operation !== null); // Filter out any undefined or null operations

        if (bulkOperations.length > 0) {
            await Property.bulkWrite(bulkOperations);
            updatedCount += bulkOperations.length;
        }

        offset += properties.length;
    }

    console.log(`Updated featured images for ${updatedCount} properties.`);
    mongoose.disconnect();
}

updateFeaturedImage();
