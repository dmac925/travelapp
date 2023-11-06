import React from 'react';
import './SimpleModal.css'; // Make sure to style your modal

const SimpleModal = ({ children, isOpen, close }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={close}>X</button>
        {children}
      </div>
    </div>
  );
};

export default SimpleModal;
