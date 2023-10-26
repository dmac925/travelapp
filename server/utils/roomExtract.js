const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const INPUT_FILE = path.join(__dirname, 'londonrooms.csv');  
const OUTPUT_FILE = path.join(__dirname, 'extracted_rooms.csv');

let roomsData = [];
let seenCombinations = new Set(); 

fs.createReadStream(INPUT_FILE)
    .pipe(csv())
    .on('data', (row) => {
        // Convert potential NaN values to strings before checking
        let feature_0 = String(row['features/0']);
        let feature_1 = String(row['features/1']);
        
        let isSizeInFeature_0 = feature_0.includes('feet²') || feature_0.includes('m²');
        let isSizeInFeature_1 = feature_1.includes('feet²') || feature_1.includes('m²');

        let roomSize;
        if (isSizeInFeature_0) {
            roomSize = feature_0;
        } else if (isSizeInFeature_1) {
            roomSize = feature_1;
        } else {
            roomSize = null;  // Set to null if room size is not found
        }

        // Create a unique key for hotel name, room type, and room size combination
        let uniqueKey = `${row['name']}-${row['roomType']}-${roomSize}`;

        // Only add the data if this combination hasn't been seen before
        if (!seenCombinations.has(uniqueKey)) {
            roomsData.push({
                hotelName: row['name'],
                roomType: row['roomType'],
                roomSize: roomSize
            });
            seenCombinations.add(uniqueKey);
        }
    })
    .on('end', () => {
        const csvWriter = createCsvWriter({
            path: OUTPUT_FILE,
            header: [
                {id: 'hotelName', title: 'Hotel Name'},
                {id: 'roomType', title: 'Room Type'},
                {id: 'roomSize', title: 'Room Size'},
            ],
        });

        csvWriter.writeRecords(roomsData)
            .then(() => {
                console.log('New CSV file created.');
            });
    });
