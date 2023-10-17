import React, { useState, useEffect, useContext } from 'react';
import axios from "axios";
import { TaskCard } from './TaskCard';
import { URL } from "../config";
import UserContext from '../UserContext';

const TravelView = () => {
    const userId = useContext(UserContext);
    // Assuming you get `parsedData` from some source. Placeholder for now:
    const parsedData = {};

    const travelData = {
        userId: userId,
        reservationCode: parsedData["Reservation Code"],
        flightNumber: parsedData["Flight Number"],
        // ... (add other fields)
    };

    // Instead of trying to save directly to the database, send a request to your backend
    const saveTravelData = async () => {
        try {
            const response = await axios.post(`${URL}/api/travel/add`, travelData);
            console.log('Data saved:', response.data);
        } catch (error) {
            console.error('Error inserting data:', error.response);
        }
    };

    useEffect(() => {
        // Call this function if you want to save data when the component mounts.
        // Otherwise, you can trigger it on some event (like a button click).
        saveTravelData();
    }, []);

    return (
        // Render your component UI here
        <div>
            {/* Your component content */}
        </div>
    );
}

export default TravelView;
