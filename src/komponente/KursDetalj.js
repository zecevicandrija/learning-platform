import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../login/auth.js';
import ReactStars from 'react-stars';
import './KursDetalj.css';
import Komentari from '../Instruktori/Komentari.js';
import PrikazKviza from './PrikazKviza.js';
import Editor from '@monaco-editor/react';

const KursDetalj = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [kurs, setKurs] = useState(null);
    const [lekcije, setLekcije] = useState([]);
    const [otvorenaLekcija, setOtvorenaLekcija] = useState(null);
    const [wishlisted, setWishlisted] = useState(false);
    const [kupioKurs, setKupioKurs] = useState(false);
    const [rating, setRating] = useState(0);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [showVideo, setShowVideo] = useState(false);
    const [currentContent, setCurrentContent] = useState('');
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [quiz, setQuiz] = useState([]);
    const [code, setCode] = useState('// Unesite svoj kod ovde');
    const [language, setLanguage] = useState('javascript');
    const [showEditor, setShowEditor] = useState(false);
    const [savedCodes, setSavedCodes] = useState({});
    const [reviewFeedback, setReviewFeedback] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch course details
                const kursResponse = await axios.get(`http://localhost:5000/api/kursevi/${id}`);
                setKurs(kursResponse.data);

                // Fetch lessons
                const lekcijeResponse = await axios.get(`http://localhost:5000/api/lekcije/course/${id}`);
                setLekcije(lekcijeResponse.data);

                // Check if user purchased the course
                if (user) {
                    const kupovinaResponse = await axios.get(`http://localhost:5000/api/kupovina/user/${user.id}`);
                    const purchasedCourse = kupovinaResponse.data.find(course => course.id === parseInt(id));
                    setKupioKurs(!!purchasedCourse);

                    // Fetch user rating
                    if (purchasedCourse) {
                        try {
                            const ratingResponse = await axios.get(
                                `http://localhost:5000/api/ratings/user/${user.id}/course/${id}`
                            );
                            setRating(ratingResponse.data.ocena || 0);
                        } catch (error) {
                            console.error('Error fetching rating:', error);
                        }
                    }

                    // Fetch completed lessons
                    const completedResponse = await axios.get(
                        `http://localhost:5000/api/kompletirane_lekcije/user/${user.id}/course/${id}`
                    );
                    setCompletedLessons(new Set(completedResponse.data.map(lesson => lesson.lekcija_id)));

                    // Check wishlist status
                    const wishlistResponse = await axios.get(
                        `http://localhost:5000/api/wishlist/check?korisnik_id=${user.id}&kurs_id=${id}`
                    );
                    setWishlisted(wishlistResponse.data.exists);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id, user]);

    const handleCompletionToggle = async (lessonId) => {
        if (!user) return;

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
                lekcija_id: lessonId,
                completed: updatedCompletedLessons.has(lessonId)
            });
        } catch (error) {
            console.error('Error updating lesson completion:', error);
        }
    };

    const determineLanguage = () => {
        if (!kurs?.o_cemu) {
            return 'javascript'; // Default fallback
        }

        // Map course topics to editor languages
        const topic = kurs.o_cemu.toLowerCase();
        if (topic.includes('javascript') || topic.includes('js') || topic.includes('react')) {
            return 'javascript';
        } else if (topic.includes('html')) {
            return 'html';
        } else if (topic.includes('css')) {
            return 'css';
        } else if (topic.includes('python')) {
            return 'python';
        } else if (topic.includes('java')) {
            return 'java';
        }
        
        return 'javascript'; // default
    };
