const express = require('express');
const router = express.Router();
const Travel = require('../models/travel');



router.post('/add', async (req, res) => {
    try {
        // Check if a travel entry with the same reservationCode already exists
        const existingTravel = await Travel.findOne({ reservationCode: req.body.reservationCode });

        if (existingTravel) {
            return res.status(400).send("A trip with this reservation code already exists.");
        }

        // If not, proceed to save the new travel data
        console.log(req.body);

        const newTravel = new Travel(req.body);
        const savedTravel = await newTravel.save();
        res.status(201).json(savedTravel);
    } catch (error) {
        console.error(`Error saving the travel data: ${error}`);
        res.status(500).send("Error saving travel data");
    }
});

module.exports = router;