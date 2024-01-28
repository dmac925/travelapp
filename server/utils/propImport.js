require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Property = require('../models/property'); // Adjust the path as needed

mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const filePath = './data/Properties-Export-2024-January-15-2300.csv';

function convertPropTypeToPropertyTypes(propType) {
    // Check if the property type includes 'House'
    const isHouse = propType.includes('House');
  
    // Split the propType string into individual types
    const types = propType.split('|').map(type => type.trim());
  
    // Filter out the 'House' type if it's already flagged as a house
    const filteredTypes = isHouse ? types.filter(type => type !== 'House') : types;
  
    // Map each type to the new object format
    return filteredTypes.map(type => {
      if (type.includes('Bed')) {
        // Extract the number of beds and return the object
        const bedCount = type.replace(' Bed', '');
        return {
          type: isHouse ? 'house' : 'apartment',
          bedCounts: bedCount
        };
      }
      // Handle other property types if necessary
      return {
        type: type.toLowerCase(),
        bedCounts: '' // or some default value
      };
    });
  }
  
  

async function processProperties() {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const propertyData of results) {
                const propertyTypes = convertPropTypeToPropertyTypes(propertyData.propType);


                const property = new Property({
                    propId: propertyData.PropId,
                    name: propertyData.Name,
                    developerName: propertyData.developerName, 
                    developerId: propertyData.developerId,
                    location: {
                        lat: propertyData.locationLat,
                        lng: propertyData.locationLng
                    },
                    address: {
                        full: propertyData.fullAddress, // 
                        postalCode: propertyData.postalCode,
                        street1: propertyData.street1, // 
                        street2: propertyData.street2,
                        city: propertyData.City, // 
                        state: propertyData.State, // 
                        region: propertyData.Region, // 
                        country: propertyData.Country,
                        area: propertyData.Area, // 
                        mapAddress: propertyData.mapAddress, // 
                        shortAddress: propertyData.shortAddress
                    },
                    mainDescription: propertyData.mainDescription,
                    metaDescription: propertyData.metaDescription,
                    featuredImage: propertyData.featuredImage,
                    propFeatures: propertyData.propFeatures,
                    developmentAmenities: propertyData.developmentAmenities, // 
                    priceFrom: propertyData.priceFrom,
                    priceTo: propertyData.priceTo,
                    currency: propertyData.Currency, // 
                    importDate: propertyData.importDate,
                    oldPermalink: propertyData.oldPermalink,
                    imageList: propertyData.imageList,
                    imageNumbers: propertyData.imageNumbers,
                    propType: propertyData.propType,
                    propertyTypes: propertyTypes,
                    slug: propertyData.slug
                });

                try {
                    await property.save();
                    console.log(`Property ${property.name} saved successfully.`);
                } catch (saveError) {
                    console.error('Error saving property:', saveError);
                }
            }
            console.log('All properties processed.');
            mongoose.disconnect();
        });
}

processProperties();
