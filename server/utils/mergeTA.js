const fs = require('fs');
const fuzzyset = require('fuzzyset.js');

// Load the existing hotels
let hotels = JSON.parse(fs.readFileSync('hotels.jsonl', 'utf-8'));

// Create a mapping of hotels using postal code and name
let hotelMap = {};
hotels.forEach(hotel => {
    let key = `${hotel.postalCode}-${hotel.name}`;
    hotelMap[key] = hotel;
});

// Load the supplementary data
let additionalData = JSON.parse(fs.readFileSync('additionalData.jsonl', 'utf-8'));

// Using fuzzyset to handle name discrepancies
let hotelNames = Object.keys(hotelMap);
let fset = fuzzyset(hotelNames);

additionalData.forEach(data => {
    let key = `${data.postalCode}-${data.name}`;
    if (hotelMap[key]) {
        // Exact match found
        Object.assign(hotelMap[key], data);
    } else {
        // Use fuzzy matching on hotel name
        let fuzzyResults = fset.get(data.name);
        if (fuzzyResults && fuzzyResults[0][0] > 0.8) {  // 0.8 is a threshold for similarity
            let closestMatch = fuzzyResults[0][1];
            Object.assign(hotelMap[closestMatch], data);
        }
        // NOTE: Longitude/Latitude matching can be added similarly
    }
});

// Save merged data
fs.writeFileSync('mergedHotels.jsonl', JSON.stringify(Object.values(hotelMap), null, 2));
