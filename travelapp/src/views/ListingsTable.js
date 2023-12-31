import React, { useState } from 'react';
import BusinessForm from './BusinessForm';
import SimpleModal from './SimpleModal';

const ListingsTable = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const businessData = [
    { siteName: 'Google', businessName: 'Flowers by Emily', address: '651 Emerson St. Palo Alto, CA 94301', phone: 'Not found' },
    { siteName: 'Facebook', businessName: 'Flowers by Emily', address: '651 Emerson St. Palo Alto, CA 94301', phone: '(408) 234-xxxx' },
    { siteName: 'Bing', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'TripAdvisor', businessName: 'PA Lumen Health', address: 'Not found', phone: '(408) 234-xxxx' },
    { siteName: 'Booking.com', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'Hotels.com', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'Agoda', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'Yelp', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'Apple Maps', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    { siteName: 'Amazon Alexa', businessName: 'Not found', address: 'Not found', phone: 'Not found' },
    // ... add more data as needed
  ];

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Site name</th>
            <th>Business name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {businessData.map((data, index) => (
            <tr key={index}>
              <td>{data.siteName}</td>
              <td>{data.businessName}</td>
              <td>{data.address}</td>
              <td>{data.phone}</td>
              <td>
                <button onClick={openModal}>Update Listing</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SimpleModal isOpen={isModalOpen} close={closeModal}>
        <BusinessForm />
      </SimpleModal>
    </>
  );
};

export default ListingsTable;
