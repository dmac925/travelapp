import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewResponseModal from './reviewResponseModal'; 
import './reviewTable.css';

const ReviewTable = () => {
    const [reviews, setReviews] = useState([]);
    const [summaryFilter, setSummaryFilter] = useState(''); // Renamed from locationFilter
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState(''); 
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hotelId = '654277c1abc0c6a7612d8b1a';

    const handleRespondClick = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/hotels/${hotelId}`);
                console.log(response);
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
        const matchesSummary = !summaryFilter || review.summary.toLowerCase().includes(summaryFilter.toLowerCase()); // Changed from location to summary
        const matchesStartDate = !startDateFilter || new Date(review.date) >= new Date(startDateFilter);
        const matchesEndDate = !endDateFilter || new Date(review.date) <= new Date(endDateFilter);
        const matchesSource = !sourceFilter || review.source === sourceFilter; 
        return matchesSummary && matchesStartDate && matchesEndDate && matchesSource; 
    });

    return (
        <div className="review-table">
            <h2>Reviews ({filteredReviews.length})</h2> {/* Adjusted to reflect the actual number of reviews */}
            <div className="filters">
            <div className="filter">
  <label>Summary: </label>
  <input
    type="text"
    value={summaryFilter}
    onChange={(e) => setSummaryFilter(e.target.value)}
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
                <div className="filter"> {/* New filter input for source */}
                    <label>Source: </label>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                    >
                        <option value="">All Sources</option>
                        <option value="TripAdvisor">TripAdvisor</option>
                        <option value="Google">Google</option>
                    </select>
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
                                <button onClick={() => handleRespondClick(review)}>Respond</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <ReviewResponseModal 
                review={selectedReview} 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
            />
            </table>
        </div>
    );
}

export default ReviewTable;
