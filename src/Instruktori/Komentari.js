import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../login/auth.js';
import './Komentari.css';

const Komentari = ({ kursId, kupioKurs }) => {
  const { user } = useAuth();
  const [komentari, setKomentari] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Fetch comments for the course
  useEffect(() => {
    const fetchKomentari = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/komentari/kurs/${kursId}`);
        setKomentari(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchKomentari();
  }, [kursId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/komentari', {
        korisnik_id: user.id,
        kurs_id: kursId,
        komentar: newComment,
        rating: user.rating // If rating is part of user data
      });

      // Add new comment to the state immediately
      const newCommentData = {
        korisnik_id: user.id,
        kurs_id: kursId,
        komentar: newComment,
        rating: user.rating,
        created_at: new Date().toISOString() // Set the current date as 'created_at'
      };
      setKomentari(prevKomentari => [...prevKomentari, newCommentData]);
      setNewComment('');
      setError('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    }
  };

  return (
    <div className="komentari-container">
      <h3 className="komentari-title">Komentari</h3>

      {/* Display comment form only if the user has purchased the course */}
      {user && kupioKurs && (
        <form onSubmit={handleSubmit} className="komentari-form">
          <textarea
            className="komentari-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ostavite vaš komentar"
          />
          {error && <p className="komentari-error">{error}</p>}
          <button type="submit" className="komentari-submit">Postavi komentar</button>
        </form>
      )}

      {/* List of comments visible to everyone */}
      <div className="komentari-list">
        {komentari.map((komentar) => (
          <div key={komentar.id} className="komentari-item">
            <strong className="komentari-user">{komentar.ime} {komentar.prezime}</strong>
            <p className="komentari-rating">{komentar.rating ? `Rating: ${komentar.rating}` : ''}</p>
            <p className="komentari-comment">{komentar.komentar}</p>
            <span className="komentari-date">
              {new Date(komentar.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Komentari;
