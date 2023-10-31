const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, 'additionalData.json');

async function reformatPostalCodes() {
    try {
        // Read the file
        const data = await fs.readFile(filePath, 'utf-8');
        const additionalHotels = JSON.parse(data);

        // Update the postal codes
        for (const hotel of additionalHotels) {
            if (hotel.addressObj && hotel.addressObj.postalcode) {
                const pc = hotel.addressObj.postalcode;
                
                // Check if a space exists before the last three characters
                if (!/\s\w{3}$/.test(pc)) {
                    hotel.addressObj.postalcode = `${pc.slice(0, -3)} ${pc.slice(-3)}`;
                }
            }
        }
        // Write the updated data back to the file
        await fs.writeFile(filePath, JSON.stringify(additionalHotels, null, 2), 'utf-8');
        console.log('PostalCodes reformatted successfully.');

    } catch (err) {
        console.error('Error in reformatPostalCodes:', err);
    }
}

reformatPostalCodes();




