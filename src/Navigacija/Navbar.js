import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../login/auth';
import './Navbar.css';
import undologoo from '../images/undologoo.jpg';
import { ThemeContext } from '../komponente/ThemeContext'; // Import ThemeContext

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDarkTheme, toggleTheme } = useContext(ThemeContext); // Get the theme context
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const updateCartItems = () => {
            const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItems(storedCart);
        };

        // Update cart items on component mount
        updateCartItems();

        // Listen for changes to localStorage and custom event
        window.addEventListener('storage', updateCartItems);
        window.addEventListener('cart-updated', updateCartItems);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('storage', updateCartItems);
            window.removeEventListener('cart-updated', updateCartItems);
        };
    }, []); // Empty dependency list to run only once

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const cartItemCount = cartItems.length; // Ensure it's a number

    return (
        <nav className={`navbar ${isDarkTheme ? 'dark' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={undologoo} alt='logo' className='logo' />
                </Link>
                <button className="navbar-hamburger" onClick={handleMenuToggle}>
                    <i className="ri-menu-line"></i>
                </button>
                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li className="navbar-item">
                        <Link to="/" className="navbar-link">Početna</Link>
                    </li>
                    <li className="navbar-item">
                        <Link to="/kursevi" className="navbar-link">Kursevi</Link>
                    </li>
                    {!user ? (
                        <>
                            <li className="navbar-item">
                                <Link to="/signup" className="navbar-link">Registracija</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/login" className="navbar-link">Login</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            {(user.uloga === 'admin' || user.uloga === 'instruktor') && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/lekcije" className="navbar-link">Napravi Lekciju</Link>
                                    </li>
                                    <li className="navbar-item">
                                        <Link to="/dodajkurs" className="navbar-link">Napravi Kurs</Link>
                                    </li>
                                </>
                            )}

                            <li className="navbar-item">
                                <Link to="/kupljenkurs" className="navbar-link">Vaši Kursevi</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/korpa" className="navbar-link">
                                    <i className="ri-shopping-cart-2-line"></i>
                                    {/* Show cart badge only if there are items in the cart */}
                                    {cartItemCount > 0 && (
                                        <span className="cart-badge">{cartItemCount}</span>
                                    )}
                                </Link>
                            </li>

                            {(user.uloga === 'instruktor' || user.uloga === 'admin') && (
                                <>
                                    <li className="navbar-item">
                                        <Link to="/instruktor" className="navbar-link">
                                            <i className="ri-line-chart-line"></i>
                                        </Link>
                                    </li>
                                </>
                            )}

                            <li className="navbar-item">
                                <Link to="/profil" className="navbar-link">
                                    <i className="ri-account-circle-line"></i>
                                </Link>
                            </li>
                        </>
                    )}
                    <li className="navbar-item">
                        <button className="theme-toggle-button" onClick={toggleTheme}>
                            {isDarkTheme ? (
                                <i className="ri-moon-line"></i>
                            ) : (
                                <i className="ri-sun-line"></i>
                            )}
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
