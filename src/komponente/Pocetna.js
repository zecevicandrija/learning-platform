import React from 'react';
import './Pocetna.css';
import { Link } from 'react-router-dom';
import reactkurs from '../images/reactkurs.png'
import csskurs from '../images/csskurs.png'
import pythonkurs from '../images/pythonkurs.jpg'

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
          <div className="product-item">Complete <b>ReactJS</b>
            <img src={reactkurs} alt='SLIKA' className='slikakursa'/>
          </div>
          <div className="product-item"><b>Web Design</b>
          <img src={csskurs} alt='SLIKA' className='slikakursa'/>
          </div>
          <div className="product-item">Advanced <b>Python</b>
          <img src={pythonkurs} alt='SLIKA' className='slikakursa'/>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Kursevi. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Pocetna;
