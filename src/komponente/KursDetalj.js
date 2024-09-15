import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../login/auth.js'; // Import the useAuth hook
import ReactStars from 'react-stars'; // Import the ReactStars component
import './KursDetalj.css';
import Komentari from '../Instruktori/Komentari.js';
import PrikazKviza from './PrikazKviza.js';

const KursDetalj = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the logged-in user from context
    const [kurs, setKurs] = useState(null);
    const [lekcije, setLekcije] = useState([]);
    const [otvorenaLekcija, setOtvorenaLekcija] = useState(null);
    const [wishlisted, setWishlisted] = useState(false);
    const [kupioKurs, setKupioKurs] = useState(false);
    const [rating, setRating] = useState(0); // Use number for rating
    const [currentVideoUrl, setCurrentVideoUrl] = useState(''); // For the video URL of the opened lesson
    const [showVideo, setShowVideo] = useState(false); // State to control video visibility
    const [currentContent, setCurrentContent] = useState(''); // For the content of the opened lesson
    const [completedLessons, setCompletedLessons] = useState(new Set()); // Track completed lessons
    const [quiz, setQuiz] = useState([]);


    useEffect(() => {
        const fetchKurs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/kursevi/${id}`);
                if (response.status === 200) {
                    setKurs(response.data);
                } else {
                    console.error('Failed to fetch course details');
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        const fetchLekcije = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/lekcije/course/${id}`);
                if (response.status === 200) {
                    setLekcije(response.data);
                } else {
                    console.error('Failed to fetch lessons');
                }
            } catch (error) {
                console.error('Error fetching lessons:', error);
            }
        };

        const checkKupovina = async () => {
            if (!user) return; // Ensure user is logged in before checking
            try {
                const response = await axios.get(`http://localhost:5000/api/kupovina/user/${user.id}`);
                if (response.status === 200) {
                    const purchasedCourse = response.data.find((course) => course.id === parseInt(id));
                    setKupioKurs(!!purchasedCourse);
                }
            } catch (error) {
                console.error('Error checking course purchase:', error);
            }
        };

        const fetchRating = async () => {
            if (user && kupioKurs) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/ratings/user/${user.id}/course/${id}`);
                    if (response.status === 200) {
                        setRating(response.data.ocena);
                    } else {
                        console.error('Failed to fetch user rating');
                    }
                } catch (error) {
                    console.error('Error fetching rating:', error);
                }
            }
        };

        const fetchCompletedLessons = async () => {
            if (user) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/kompletirane_lekcije/user/${user.id}/course/${id}`);
                    setCompletedLessons(new Set(response.data.map(lesson => lesson.lekcija_id))); // Store lesson IDs
                } catch (error) {
                    console.error('Error fetching completed lessons:', error);
                }
            }
        };

        fetchKurs();
        fetchLekcije();
        checkKupovina();
        fetchRating();
        fetchCompletedLessons(); // Fetch completed lessons for the logged-in user
    }, [id, user, kupioKurs]);

    const handleCompletionToggle = async (lessonId) => {
        const updatedCompletedLessons = new Set(completedLessons);
        if (completedLessons.has(lessonId)) {
            updatedCompletedLessons.delete(lessonId);
        } else {
            updatedCompletedLessons.add(lessonId);
        }
        setCompletedLessons(updatedCompletedLessons);

        try {
            await axios.post('http://localhost:5000/api/kompletirane_lekcije', {
                korisnik_id: user.id,
                kurs_id: id,
                lekcija_id: lessonId
            });

        } catch (error) {
            console.error('Error updating lesson completion:', error);
        }
    };

    const handleLessonClick = (lekcijaId) => {
        if (!kupioKurs) return;
        const lekcija = lekcije.find(l => l.id === lekcijaId);
        
        if (lekcija) {
            setCurrentVideoUrl(lekcija.video_url);
            setCurrentContent(lekcija.content);
            setShowVideo(true); // Show the video when clicking on the lesson
            fetchQuiz(lekcijaId); // Fetch quiz for the opened lesson
        }
    };

    const fetchQuiz = async (lessonId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/kvizovi/lesson/${lessonId}`);
            console.log('API Response:', response.data);
            
            // Konvertujte string odgovora u niz
            const updatedPitanja = response.data.pitanja.map(pitanje => {
                let parsedAnswers;
                try {
                    parsedAnswers = JSON.parse(pitanje.answers);
                } catch (e) {
                    // Ako dođe do greške prilikom parsiranja, ostavi originalni odgovor
                    parsedAnswers = pitanje.answers;
                }
    
                return {
                    ...pitanje,
                    answers: Array.isArray(parsedAnswers) ? parsedAnswers : [parsedAnswers]
                };
            });
    
            setQuiz(updatedPitanja);
            console.log('Updated Quiz State:', updatedPitanja);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };
    

    
    
    
    
    
    
    
    
    
    const handleWishlistToggle = async () => {
        if (!user) return; // Ensure user is logged in before toggling wishlist
        try {
            if (wishlisted) {
                await axios.delete('http://localhost:5000/api/wishlist', {
                    data: { korisnik_id: user.id, kurs_id: id }
                });
                setWishlisted(false);
            } else {
                await axios.post('http://localhost:5000/api/wishlist', {
                    korisnik_id: user.id,
                    kurs_id: id
                });
                setWishlisted(true);
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handlePurchase = () => {
        if (!user) return; // Ensure user is logged in
        navigate('/korpa', { state: { selectedCourse: kurs } });
      };
      

    const handleRatingSubmit = async () => {
        if (!user || !kupioKurs || rating === 0) return;
        try {
            await axios.post('http://localhost:5000/api/ratings', {
                korisnik_id: user.id,
                kurs_id: id,
                ocena: rating
            });
            alert('Rating submitted successfully');
        } catch (error) {
            console.error('Error submitting rating:', error.response ? error.response.data : error.message);
            alert('Failed to submit rating');
        }
    };

    if (!kurs) return <p>Loading...</p>;

    // Group lessons by section
    const groupedLessons = lekcije.reduce((acc, lekcija) => {
        (acc[lekcija.section] = acc[lekcija.section] || []).push(lekcija);
        return acc;
    }, {});

    const handleAddToCart = () => {
        // Uzimanje trenutne korpe iz localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    
        // Provera da li kurs već postoji u korpi
        const courseExists = existingCart.find((item) => item.kurs_id === kurs.kurs_id);
        
        if (!courseExists) {
          // Dodaj novi kurs u korpu
          const updatedCart = [...existingCart, kurs];
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('cart-updated'));
        // Preusmeri na stranicu sa korpom
        navigate('/korpa');
      };

    return (
        <div className='kurs-detalj-wrapper'>
            <div className="kurs-detalj-container">
                <div className="left-section">
                {showVideo && kupioKurs && (
    <div className="videocontainer-kurs">
        <video src={currentVideoUrl} controls />
        {currentContent && (
            <div className="lekcija-content">
                <p>{currentContent}</p>
            </div>
        )}
        <PrikazKviza quizData={quiz} />
    </div>
)}

                </div>

                <div className="right-section">
                    <div className="kurs-info">
                        <h2 className="kurs-title">{kurs.naziv}</h2>
                        <p className="kurs-opis">{kurs.opis}</p>
                        <p><strong>Instruktor:</strong> {kurs.instruktor_id}</p>
                        <p><strong>Datum Kreiranja:</strong> {new Date(kurs.created_at).toLocaleDateString()}</p>

                        {user && (
                            <button 
                                className={`wishlist-button ${wishlisted ? 'wishlisted' : ''}`}
                                onClick={handleWishlistToggle}
                            >
                                {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            </button>
                        )}

                        {!kupioKurs && user && (
                             <button onClick={handleAddToCart} className='purchase-button'>
                             Dodaj u korpu
                           </button>
                        )}

                        {kupioKurs && (
                            <div className="rating-section">
                                <h3>Ocenite ovaj kurs</h3>
                                <ReactStars
                                    count={5}
                                    value={rating}
                                    onChange={setRating}
                                    size={24}
                                    activeColor="#ffd700"
                                    half={false} // Onemogući ocenjivanje polu-zvezdicama
                                />
                                <button 
                                    className="submit-rating-button" 
                                    onClick={handleRatingSubmit}
                                    disabled={rating === 0}
                                >
                                    Submit Rating
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lekcije-container">
                        <h3>Lekcije</h3>
                        {Object.keys(groupedLessons).map((section) => (
                            <div key={section} className="lekcije-section">
                                <h4 className="section-title"><b>{section}</b></h4>
                                <ul className="lekcije-lista">
                                    {groupedLessons[section].map((lekcija) => (
                                        <li key={lekcija.id} className="lekcija-item">
                                            <div 
                                                className="lekcija-title" 
                                                onClick={() => handleLessonClick(lekcija.id)}
                                            >
                                                {lekcija.title}
                                            </div>
                                            {kupioKurs && (
                                                <input 
                                                    type="checkbox" 
                                                    checked={completedLessons.has(lekcija.id)}
                                                    onChange={() => handleCompletionToggle(lekcija.id)}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {kupioKurs && (
                <div className="komentari-container">
                    <Komentari kursId={id} kupioKurs={kupioKurs} />
                </div>
            )}
        </div>
    );
};

export default KursDetalj;
