import React from 'react';

function StarComponent({ stars }) {
    const styles = {
        starsContainer: {
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'left',
            marginTop: '5px',
        },
    };

    return (
        <div style={styles.starsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
                <span key={index}>
                    {index < stars ? "★" : "☆"}
                </span>
            ))}
        </div>
    );
}

export default StarComponent;