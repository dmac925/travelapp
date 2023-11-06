import React from 'react';
import './BusinessForm.css';

const BusinessForm = () => {
  return (
    <div className="form-container">
      <div className="input-group">
        <label>Name *</label>
        <input type="text" placeholder="Sunburst Public Storage" />
        <span>For guidelines to represent your business, <a href="#">click here</a></span>
      </div>

      <div className="input-group address">
        <label>Address *</label>
        <input type="text" placeholder="12 Broadway Blvd" />
        <input type="text" placeholder="Apartment/Suite (optional)" />
        <input type="text" placeholder="Denver" />
        <select>
          <option>Colorado</option>
          {/* Other states can be added here */}
        </select>
        <select>
          <option>United States</option>
          {/* Other countries can be added here */}
        </select>
      </div>


      <div className="input-group">
        <label>Main phone number</label>
        <input type="text" placeholder="(655) 960 – 9078" />
      </div>

      <div className="input-group">
        <label>Email</label>
        <input type="email" placeholder="melanierogers@sunburstps.com" />
      </div>

      <div className="input-group">
        <label>Website</label>
        <input type="url" placeholder="https://www.sunburstps.com" />
      </div>

      {/* Add a button or other functionality as needed */}
    </div>
  );
}

export default BusinessForm;