console.log(determineLanguage)
    const getDefaultCode = (lang) => {
    switch (lang) {
        case 'html':
            return `<!DOCTYPE html>\n<html>\n<head>\n  <title>${kurs.o_cemu}</title>\n</head>\n<body>\n\n</body>\n</html>`;
        case 'css':
            return `/* ${kurs.o_cemu} CSS */\nbody {\n  margin: 0;\n  padding: 0;\n}`;
        case 'python':
            return `# ${kurs.o_cemu} Python code`;
        case 'java':
            return `public class Main {\n    public static void main(String[] args) {\n        // ${kurs.o_cemu} Java code\n    }\n}`;
        default:
            return `//Ovde napisi svoj ${kurs.o_cemu}  code`;
    }
};
    const handleLessonClick = async (lekcijaId) => {
        if (!kupioKurs) return;

        const lekcija = lekcije.find(l => l.id === lekcijaId);
        if (!lekcija) return;

        setOtvorenaLekcija(lekcija);
        setCurrentVideoUrl(lekcija.video_url);
        setCurrentContent(lekcija.content);
        setShowVideo(true);

        // Fetch quiz for the lesson
        await fetchQuiz(lekcijaId);

        // Check for assignment and setup editor
        if (lekcija.assignment) {
            setShowEditor(true);
            const detectedLanguage = determineLanguage();
            setLanguage(detectedLanguage);

            // Load saved code if exists
            if (savedCodes[lekcijaId]) {
                setCode(savedCodes[lekcijaId]);
            } else {
                setCode(getDefaultCode(detectedLanguage));
            }
        } else {
            setShowEditor(false);
        }
    };

    const fetchQuiz = async (lessonId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/kvizovi/lesson/${lessonId}`);
            const updatedPitanja = response.data.pitanja.map(pitanje => {
                let parsedAnswers;
                try {
                    parsedAnswers = JSON.parse(pitanje.answers);
                } catch (e) {
                    parsedAnswers = pitanje.answers;
                }
                return {
                    ...pitanje,
                    answers: Array.isArray(parsedAnswers) ? parsedAnswers : [parsedAnswers]
                };
            });
            setQuiz(updatedPitanja);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };

    const handleSaveCode = async () => {
        if (!otvorenaLekcija?.id || !user) return;

        try {
            await axios.post('http://localhost:5000/api/sacuvani_kodovi', {
                user_id: user.id,
                lesson_id: otvorenaLekcija.id,
                code: code,
                language: language
            });

            setSavedCodes({
                ...savedCodes,
                [otvorenaLekcija.id]: code
            });

            alert('Kod je uspešno sačuvan!');
        } catch (error) {
            console.error('Error saving code:', error);
            alert('Došlo je do greške pri čuvanju koda');
        }
    };

    const handleWishlistToggle = async () => {
        if (!user) return;

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

    const handleAddToCart = () => {
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const courseExists = existingCart.find(item => item.id === kurs.id);

        if (!courseExists) {
            const updatedCart = [...existingCart, kurs];
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            window.dispatchEvent(new Event('cart-updated'));
        }
        navigate('/korpa');
    };

    const handleRatingSubmit = async () => {
        if (!user || !kupioKurs || rating === 0) return;

        try {
            await axios.post('http://localhost:5000/api/ratings', {
                korisnik_id: user.id,
                kurs_id: id,
                ocena: rating
            });
            alert('Uspešno ste ocenili kurs!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Došlo je do greške pri ocenjivanju');
        }
    };

    const handleReviewCode = async () => {
        if (!otvorenaLekcija?.assignment || !code) {
            setReviewFeedback({ message: 'Nema zadatka ili koda za proveru', isError: true });
            return;
        }

        try {
            setReviewFeedback({ message: 'Proveravam kod...', isError: false });

            const resp = await axios.post('http://localhost:5000/api/lekcije/deepseek-review', {
                code,
                language: determineLanguage(),
                assignment: otvorenaLekcija.assignment,
                courseTopic: kurs.o_cemu
                
            });

            if (resp.data.success) {
                setReviewFeedback({
                    message: resp.data.message,
                    isError: false
                });
            } else {
                setReviewFeedback({
                    message: resp.data.error || 'AI nije vratio validan odgovor.',
                    isError: true
                });
            }
        } catch (error) {
            console.error('Greška pri proveri koda:', error);
            setReviewFeedback({
                message: `Došlo je do greške: ${error.response?.data?.error || error.message}`,
                isError: true
            });
        }
    };

    const handlePomoc = async () => {
        if (!otvorenaLekcija?.assignment) {
            setReviewFeedback({ message: 'Nema zadatka za koji možete tražiti pomoć', isError: true });
            return;
        }

        try {
            setReviewFeedback({ message: 'Tražim pomoć od AI asistenta...', isError: false });

            const resp = await axios.post('http://localhost:5000/api/lekcije/ai-pomoc', {
                assignment: otvorenaLekcija.assignment,
                language,
                currentCode: code,
                courseTopic: kurs.o_cemu
            });

            if (resp.data.success) {
                setReviewFeedback({
                    message: resp.data.message,
                    isError: false
                });
            } else {
                setReviewFeedback({
                    message: resp.data.error || 'AI nije mogao da pruži pomoć.',
                    isError: true
                });
            }
        } catch (error) {
            console.error('Greška pri traženju pomoći:', error);
            setReviewFeedback({
                message: `Došlo je do greške: ${error.response?.data?.error || error.message}`,
                isError: true
            });
        }
    };

    if (!kurs) return <div className="loading">Učitavanje...</div>;

    // Group lessons by section
    const groupedLessons = lekcije.reduce((acc, lekcija) => {
        (acc[lekcija.section] = acc[lekcija.section] || []).push(lekcija);
        return acc;
    }, {});
    
    return (
        <div className='kurs-detalj-wrapper'>
            <div className="kurs-detalj-container">
                <div className="left-section">
                    {showVideo && kupioKurs && (
                        <div className="videocontainer-kurs">
                            {currentVideoUrl && (
                                <video src={currentVideoUrl} controls className="lesson-video" />
                            )}

                            {currentContent && (
                                <div className="lekcija-content">
                                    <h3>Sadržaj lekcije:</h3>
                                    <p>{currentContent}</p>
                                </div>
                            )}
                            {otvorenaLekcija?.id === otvorenaLekcija.id &&
                                otvorenaLekcija.assignment &&
                                kupioKurs && (
                                    <div className="assignment-toggle-wrapper">
                                        {!showEditor ? (
                                            <button
                                                className="show-assignment-button"
                                                onClick={() => setShowEditor(true)}
                                            >
                                                Prikaži zadatak
                                            </button>
                                        ) : (
                                            <button
                                                className="hide-assignment-button"
                                                onClick={() => setShowEditor(false)}
                                            >
                                                Sakrij zadatak
                                            </button>
                                        )}
                                    </div>
                                )}

                            {otvorenaLekcija?.assignment && (
                                <div className="assignment-section">
                                    {showEditor && (
                                        <div>
                                            <h3>Zadatak:</h3>
                                            <div className="assignment-text">{otvorenaLekcija.assignment}</div>
                                            <div className="code-editor-container">
                                                <h4>Kod Editor ({kurs.o_cemu}):</h4>
                                                <Editor
                                                    height="400px"
                                                    language={language}
                                                    theme="vs-light"
                                                    value={code}
                                                    onChange={setCode}
                                                    options={{
                                                        minimap: { enabled: false },
                                                        scrollBeyondLastLine: false,
                                                        fontSize: 14,
                                                        wordWrap: 'on',
                                                        automaticLayout: true
                                                    }}
                                                />
                                                {reviewFeedback && (
                                                    <div className={`ai-feedback-box ${reviewFeedback.isError ? 'error' : ''}`}>
                                                        <h4>AI Povratna Informacija:</h4>
                                                        <div className="assignment-prompt">
                                                            <strong>Zadatak:</strong>
                                                            <p>{otvorenaLekcija.assignment}</p>
                                                        </div>
                                                        <pre className="ai-response">{reviewFeedback.message}</pre>
                                                    </div>
                                                )}
                                                <div className="editor-actions">
                                                    <button
                                                        className="save-code-button"
                                                        onClick={handleSaveCode}
                                                    >
                                                        Sačuvaj Kod
                                                    </button>
                                                    <button
                                                        className="save-code-button"
                                                        onClick={handlePomoc}
                                                    >
                                                        Pomoc
                                                    </button>
                                                    <button
                                                        className="save-code-button"
                                                        onClick={handleReviewCode}
                                                    >
                                                        Proveri Kod
                                                    </button>
                                                    <button
                                                        className="run-code-button"
                                                        onClick={() => alert('Funkcionalnost izvršavanja koda će biti implementirana')}
                                                    >
                                                        Pokreni Kod
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                        <p className="kurs-meta"><strong>Instruktor:</strong> {kurs.instruktor_ime}</p>
                        <p className="kurs-meta"><strong>Datum Kreiranja:</strong> {new Date(kurs.created_at).toLocaleDateString()}</p>
                        <p className="kurs-meta"><strong>Cena:</strong> {kurs.cena} RSD</p>

                        {user && (
                            <button
                                className={`wishlist-button ${wishlisted ? 'active' : ''}`}
                                onClick={handleWishlistToggle}
                            >
                                {wishlisted ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
                            </button>
                        )}

                        {!kupioKurs && user && (
                            <button onClick={handleAddToCart} className='purchase-button'>
                                Dodaj u korpu - {kurs.cena} RSD
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
                                    color2={'#ffd700'}
                                    half={false}
                                />
                                <button
                                    className="submit-rating-button"
                                    onClick={handleRatingSubmit}
                                    disabled={rating === 0}
                                >
                                    Pošalji ocenu
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lekcije-container">
                        <h3>Lekcije</h3>
                        {Object.keys(groupedLessons).map((section) => (
                            <div key={section} className="lekcije-section">
                                <h4 className="section-title">{section}</h4>
                                <ul className="lekcije-lista">
                                    {groupedLessons[section].map((lekcija) => (
                                        <li
                                            key={lekcija.id}
                                            className={`lekcija-item ${otvorenaLekcija?.id === lekcija.id ? 'active' : ''}`}
                                        >
                                            <div
                                                className="lekcija-title"
                                                onClick={() => handleLessonClick(lekcija.id)}
                                            >
                                                {lekcija.title}
                                                {lekcija.assignment && (
                                                    <span className="assignment-badge">Zadatak</span>
                                                )}
                                            </div>
                                            {kupioKurs && (
                                                <label className="completion-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={completedLessons.has(lekcija.id)}
                                                        onChange={() => handleCompletionToggle(lekcija.id)}
                                                    />
                                                    <span>Završeno</span>
                                                </label>
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