const fs = require('fs');
const path = require('path');

// Assuming the JSONL data is in a file named 'data.jsonl'
const filePath = path.join(__dirname, 'data.jsonl');  
const outputCSVPath = 'hotels.csv';

// Read the file and parse each line
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    const lines = data.trim().split('\n');
    const csvData = [];
    
    lines.forEach((line) => {
        const hotel = JSON.parse(line);
        const extractedData = {
            name: hotel.name,
            description: hotel.description,
            stars: hotel.stars,
            price: hotel.price,
            currency: hotel.currency,
            rating: hotel.rating,
            reviews: hotel.reviews,
            breakfast: hotel.breakfast,
            checkIn: hotel.checkIn,
            checkOut: hotel.checkOut,
            location: `${hotel.location.lat}, ${hotel.location.lng}`,
            address: hotel.address.full,
            image: hotel.image,
            facilities: hotel.facilities.map(facility => facility.name).join('; ')
        };

        // Wrap each value in quotes
        csvData.push(Object.values(extractedData).map(value => `"${value}"`).join(','));
    });

    // Create CSV header and content
    const csvHeader = Object.keys(csvData[0]).map(key => `"${key}"`).join(',');
    const csvContent = [csvHeader].concat(csvData).join('\n');
    
    // Write to CSV file
    fs.writeFile(outputCSVPath, csvContent, (writeErr) => {
        if (writeErr) {
            console.error('Error writing to CSV file:', writeErr);
            return;
        }
        console.log(`Data successfully saved to ${outputCSVPath}`);
    });
});