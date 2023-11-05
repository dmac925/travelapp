import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SentimentOverview = ({ monthYear, averageRating, reviewCount }) => {
    return (
        <div>
            <h2>{monthYear}</h2>
            <p>Average Rating: {averageRating}</p>
            <p>Review Count: {reviewCount}</p>
        </div>
    );
};

const CategoryCard = ({ category }) => {
    return (
        <div>
            <h3>{category.category}</h3>
            <ul>
                {category.keywords.map((keyword, index) => (
                    <li key={index}>{keyword.keyword} ({keyword.sentiment}, {keyword.mentions} mentions)</li>
                ))}
            </ul>
        </div>
    );
};

const ImprovementSection = ({ improvements }) => {
    return <div>Improvements: <p>{improvements}</p></div>;
};

const Dashboard = () => {
    const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
    const hotelId = '654277c1abc0c6a7612d8b1a'; // Define hotelId here

    useEffect(() => {
        const fetchSentimentAnalysis = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/hotels/${hotelId}/sentiment-analysis`);
                setSentimentAnalysis(response.data);
            } catch (error) {
                console.error('Error fetching sentiment analysis data:', error);
            }
        };

        fetchSentimentAnalysis();
    }, []);

    if (!sentimentAnalysis) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {sentimentAnalysis.map((monthAnalysis, index) => (
                <div key={index}>
                    <SentimentOverview 
                        monthYear={monthAnalysis.monthYear} 
                        averageRating={monthAnalysis.averageRating} 
                        reviewCount={monthAnalysis.reviewCount} 
                    />
                    {monthAnalysis.sentimentAnalysis.categories.map((category, index) => (
                        <CategoryCard key={index} category={category} />
                    ))}
                    <ImprovementSection improvements={monthAnalysis.sentimentAnalysis.improvements} />
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
