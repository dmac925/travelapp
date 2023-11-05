import React from 'react';
import './KeywordCard.css'; // include your styles

const KeywordCard = ({ keyword, positive, negative }) => {
    const total = positive + negative;
    const positiveWidth = (positive / total) * 100;
    const negativeWidth = (negative / total) * 100;

    return (
        <div className="keyword-card">
            <h3>{keyword}</h3>
            <div className="sentiment-bar">
                <div className="positive-bar" style={{ width: `${positiveWidth}%` }}>{positive}</div>
                <div className="negative-bar" style={{ width: `${negativeWidth}%` }}>{negative}</div>
            </div>
        </div>
    );
};

export default KeywordCard;