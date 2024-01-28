require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Developer = require('../models/developer'); 

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = './data/Developers-Export-2024-January-15-2300.csv'; 

async function processDevelopers() {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const developerData of results) {
                const developer = new Developer({
                    developerId: developerData.devId,
                    devCode: developerData.devCode,
                    name: developerData.name,
                    location: {
                        lat: developerData.Lat,
                        lng: developerData.Lng
                    },
                    address: {
                        full: developerData.FullAddress,
                        postalCode: developerData.PostalCode,
                        street1: developerData.Street1,
                        street2: developerData.Street2,
                        city: developerData.City,
                        state: developerData.State,
                        region: developerData.Region,
                        country: developerData.Country,
                        area: developerData.Area,
                        mapAddress: developerData.MapAddress,
                        shortAddress: developerData.ShortAddress
                    },
                    mainDescription: developerData.mainDescription,
                    metaDescription: developerData.MetaDescription,
                    featuredImage: developerData.FeaturedImage,
                    priceFrom: developerData.PriceFrom,
                    priceTo: developerData.PriceTo,
                    currency: developerData.Currency,
                    importDate: developerData.importDate,
                    oldPermalink: developerData.permalink,
                    imageURL: developerData.imageURL,
                    imageNumbers: developerData.ImageNumbers,
                    propType: developerData.PropType,
                    slug: developerData.slug
                });

                try {
                    await developer.save();
                    console.log(`Developer ${developer.name} saved successfully.`);
                } catch (saveError) {
                    console.error('Error saving developer:', saveError);
                }
            }
            console.log('All developers processed.');
            mongoose.disconnect();
        });
}

processDevelopers();
