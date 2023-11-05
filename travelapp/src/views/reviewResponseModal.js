import React, { useState } from 'react';
import axios from 'axios';
import './reviewResponseModal.css';

const ReviewResponseModal = ({ review, isOpen, onClose }) => {
    const [draftResponse, setDraftResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const handleGenerateResponse = async () => {
        setIsLoading(true); // Start loading
        // Construct the request body
        const requestBody = { reviewText: review.summary };
    
        try {
            // Send POST request to your backend endpoint
            const response = await axios.post('http://localhost:4000/hotels/generate-response', { reviewText: review.summary });
    
            if (response.status === 200) {
                // Update the draft response state with the response from OpenAI
                setDraftResponse(response.data.response);
            } else {
                console.error('Failed to generate response:', response.data.message);
            }
        } catch (error) {
            console.error('Error generating response:', error);
        }
        setIsLoading(false); // End loading
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Review Details</h2>
                <p><strong>Date:</strong> {review.date}</p>
                <p><strong>Location:</strong> {review.location}</p>
                <p><strong>Rating:</strong> {review.rating}</p>
                <p><strong>Source:</strong> {review.source}</p>
                <p><strong>Summary:</strong> {review.summary}</p>
                <div className="draft-response-section">
                    <h3>Draft Response</h3>
                    <button onClick={handleGenerateResponse} disabled={isLoading}>
                        {isLoading ? 'Generating Response...' : 'Generate Response'}
                    </button>
                    <textarea 
                        value={draftResponse} 
                        onChange={(e) => setDraftResponse(e.target.value)} 
                        placeholder="Your response will appear here..." 
                    />
                </div>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ReviewResponseModal;
