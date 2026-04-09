import React from 'react';
import './Header.css';

export const Header = ({ title, description }) => {
    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-content">
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                </div>
            </div>
        </header>
    );
};
