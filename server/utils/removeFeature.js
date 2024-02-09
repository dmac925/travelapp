require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const BATCH_SIZE = 100;

async function removeParkAndRiversideWalkFeature() {
    let offset = 0;
    let updatedCount = 0;

    while (true) {
        const properties = await Property.find({ propFeatures: "Park &amp; riverside walk" }) // Find properties with "Park & riverside walk"
                                          .skip(offset)
                                          .limit(BATCH_SIZE);

        if (properties.length === 0) {
            break; // Exit the loop if no more properties to process
        }

        for (let property of properties) {
            // Remove "Park & riverside walk" from propFeatures
            const updatedFeatures = property.propFeatures.filter(feature => feature !== "Park &amp; riverside walk");

            // Update the document if "Park & riverside walk" was actually removed (i.e., it was present)
            if (property.propFeatures.length !== updatedFeatures.length) {
                await Property.updateOne(
                    { _id: property._id },
                    {
                        $set: { propFeatures: updatedFeatures }
                    }
                );

                updatedCount++;
            }
        }

        offset += properties.length;
    }

    console.log(`Removed 'Park & riverside walk' feature from ${updatedCount} properties.`);
    mongoose.disconnect();
}

removeParkAndRiversideWalkFeature();
