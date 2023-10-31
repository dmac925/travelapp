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
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/hotels`)
      .then(response => {
        console.log('Response:', response.data);
  
        setHotels(response.data);
  
        // Extract labels from hotelImages
        const labels = [...new Set(response.data.flatMap(hotel => (
          hotel.hotelImages.map(image => image.label)
        )))];
  
        setImageLabels(labels);
  
        setColumnSelections(Array(3).fill(labels[0]));
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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalVisible && selectedImage) {
        const modal = document.getElementById('modal');
        if (modal && !modal.contains(e.target)) {
          closeModal();
        }
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [modalVisible, selectedImage]);

  const numberOfColumns = 3;


  return (
    <div style={styles.container}>
      <HorizontalSlider>
        <table style={styles.table}>
          {/* ... */}
          <thead>
            <tr>
            <th style={styles.hotelNameHeader}>Hotel Name</th>
            {columnSelections.slice(0, numberOfColumns).map((selection, index) => (
                <th key={index} style={styles.columnSelectorHeader}>
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
  {hotels.map((hotel, index) => {
    const firstRoomSize = hotel.hotelRooms && hotel.hotelRooms[0] && hotel.hotelRooms[0].roomSize;
    return (
      <tr key={index}>
        <td style={styles.hotelName}>
          {hotel.name}
          <StarComponent stars={hotel.stars} />
          {firstRoomSize && <div style={{ fontSize: '12px', marginTop: '5px' }}>{`Room Size: ${firstRoomSize}`}</div>}
        </td>
        {columnSelections.slice(0, numberOfColumns).map((label, colIndex) => {
          const image = hotel.hotelImages.find(img => img.label === label);
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
    );
  })}
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