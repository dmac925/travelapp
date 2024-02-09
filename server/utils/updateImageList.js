require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100; // Adjust the batch size as needed

async function updateImageListURLs() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({
            // Adjust the query if needed to target only specific properties
            imageList: { $exists: true, $ne: '' } // Select properties with a non-empty imageList
        })
        .skip(offset)
        .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break; // Exit if no more properties to update
        }

        const bulkOperations = properties.map(property => {
            if (property.imageList) {
                const images = property.imageList.split('|').map(imageUrl => {
                    // Transform each image URL
                    return imageUrl.replace('https://storage.googleapis.com/newhomesbucket01', 'https://newbuildhomes.org');
                }).join('|'); // Join the transformed URLs back into a string

                return {
                    updateOne: {
                        filter: { _id: property._id },
                        update: { $set: { imageList: images } } // Update the imageList field
                    }
                };
            }
        }).filter(operation => operation != null); // Filter out any undefined operations

        if (bulkOperations.length > 0) {
            await Property.bulkWrite(bulkOperations);
            updatedCount += bulkOperations.length;
        }

        offset += properties.length;
    }

    console.log(`Updated image URLs for ${updatedCount} properties.`);
    mongoose.disconnect();
}

updateImageListURLs();
