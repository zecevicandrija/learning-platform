import React, {useState, useEffect} from 'react';
import './Pocetna.css';
import { Link } from 'react-router-dom';
import reactkurs from '../images/reactkurs.png'
import csskurs from '../images/csskurs.png'
import pythonkurs from '../images/pythonkurs.jpg'
import { useAuth } from '../login/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate



const Pocetna = () => {
  const { user, updateUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate


  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/wishlist/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setWishlist(data);
          } else {
            console.error('Failed to fetch wishlist');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  const handleCourseClick = (kursId) => {
    navigate(`/kurs/${kursId}`); // Navigate to KursDetalj component
  };

  const handleAddCoursesClick = () => {
    navigate('/kursevi'); // Navigate to Kursevi component
  };

  const handleRemoveFromWishlist = async (kursId) => {
    if (!user) {
      alert('Please log in to remove from wishlist.');
      return;
    }

    try {
      await fetch('http://localhost:5000/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          korisnik_id: user.id,
          kurs_id: kursId,
        }),
      });

      // Update the local wishlist
      setWishlist(wishlist.filter(item => item.kurs_id !== kursId));
    } catch (error) {
      console.error('Error removing course from wishlist:', error);
    }
  };
  
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

      <section className='wishlist-section'>
        <h2 className="wishlist-title">Wishlist</h2>
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <p>Vaša lista želja je prazna. Dodajte kurseve da biste ih videli ovde.</p>
            <button onClick={handleAddCoursesClick} className="add-courses-btn">
              Dodaj kurseve
            </button>
          </div>
        ) : (
          <ul className="wishlist-list">
            {wishlist.map(item => (
              <li 
                className="wishlist-item" 
                key={item.kurs_id}
                onClick={() => handleCourseClick(item.kurs_id)} // Add onClick event
              >
                {item.naziv}
                <button 
              className="profil-remove-btn" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering handleCourseClick
                handleRemoveFromWishlist(item.kurs_id);
              }}
            >
              <i className="ri-delete-bin-line"></i>
            </button>
              </li>
            ))}
          </ul>
        )}
      </section>


      <footer className="footer">
        <p>&copy; 2024 Kursevi. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Pocetna;
