require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property'); // Adjust the path as needed

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100; // Adjust the batch size as needed

async function updatePropertyFeatures() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({ propFeatures: { $exists: true, $ne: '' } })
                                        .skip(offset)
                                        .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break;
        }

        const bulkOperations = properties.map(property => {
            let features = property.propFeatures;
            // Check if propFeatures is an array and has at least one element
            if (Array.isArray(features) && features.length > 0) {
                // Assuming the first element is the string we need
                features = features[0];
            }

            // Now, we ensure it is a string and then split it
            if (typeof features === 'string') {
                return {
                    updateOne: {
                        filter: { _id: property._id },
                        update: { $set: { propFeatures: features.split('|').map(feature => feature.trim()) } }
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

    console.log(`Updated features for ${updatedCount} properties.`);
    mongoose.disconnect();
}

updatePropertyFeatures();
