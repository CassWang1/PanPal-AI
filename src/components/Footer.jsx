import React from 'react';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="app__footer">
            <p>&copy; {currentYear} PanPal AI. All rights reserved.</p>
        </footer>
    );
}

export default Footer;