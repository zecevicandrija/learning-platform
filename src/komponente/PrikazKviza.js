import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../login/auth';

const PrikazKviza = ({ quizData }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const { user } = useAuth(); // Get current user
    const pitanja = quizData || [];

    useEffect(() => {
        if (quizData.length > 0) {
            setSelectedAnswers({});
            setScore(null);
            setSubmitted(false);
        }
    }, [quizData]);

    useEffect(() => {
        if (user?.id && pitanja.length > 0) {
            const fetchQuizResult = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/rezultati_kviza/result', {
                        params: {
                            user_id: user.id,
                            lesson_id: pitanja[0]?.lesson_id,
                            quiz_id: quizData[0]?.id,
                        },
                    });

                    if (response.data && response.data.score !== undefined) {
                        setScore(response.data.score);
                        setSubmitted(true);
                    }
                } catch (error) {
                    console.error('Error fetching quiz result:', error);
                }
            };

            fetchQuizResult();
        }
    }, [user, pitanja, quizData]);

    const handleAnswerChange = (questionId, answer) => {
        setSelectedAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };

    const handleSubmit = async () => {
        let calculatedScore = 0;

        pitanja.forEach((question) => {
            if (selectedAnswers[question.id] === question.correct_answer) {
                calculatedScore += 1;
            }
        });

        setScore(calculatedScore);

        try {
            const response = await axios.post("http://localhost:5000/api/rezultati_kviza/submit", {
                user_id: user.id,
                lesson_id: pitanja[0]?.lesson_id,
                quiz_id: quizData[0]?.id,
                score: calculatedScore,
                total_questions: pitanja.length,
            });

            console.log("Rezultat sačuvan:", response.data);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting quiz result:", error);
        }
    };

    if (pitanja.length === 0) {
        return null;
    }

    if (submitted && score !== null) {
        return (
            <div>
                <div className="quiz-container">
                    {pitanja.map((pitanje, index) => (
                        <div key={index} className="question">
                            <h4>{pitanje.question}</h4>
                            <ul>
                                {pitanje.answers.map((answer, idx) => (
                                    <li key={idx} 
                                        style={{
                                            color: answer === pitanje.correct_answer ? 'green' : 'red',
                                            backgroundColor: selectedAnswers[pitanje.id] === answer ? 'lightblue' : 'transparent',
                                            border: selectedAnswers[pitanje.id] === answer ? '1px solid blue' : 'none',
                                            borderRadius: '4px',
                                            padding: '2px 5px',
                                        }}
                                    >
                                        {answer}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div>
                    <h2>Rezultat kviza</h2>
                    <p>
                        Osvojili ste {score} od {pitanja.length} bodova.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Kviz</h2>
            {pitanja.map((question) => (
                <div key={question.id}>
                    <h3>{question.question}</h3>
                    {question.answers && Array.isArray(question.answers) ? (
                        question.answers.map((answer, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    id={`answer-${question.id}-${index}`}
                                    name={`question-${question.id}`}
                                    value={answer}
                                    onChange={() =>
                                        handleAnswerChange(question.id, answer)
                                    }
                                />
                                <label htmlFor={`answer-${question.id}-${index}`}>
                                    {answer}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p>Nema dostupnih odgovora</p>
                    )}
                </div>
            ))}

            <button onClick={handleSubmit}>Pošalji rezultate</button>
        </div>
    );
};

export default PrikazKviza;
