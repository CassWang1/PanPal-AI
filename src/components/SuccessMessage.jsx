import React from 'react';
import './SuccessMessage.css';

function SuccessMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="success-message" role="status">
      <p>{message}</p>
    </div>
  );
}

export default SuccessMessage; 