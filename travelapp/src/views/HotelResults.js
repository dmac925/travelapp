import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { URL } from "../config";
import UserContext from '../UserContext';
import HorizontalSlider from '../components/HorizontalSlider';
import StarComponent from '../components/StarComponent';  



function HotelResults() {

  const [hotels, setHotels] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [columnSelections, setColumnSelections] = useState([]);
  const [imageLabels, setImageLabels] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/hotels')
      .then(response => {
        console.log('Response:', response.data);

        setHotels(response.data);
        
      
        const labels = [...new Set(response.data.flatMap(hotel => hotel.images.map(img => img.label)))];
        setImageLabels(labels);

        setColumnSelections(Array(4).fill(labels[0]));
      })
      .catch(error => {
        console.error('Error fetching hotel data:', error);
      });
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  return (
    <div style={styles.container}>
      <HorizontalSlider>
        <table style={styles.table}>
          {/* ... */}
          <thead>
            <tr>
              <th style={styles.hotelNameHeader}>Hotel Name</th>
              {columnSelections.map((selection, index) => (
                <th key={index} style={styles.columnSelectorHeader}>
                  {index < 4 ? (
                    <select
                      value={selection}
                      onChange={(e) => {
                        const newSelections = [...columnSelections];
                        newSelections[index] = e.target.value;
                        setColumnSelections(newSelections);
                      }}
                    >
                      {imageLabels.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel, index) => (
              <tr key={index}>
                  <td style={styles.hotelName}>
                {hotel.name}
                <StarComponent stars={hotel.stars} />
            </td>
                {columnSelections.map((label, colIndex) => {
                  const image = hotel.images.find(img => img.label === label);
                  return (
                    <td key={colIndex} style={styles.amenityCell}>
                      {image ? (
                        <img
                          src={image.url}
                          alt={label}
                          style={styles.amenityImage}
                          onClick={() => openModal(image)}
                        />
                      ) : (
                        <textarea
                          style={styles.amenityTextBox}
                          placeholder="Image not available"
                          disabled
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </HorizontalSlider>
      {modalVisible && selectedImage && (
        <div style={styles.modal}>
          <img
            src={selectedImage.url}
            alt={selectedImage.label}
            style={styles.fullSizeImage}
          />
          <button onClick={closeModal} style={styles.closeButton}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed', 
  },
  hotelNameHeader: {
    background: 'white',
    zIndex: 10,
    position: 'sticky',
    left: 0,
  },
  columnSelectorHeader: {
    background: '#f0f0f0',
    padding: '5px',
    textAlign: 'center',
  },
  hotelName: {
    background: 'white',
    zIndex: 10,
    position: 'sticky',
    left: 0,
  },
  amenityCell: {
    padding: '0', // Adjust cell padding as needed
    border: '1px solid #ddd',
  },
  amenitiesContainer: {
    flex: 3,
    gap: '10px',
  },
  amenityImage: {
    width: '100%', 
    height: 'auto', // Maintain aspect ratio
  },
  amenityTextBox: {
    display: 'none', 
    resize: 'none',
    padding: '5px',
  },
  hotelContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  modal: {
    position: 'fixed',  // Fixed position
    top: 0, left: 0, right: 0, bottom: 0,  // Cover the entire viewport
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Dark background with a bit of transparency
    display: 'flex',  // Using Flexbox to center the content
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000  // Make sure the modal is above everything else
  },
  fullSizeImage: {
    maxWidth: '80%',  // Limiting the size to not cover the entire window
    maxHeight: '80%',
    border: '5px solid white'
  },
  closeButton: {
    position: 'absolute',  // Absolutely position the close button
    top: '20px', right: '20px',  // Top right corner
    padding: '5px 15px',
    background: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1001  // Make sure the button is above the modal
  }
  
};

export default HotelResults;