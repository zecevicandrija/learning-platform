import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">Logo</Link>
                <ul className="navbar-menu">
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link">Početna</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/kursevi" className="navbar-link">Kursevi</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/login" className="navbar-link">Login</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
