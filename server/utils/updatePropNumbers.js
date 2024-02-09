require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100;

async function updatePropertiesWithFlats() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({})
                                          .skip(offset)
                                          .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break; // Exit the loop if no more properties to process
        }

        for (let property of properties) {
            // Find the "Flats <number>" feature
            const flatsFeatureIndex = property.propFeatures.findIndex(feature => feature.startsWith("Flats "));
            if (flatsFeatureIndex !== -1) {
                // Extract the number of flats
                const flatsNumber = parseInt(property.propFeatures[flatsFeatureIndex].split(" ")[1], 10);

                if (!isNaN(flatsNumber)) {
                    // Update the document
                    await Property.updateOne(
                        { _id: property._id },
                        {
                            $set: { numberOfProperties: flatsNumber },
                            $pull: { propFeatures: property.propFeatures[flatsFeatureIndex] } // Remove the "Flats <number>" feature
                        }
                    );

                    updatedCount++;
                }
            }
        }

        offset += properties.length;
    }

    console.log(`Updated ${updatedCount} properties with number of flats.`);
    mongoose.disconnect();
}

updatePropertiesWithFlats();
