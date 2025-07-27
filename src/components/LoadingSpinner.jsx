import React, { useState, useEffect } from 'react';
import '../index.css';
import './LoadingSpinner.css';

const loadingMessages = [
    "Whipping up something delicious...",
    "Simmering the perfect recipe...",
    "Consulting the culinary oracle...",
    "Chopping veggies, be right back!",
    "Preheating the oven...",
    "Gathering fresh ingredients...",
    "Stirring the pot...",
    "Just adding a pinch of magic...",
    "Don't worry, it's worth the wait!",
    "Taste testing in progress...",
];

function LoadingSpinner({ size = 'medium' }) {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const initialIndex = Math.floor(Math.random() * loadingMessages.length);
    setCurrentMessage(loadingMessages[initialIndex]);
    let currentIndex = initialIndex;

    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[currentIndex]);
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  const spinnerClassName = `loading-spinner loading-spinner--${size}`;

  return (
    <div className="loading-container">
        <div className={spinnerClassName} aria-label="Loading...">
            <span className="visually-hidden">Loading...</span>
        </div>
        {currentMessage && <p className="loading-text">{currentMessage}</p>}
    </div>
  );
}

export default LoadingSpinner; 