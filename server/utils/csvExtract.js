const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const INPUT_FILE = './utils/barcelonaTA.csv';
const OUTPUT_FILE = './utils/output.csv';

let hotels = [];

fs.createReadStream(INPUT_FILE)
    .pipe(csv())
    .on('data', (row) => {
        // Extract all non-empty amenities
        const hotelAmenities = [];
        for (const col of Object.keys(row)) {
            if (col.startsWith('amenities/')) {
                if (row[col] && row[col].trim() !== '') {
                    hotelAmenities.push(row[col]);
                    amenities: hotelAmenities.join('; ')
                }
            }
        }

        const roomTips = [];
        for (const col of Object.keys(row)) {
            if (col.startsWith('roomTips/') && col.endsWith('/text')) {
                if (row[col] && row[col].trim() !== '') {
                    roomTips.push(row[col]);
                }
            }
        }

        
        hotels.push({
            name: row['name'],
            brand: '',
            'location.city': row['addressObj/city'],
            'location.country': row['addressObj/country'],
            stars: row['hotelClass'],
            totalRooms: row['numberOfRooms'],
            amenities: hotelAmenities,
            priceRange: row['priceRange'],
            tripadvisorRating: row['rating'],
            roomTips: roomTips.join('; '),
            images: [{
                label: 'Main Image',
                url: row['image'],
                imageLabels: [],
                renamedImages: []
            }],
            imageArchive: []
        });

    })


    .on('end', () => {
        const csvWriter = createCsvWriter({
            path: OUTPUT_FILE,
                header: [
                    {id: 'name', title: 'Hotel Name'},
                    {id: 'brand', title: 'Brand'},
                    {id: 'location.city', title: 'City'},
                    {id: 'location.country', title: 'Country'},
                    {id: 'priceRange', title: 'Price Range'},
                    {id: 'tripadvisorRating', title: 'TripAdvisor Rating'},
                    {id: 'stars', title: 'Star Rating'},
                    {id: 'totalRooms', title: 'Total Rooms'},
                    {id: 'roomTips', title: 'Room Tips'},
                    {id: 'amenities', title: 'Amenities'},
                    {id: 'images[0].url', title: 'Main Image URL'},
                ],
        });

        csvWriter.writeRecords(hotels)
            .then(() => {
                console.log('New CSV file created.');
            });
    });
