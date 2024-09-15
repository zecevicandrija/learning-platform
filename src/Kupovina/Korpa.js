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
  const { user } = useAuth(); // Get user from AuthContext
  const [total, setTotal] = useState(0);
  const [discountCode, setDiscountCode] = useState(''); // State for discount code
  const [discountApplied, setDiscountApplied] = useState(0); // State for discount percentage
  const [instruktori, setInstruktori] = useState({});

 

  useEffect(() => {
    const fetchCartItems = async () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(storedCart);

      // Fetch course details after setting cartItems
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

      // Calculate total price
      const totalPrice = details.reduce((acc, course) => acc + (course.cena || 0), 0);
      setTotal(totalPrice); // Update total state
    };

    fetchCartItems();
  }, []); // Empty dependency list to run only once

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${user.id}`);
        setWishlist(wishlistResponse.data);
      }
    };

    fetchWishlist();
  }, [user]); // Fetch wishlist when user changes

  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to complete the purchase.');
      return;
    }

    try {
      for (const course of cartItems) {
        const kursId = course.id;
        const korisnikId = user.id; // Use logged-in user's ID

        if (!kursId || !korisnikId) {
          console.error('Missing kurs_id or korisnik_id for course:', course);
          continue;
        }

        await axios.post('http://localhost:5000/api/kupovina', {
          korisnik_id: korisnikId,
          kurs_id: kursId,
          popust: discountApplied,
        });
      }
      localStorage.removeItem('cart');
      setCartItems([]);
      setTotal(total);
      navigate('/kupljenkurs');
    } catch (error) {
      console.error('Greška prilikom finalizacije kupovine:', error);
    }
  };

  const handleAddToWishlist = async (course) => {
    if (!user) {
      alert('Please log in to add to wishlist.');
      return;
    }

    const korisnikId = user.id;

    try {
      await axios.post('http://localhost:5000/api/wishlist', {
        korisnik_id: korisnikId,
        kurs_id: course.id,
      });

      // Add course to recently added wishlist
      setRecentlyAdded([course, ...recentlyAdded]);

      // Remove course from cart
      handleInstantRemoveFromCart(course); // Call handleRemoveFromCart directly

      // Fetch wishlist to update the state
      const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${korisnikId}`);
      setWishlist(wishlistResponse.data);
    } catch (error) {
      console.error('Error adding course to wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (course) => {
    if (!user) {
      alert('Please log in to remove from wishlist.');
      return;
    }

    const korisnikId = user.id;

    try {
      await axios.delete('http://localhost:5000/api/wishlist', {
        data: {
          korisnik_id: korisnikId,
          kurs_id: course.id,
        },
      });

      // Remove course from wishlist
      setWishlist(wishlist.filter(item => item.kurs_id !== course.id));

      // Add course back to cart
      const updatedCart = [...cartItems, course];
      setCartItems(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      setRecentlyAdded(recentlyAdded.filter(item => item.id !== course.id));
    } catch (error) {
      console.error('Error removing course from wishlist:', error);
    }
  };

  const handleInstantRemoveFromCart = (course) => {
    const updatedCart = cartItems.filter(item => item.id !== course.id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Opcionalno: Ažurirajte courseDetails ako je potrebno
    const updatedCourseDetails = courseDetails.filter(item => item.id !== course.id);
    setCourseDetails(updatedCourseDetails);
  };

  const handleRemoveFromCart = (course) => {
    setCourseToRemove(course);
    setShowRemoveModal(true);
  };

  const confirmRemoveFromCart = () => {
    setShowRemoveModal(false);

    const updatedCart = cartItems.filter(item => item.id !== courseToRemove.id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Opcionalno: Ažurirajte courseDetails ako je potrebno
    const updatedCourseDetails = courseDetails.filter(item => item.id !== courseToRemove.id);
    setCourseDetails(updatedCourseDetails);
    setCourseToRemove(null);
  };

  const cancelRemoveFromCart = () => {
    setShowRemoveModal(false);
    setCourseToRemove(null);
  };

  const handleAddToCart = async (course) => {
    // Add course to cart
    const updatedCart = [...cartItems, course];
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Remove from recently added wishlist
    setRecentlyAdded(recentlyAdded.filter(item => item.id !== course.id));

    // Optionally, fetch updated course details to ensure UI is up-to-date
    try {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
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
    } catch (error) {
      console.error('Error updating cart details:', error);
    }
  };

  const handleDiscountApplied = (newTotal) => {
    setTotal(newTotal);
  };
  

  // Handle applying discount
  const applyDiscount = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/popusti/validate', { code: discountCode });
      if (response.data.valid) {
        const discountPercent = response.data.discountPercent;
        setDiscountApplied(discountPercent);
  
        // Calculate new total price
        const discountAmount = (total * discountPercent) / 100;
        const newTotal = total - discountAmount;
        console.log(`Applying discount: ${discountPercent}%`);
        console.log(`Old Total: ${total}, Discount Amount: ${discountAmount}, New Total: ${newTotal}`);
        handleDiscountApplied(newTotal);
      } else {
        alert('Invalid discount code.');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const fetchCartItems = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/cart'); // Adjust the endpoint if necessary
        if (response.ok) {
            const data = await response.json();
            setCartItems(data);
        } else {
            console.error('Failed to fetch cart items');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  const fetchInstruktori = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/korisnici');
        if (response.ok) {
            const data = await response.json();
            const instructors = {};
            data.forEach(user => {
                if (user.uloga === 'instruktor' || user.uloga === 'admin') {
                    instructors[String(user.id)] = user.ime;
                }
            });
            setInstruktori(instructors);
        } else {
            console.error('Failed to fetch instructors');
        }
    } catch (error) {
        console.error('Error fetching instructors:', error);
    }
};

useEffect(() => {
    const fetchData = async () => {
        await fetchInstruktori();
        await fetchCartItems();
    };
    fetchData();
}, []);

  

  return (
    <div className="korpa-container">
      <h2>Vaša korpa</h2>
      {courseDetails.length > 0 ? (
        courseDetails.map((course, index) => (
          <div className="korpa-item" key={index}>
            <img
              src={course.slika || 'default-image-url'}
              alt={course.naziv}
              className="korpa-course-image"
            />
            <div className="korpa-course-info">
              <h3>{course.naziv}</h3>
              <p className="kurs-instruktor-korpa"><strong>Instruktor: </strong>{instruktori[String(course.instruktor_id)] || 'Nepoznati'}</p>
              <p><strong>Cena:</strong> {course.cena}$</p>
              <p>
                <strong>Rating: </strong> 
                {course.rating ? course.rating.toFixed(1) : '0.0'} / 5
              </p>
              <p><strong>Broj lekcija:</strong> {course.lessonCount}</p>
              <button onClick={() => handleAddToWishlist(course)} className="korpa-wishlist-button">
                Dodaj u listu želja
              </button>
              <button onClick={() => handleRemoveFromCart(course)} className="korpa-remove-button">
                Ukloni iz korpe
              </button>
            </div>
            <div>
            <h2>Totalna Cena: {total.toFixed(2)}$</h2>
            <div className="discount-section">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Unesite kod za popust"
              />
              <button onClick={applyDiscount}>Primeni Popust</button>
              {discountApplied > 0 && <p>Popust od {discountApplied}% je primenjen.</p>}
            </div>
    </div>
          </div>
        ))
      ) : (
        <p>Nema kurseva u korpi.</p>
      )}
      {courseDetails.length > 0 && (
        <button onClick={handlePurchase} className="korpa-purchase-button">
          Kupi
        </button>
      )}

      {/* Recently Added to Wishlist Section */}
      {recentlyAdded.length > 0 && (
        <div className="recently-added-wishlist">
          <h3>Nedavno dodato u listu želja:</h3>
          {recentlyAdded.map((course, index) => (
            <div className="wishlist-item" key={index}>
              <img
              src={course.slika || 'default-image-url'}
              alt={course.naziv}
              className="korpa-course-image"
            />
              <div className="wishlist-course-info">
                <h3>{course.naziv}</h3>
                <p><strong>Cena:</strong> {course.cena}$</p>
                <p>
                <strong>Rating: </strong> 
                {course.rating ? course.rating.toFixed(1) : '0.0'} / 5
              </p>
              <p><strong>Broj lekcija:</strong> {course.lessonCount}</p>
                <button onClick={() => handleRemoveFromWishlist(course)} className="wishlist-remove-button">
                  Ukloni iz liste želja
                </button>
                <button onClick={() => handleAddToCart(course)} className="wishlist-add-to-cart-button">
                  Dodaj u korpu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="remove-modal">
          <div className="remove-modal-content">
            <h4>Da li ste sigurni da želite da uklonite ovaj kurs iz korpe?</h4>
            <button onClick={confirmRemoveFromCart} className="remove-modal-confirm-button">
              Potvrdi
            </button>
            <button onClick={cancelRemoveFromCart} className="remove-modal-cancel-button">
              Odustani
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Korpa;
