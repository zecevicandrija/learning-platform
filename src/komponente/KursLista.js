import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './KursLista.css';
import ReactStars from 'react-stars'; // Import the ReactStars component

const KursLista = () => {
    const [kursevi, setKursevi] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc', 'popularity'
    const [ratings, setRatings] = useState({});
    const [popularity, setPopularity] = useState({});
    const [instruktori, setInstruktori] = useState({});

    const fetchKursevi = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/kursevi');
            if (response.ok) {
                const data = await response.json();
                setKursevi(data);
            } else {
                console.error('Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAverageRating = async (kursId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/ratings/average/${kursId}`);
            if (response.ok) {
                const data = await response.json();
                return data.averageRating;
            } else {
                console.error('Failed to fetch average rating');
                return null; // Return null instead of 0 for missing ratings
            }
        } catch (error) {
            console.error('Error fetching average rating:', error);
            return null;
        }
    };

    const fetchPopularity = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/kupovina/popularity');
            if (response.ok) {
                const data = await response.json();
                const popularityMap = {};
                data.forEach(item => {
                    popularityMap[item.kurs_id] = item.broj_kupovina;
                });
                setPopularity(popularityMap);
            } else {
                console.error('Failed to fetch popularity');
            }
        } catch (error) {
            console.error('Error fetching popularity:', error);
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
            await fetchKursevi();
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchRatingsAndPopularity = async () => {
            const newRatings = {};
            await fetchPopularity();
            for (const kurs of kursevi) {
                const avgRating = await fetchAverageRating(kurs.id);
                newRatings[kurs.id] = avgRating;
            }
            setRatings(newRatings);
        };

        fetchRatingsAndPopularity();
    }, [kursevi]);

    const filteredKursevi = kursevi
        .filter(kurs => {
            const rating = ratings[kurs.id];
            return kurs.naziv.toLowerCase().includes(searchQuery.toLowerCase()) && rating !== null;
        })
        .sort((a, b) => {
            const ratingA = ratings[a.id] || 0;
            const ratingB = ratings[b.id] || 0;
            const popularityA = popularity[a.id] || 0;
            const popularityB = popularity[b.id] || 0;

            if (sortOrder === 'desc') {
                return ratingB - ratingA;
            } else if (sortOrder === 'asc') {
                return ratingA - ratingB;
            } else if (sortOrder === 'popularity') {
                return popularityB - popularityA;
            }
            return 0;
        });

    return (
        <div className="kurs-container">
            <h2 className="title">Lista Kurseva</h2>
            <input 
                type="text" 
                className="search-input" 
                placeholder="Pretraži kurseve..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="filter-buttons">
                <button onClick={() => setSortOrder('desc')}>
                    Ocena ↿⇂
                </button>
                <button onClick={() => setSortOrder('asc')}>
                Ocena ⇃↾
                </button>
                <button onClick={() => setSortOrder('popularity')}>
                    Popularnost ↿⇂
                </button>
                <button onClick={() => setSortOrder('none')}>
                <i class="ri-close-large-line"></i>
                </button>
            </div>
            <div className="kurs-lista">
                {filteredKursevi.map(kurs => (
                    <Link to={`/kurs/${kurs.id}`} className="kurs-card" key={kurs.id}>
                        {kurs.slika && (
                            <img src={kurs.slika} alt={kurs.naziv} className="kurs-slika" />
                        )}
                        <p className="kurs-naziv">{kurs.naziv}</p>
                        {/* <p className="kurs-opis">{kurs.opis}</p> */}
                        <p className="kurs-cena">${kurs.cena}</p>
                        <p className="kurs-instruktor">{instruktori[String(kurs.instruktor_id)] || 'Nepoznati'}</p>
                        <p className="kurs-datum">{new Date(kurs.created_at).toLocaleDateString()}</p>
                        <div className="kurs-rating">
    <span className="average-rating">{(ratings[kurs.id] || 0).toFixed(1)}</span>
    <ReactStars
        count={5}
        value={ratings[kurs.id] || 0}
        size={24}
        color2="#ffd700"
        edit={false} // Disable editing of stars
    />
</div>
<p className="kurs-popularity">Studenti: {popularity[kurs.id] ? popularity[kurs.id] : 'N/A'}</p>


                    </Link>
                ))}
            </div>
        </div>
    );
};

export default KursLista;
