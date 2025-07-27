import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import logo from '../assets/images/logo.png';
import panpanImage from '../assets/images/panpan.png';
import './Login.css';

function Login({ onLogin, onRegister, isLoading, message, clearMessage }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (!username.trim()) {
      return;
    }
    onLogin(username);
  };

  const handleInputChange = (e) => {
      setUsername(e.target.value);
      if (message) {
          clearMessage();
      }
  }

  return (
    <div className="login-page-wrapper">
        <div className="login-container">
            <div className="login-character-column">
                <img src={panpanImage} alt="PanPal Mascot" className="login-character-image" />
            </div>
            <div className="login-content-column">
                <div className="login-branding">
                    <img src={logo} alt="PanPal AI Logo" className="login-logo" />
                    <h1 className="login-app-name">PanPal AI</h1>
                </div>
                
                <p className="login-description">Get recipe ideas based on the ingredients you have!</p>

                <h2>Welcome!</h2>
                <p>Please log in or register to continue.</p>

                {message && <div className={`login-message ${message.includes('failed') || message.includes('denied') || message.includes('Invalid') ? 'error-message' : 'success-message'}`} role="alert">{message}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="visually-hidden">Username</label>
                    <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required 
                    />
                    <div className="login-actions">
                        <button type="submit" disabled={isLoading || !username.trim()}>
                        {isLoading ? <LoadingSpinner size={20} /> : 'Login'}
                        </button>
                        <button type="button" className="button--outline" disabled={isLoading || !username.trim()} onClick={() => onRegister(username)}>
                        Register
                        </button>
                    </div>
                </form>
                
                <div className="login-info-section">
                    <p className="login-info login-info--user">Usernames must be alphanumeric (letters, numbers, underscores, hyphens allowed).</p>
                    {/* <p className="login-info login-info--reviewer"><b>For Review:</b> The user "dog" is pre-registered and banned. Use "admin" to test administrator features.</p> */}
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;