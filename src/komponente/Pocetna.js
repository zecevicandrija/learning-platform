import React from 'react';
import './Pocetna.css';
import { Link } from 'react-router-dom';

const Pocetna = () => {
  return (
    <div className="pocetna-container">
        

      <section className="hero-section">
        <h1>Dobro dosli na Kurseve</h1>
        <p>Your one-stop shop for the best products.</p>
        <Link to='/kursevi'className="shop-now-btn">Vidi kurseve</Link>
      </section>

      <section className="featured-products">
        <h2>Najnoviji Kursevi</h2>
        <div className="product-list">
          <div className="product-item">Kurs 1</div>
          <div className="product-item">Kurs 2</div>
          <div className="product-item">Kurs 3</div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Kursevi. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Pocetna;
