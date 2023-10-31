import React, { useState, useEffect } from 'react';
import './reviewTable.css';

const ReviewTable = () => {
    const reviews = [
        {
            date: "12/06/2021",
            location: "Leo Tap",
            address: "1464 W Erie St",
            rating: 5.0,
            source: "Google",
            summary: "They do a pretty good job over there and forgot things too"
        },
        {
            date: "12/04/2021",
            location: "Aries Cafe",
            address: "2800 Country Club Dr",
            rating: 5.0,
            source: "Google",
            summary: "They have the most beautiful Christmas lights and tree."
        },
        // ... add other reviews
    ];

    const [locationFilter, setLocationFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const filteredReviews = reviews.filter(review => {
        const matchesLocation = !locationFilter || review.location.includes(locationFilter);
        const matchesStartDate = !startDateFilter || new Date(review.date) >= new Date(startDateFilter);
        const matchesEndDate = !endDateFilter || new Date(review.date) <= new Date(endDateFilter);
        return matchesLocation && matchesStartDate && matchesEndDate;
    });

    return (
        <div className="review-table">
            <h2>Reviews (8)</h2>
              <div className="filters">
                <div className="filter">
                    <label>Location: </label>
                    <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Filter by location"
                    />
                </div>
                <div className="filter">
                    <label>Start Date: </label>
                    <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                    />
                </div>
                <div className="filter">
                    <label>End Date: </label>
                    <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                    />
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Source</th>
                        <th>Summary</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review, index) => (
                        <tr key={index}>
                            <td>{review.date}</td>
                            <td>{review.location}<br/>{review.address}</td>
                            <td>{review.rating}</td>
                            <td>{review.source}</td>
                            <td>{review.summary}</td>
                            <td>
                                {/* Here you can add logic or buttons for response */}
                                <button>Respond</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ReviewTable;
