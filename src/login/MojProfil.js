import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useNavigate } from 'react-router-dom';
import './MojProfil.css';

const MojProfil = () => {
  const { user, updateUser, logout } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ime: e.target.ime.value,
        prezime: e.target.prezime.value,
        email: e.target.email.value,
        telefon: e.target.telefon.value,
        adresa: e.target.adresa.value,
        uloga: user.uloga
      };
      await updateUser(updatedUser);
      alert("Profil uspešno ažuriran");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Došlo je do greške prilikom ažuriranja profila");
    }
  };

  const handleCourseClick = (kursId) => {
    navigate(`/kurs/${kursId}`);
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

  const handleLogout = () => {
    setShowModal(true);
  };

  const confirmLogout = () => {
    setShowModal(false);
    logout();
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  if (!user) {
    return <p>Molimo vas da se ulogujete da biste videli vaš profil.</p>;
  }

  return (
    <div className="profil-container">
      <h2 className="profil-header">Moj Profil</h2>
      <form onSubmit={handleSubmit} className="profil-form">
        <div className="profil-form-group">
          <label htmlFor="ime">Ime</label>
          <input
            id="ime"
            type="text"
            defaultValue={user.ime}
            required
          />
        </div>
        <div className="profil-form-group">
          <label htmlFor="prezime">Prezime</label>
          <input
            id="prezime"
            type="text"
            defaultValue={user.prezime}
            required
          />
        </div>
        <div className="profil-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            defaultValue={user.email}
            required
          />
        </div>
        <div className="profil-form-group">
          <label htmlFor="telefon">Telefon</label>
          <input
            id="telefon"
            type="text"
            defaultValue={user.telefon}
            required
          />
        </div>
        <div className="profil-form-group">
          <label htmlFor="adresa">Adresa</label>
          <input
            id="adresa"
            type="text"
            defaultValue={user.adresa}
            required
          />
        </div>
        <div className="profil-form-group">
          <label htmlFor="uloga">Uloga</label>
          <input
            id="uloga"
            type="text"
            defaultValue={user.uloga}
            readOnly
          />
        </div>
        <button type="submit" className="profil-submit-btn">
          Ažuriraj Profil
        </button>
      </form>
      <h2 className="profil-wishlist-header">Moja Wishlist</h2>
      <ul className="profil-wishlist">
        {wishlist.map(item => (
          <li 
            key={item.kurs_id}
            className="profil-wishlist-item"
            onClick={() => handleCourseClick(item.kurs_id)}
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
      <button onClick={handleLogout} className="profil-logout-btn">Logout</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Potvrda</h3>
            <p>Da li ste sigurni da želite da se izlogujete?</p>
            <button onClick={confirmLogout} className="modal-confirm-btn">Da</button>
            <button onClick={cancelLogout} className="modal-cancel-btn">Ne</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MojProfil;
