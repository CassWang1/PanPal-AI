import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import './ConfirmationModal.css';

function ConfirmationModal({
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
  successMessage = null
}) {

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={handleModalContentClick}>
        <h3 className="modal-title">{title}</h3>
        
        {successMessage && <SuccessMessage message={successMessage} />} 
        {error && <ErrorMessage message={error} />} 

        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="button--secondary"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="button--primary"
          >
            {isLoading ? <LoadingSpinner size={20} /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal; 