import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './reviewTable.css';

const ReviewTable = () => {
    const [reviews, setReviews] = useState([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const hotelId = '6540f3ec3f123334c6bdf3cf';

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/hotels/${hotelId}`);
                if (response.data && response.data.reviews) {
                    setReviews(response.data.reviews.map(review => ({
                        date: new Date(review.publishedAtDate).toLocaleDateString(),
                        location: response.data.name,
                        address: response.data.address.full,
                        rating: review.stars,
                        source: review.reviewType,
                        summary: review.text || "No comment provided"
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };
        fetchReviews();
    }, []);

    const filteredReviews = reviews.filter(review => {
        const matchesLocation = !locationFilter || review.location.includes(locationFilter);
        const matchesStartDate = !startDateFilter || new Date(review.date) >= new Date(startDateFilter);
        const matchesEndDate = !endDateFilter || new Date(review.date) <= new Date(endDateFilter);
        return matchesLocation && matchesStartDate && matchesEndDate;
    });

    return (
        <div className="review-table">
            <h2>Reviews ({filteredReviews.length})</h2> {/* Adjusted to reflect the actual number of reviews */}
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
                {filteredReviews.map((review, index) => (
                        <tr key={index}>
                            <td>{review.date}</td>
                            <td>{review.location}</td>
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
