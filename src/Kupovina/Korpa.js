import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../login/auth';
import './Korpa.css';

const Korpa = () => {
  const [cartItems, setCartItems] = useState([]);
  const [courseDetails, setCourseDetails] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instruktori, setInstruktori] = useState({});
  const [allDiscounts, setAllDiscounts] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState({ 
    id: null, 
    percent: 0 
  });

  // Učitavanje svih popusta iz baze
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/popusti');
        setAllDiscounts(response.data);
      } catch (error) {
        console.error('Error fetching discounts:', error);
      }
    };

    fetchDiscounts();
  }, []);
console.log(allDiscounts)
  // Učitavanje kurseva iz korpe
  useEffect(() => {
    const fetchCartItems = async () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(storedCart);

      const details = await Promise.all(storedCart.map(async (course) => {
        const kursId = course.id;

        if (!kursId) {
          console.error('Missing kurs_id for course:', course);
          return {
            ...course,
            rating: 0,
            lessonCount: 0,
          };
        }

        try {
          const ratingResponse = await axios.get(`http://localhost:5000/api/ratings/average/${kursId}`);
          const lessonsResponse = await axios.get(`http://localhost:5000/api/lekcije/count/${kursId}`);

          return {
            ...course,
            rating: ratingResponse.data.averageRating ?? 0,
            lessonCount: lessonsResponse.data.lessonCount ?? 0,
          };
        } catch (error) {
          console.error('Error fetching course details:', error);
          return {
            ...course,
            rating: 0,
            lessonCount: 0,
          };
        }
      }));

      setCourseDetails(details);
    };

    fetchCartItems();
  }, []);

  // Učitavanje liste želja
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`);
          setWishlist(wishlistResponse.data);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  // Učitavanje instruktora
  useEffect(() => {
    const fetchInstruktori = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/korisnici');
        const instructors = {};
        response.data.forEach(user => {
          if (user.uloga === 'instruktor' || user.uloga === 'admin') {
            instructors[String(user.id)] = `${user.ime} ${user.prezime}`;
          }
        });
        setInstruktori(instructors);
      } catch (error) {
        console.error('Error fetching instructors:', error);
      }
    };

    fetchInstruktori();
  }, []);

  // Izračunavanje ukupne cene
  const subtotal = courseDetails.reduce((acc, course) => acc + (course.cena || 0), 0);
  const discountAmount = (subtotal * discountInfo.percent) / 100;
  const total = subtotal - discountAmount;

  // Funkcija za kupovinu
  const handlePurchase = async () => {
    if (!user) {
      alert('Molimo prijavite se da biste završili kupovinu.');
      return;
    }

    try {
      for (const course of cartItems) {
        await axios.post('http://localhost:5000/api/kupovina', {
          korisnik_id: user.id,
          kurs_id: course.id,
          popust_id: discountInfo.id
        });
      }

      localStorage.removeItem('cart');
      setCartItems([]);
      navigate('/kupljenkurs');
    } catch (error) {
      console.error('Greška prilikom finalizacije kupovine:', error);
    }
  };

  // Funkcija za dodavanje u listu želja
  const handleAddToWishlist = async (course) => {
    if (!user) {
      alert('Molimo prijavite se da biste dodali u listu želja.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/wishlist', {
        korisnik_id: user.id,
        kurs_id: course.id,
      });

      setRecentlyAdded([course, ...recentlyAdded]);
      handleInstantRemoveFromCart(course);

      const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`);
      setWishlist(wishlistResponse.data);
    } catch (error) {
      console.error('Greška prilikom dodavanja u listu želja:', error);
    }
  };

  // Funkcija za uklanjanje iz liste želja
  const handleRemoveFromWishlist = async (course) => {
    if (!user) {
      alert('Molimo prijavite se da biste uklonili iz liste želja.');
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/wishlist', {
        data: {
          korisnik_id: user.id,
          kurs_id: course.id,
        },
      });

      setWishlist(wishlist.filter(item => item.kurs_id !== course.id));
      
      const updatedCart = [...cartItems, course];
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      setRecentlyAdded(recentlyAdded.filter(item => item.id !== course.id));
    } catch (error) {
      console.error('Greška prilikom uklanjanja iz liste želja:', error);
    }
  };

  // Funkcija za trenutno uklanjanje iz korpe
  const handleInstantRemoveFromCart = (course) => {
    const updatedCart = cartItems.filter(item => item.id !== course.id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    const updatedCourseDetails = courseDetails.filter(item => item.id !== course.id);
    setCourseDetails(updatedCourseDetails);
  };

  // Funkcija za prikaz modala za uklanjanje
  const handleRemoveFromCart = (course) => {
    setCourseToRemove(course);
    setShowRemoveModal(true);
  };

  // Potvrda uklanjanja iz korpe
  const confirmRemoveFromCart = () => {
    if (courseToRemove) {
      handleInstantRemoveFromCart(courseToRemove);
    }
    setShowRemoveModal(false);
    setCourseToRemove(null);
  };

  // Otkazivanje uklanjanja iz korpe
  const cancelRemoveFromCart = () => {
    setShowRemoveModal(false);
    setCourseToRemove(null);
  };

  // Funkcija za dodavanje nazad u korpu
  const handleAddToCart = (course) => {
    const updatedCart = [...cartItems, course];
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setRecentlyAdded(recentlyAdded.filter(item => item.id !== course.id));
  };

  // Primena popusta
  const applyDiscount = () => {
    const discount = allDiscounts.find(d => d.kod === discountCode);
    
    if (discount) {
      setDiscountInfo({
        id: discount.id,
        percent: discount.procenat
      });
    } else {
      alert('Nevažeći kod za popust.');
      setDiscountInfo({ id: null, percent: 0 });
    }
  };

  return (
    <div className="korpa-container">
      <h2>Vaša korpa</h2>
      
      {/* Prikaz kurseva u korpi */}
      {courseDetails.length > 0 ? (
        <div className="cart-items">
          {courseDetails.map((course, index) => (
            <div className="korpa-item" key={index}>
              <img
                src={course.slika || 'default-image-url'}
                alt={course.naziv}
                className="korpa-course-image"
              />
              <div className="korpa-course-info">
                <h3>{course.naziv}</h3>
                <p className="kurs-instruktor-korpa">
                  <strong>Instruktor: </strong>
                  {instruktori[String(course.instruktor_id)] || 'Nepoznati instruktor'}
                </p>
                <p><strong>Cena:</strong> {course.cena}$</p>
                <p>
                  <strong>Ocena: </strong> 
                  {course.rating ? course.rating.toFixed(1) : '0.0'} / 5
                </p>
                <p><strong>Broj lekcija:</strong> {course.lessonCount}</p>
                <button 
                  onClick={() => handleAddToWishlist(course)} 
                  className="korpa-wishlist-button"
                >
                  Dodaj u listu želja
                </button>
                <button 
                  onClick={() => handleRemoveFromCart(course)} 
                  className="korpa-remove-button"
                >
                  Ukloni iz korpe
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-cart-message">Nema kurseva u korpi.</p>
      )}

      {/* Sažetak korpe */}
      {courseDetails.length > 0 && (
        <div className="cart-summary">
          <div className="discount-section">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Unesite kod za popust"
            />
            <button onClick={applyDiscount}>Primeni Popust</button>
            {discountInfo.percent > 0 && (
              <p className="discount-applied">
                Popust od {discountInfo.percent}% je primenjen.
              </p>
            )}
          </div>

          <div className="total-section">
            <h3>Ukupno:</h3>
            <p>Međuzbir: {subtotal.toFixed(2)}$</p>
            {discountInfo.percent > 0 && (
              <p>Popust: -{discountAmount.toFixed(2)}$</p>
            )}
            <h2>Totalna Cena: {total.toFixed(2)}$</h2>
          </div>

          <button onClick={handlePurchase} className="korpa-purchase-button">
            Završi kupovinu
          </button>
        </div>
      )}

      {/* Nedavno dodati u listu želja */}
      {recentlyAdded.length > 0 && (
        <div className="recently-added-wishlist">
          <h3>Nedavno dodato u listu želja:</h3>
          {recentlyAdded.map((course, index) => (
            <div className="wishlist-item" key={index}>
              <img
                src={course.slika || 'default-image-url'}
                alt={course.naziv}
                className="wishlist-course-image"
              />
              <div className="wishlist-course-info">
                <h3>{course.naziv}</h3>
                <p><strong>Cena:</strong> {course.cena}$</p>
                <p>
                  <strong>Ocena: </strong> 
                  {course.rating ? course.rating.toFixed(1) : '0.0'} / 5
                </p>
                <p><strong>Broj lekcija:</strong> {course.lessonCount}</p>
                <div className="wishlist-buttons">
                  <button 
                    onClick={() => handleRemoveFromWishlist(course)} 
                    className="wishlist-remove-button"
                  >
                    Ukloni iz liste želja
                  </button>
                  <button 
                    onClick={() => handleAddToCart(course)} 
                    className="wishlist-add-to-cart-button"
                  >
                    Dodaj u korpu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal za potvrdu uklanjanja */}
      {showRemoveModal && (
        <div className="remove-modal">
          <div className="remove-modal-content">
            <h4>Da li ste sigurni da želite da uklonite ovaj kurs iz korpe?</h4>
            <div className="modal-buttons">
              <button 
                onClick={confirmRemoveFromCart} 
                className="remove-modal-confirm-button"
              >
                Potvrdi
              </button>
              <button 
                onClick={cancelRemoveFromCart} 
                className="remove-modal-cancel-button"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Korpa;