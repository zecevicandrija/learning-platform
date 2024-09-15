import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Kviz.css';
import { useAuth } from '../login/auth';

const Kviz = () => {
    const { user } = useAuth();  // Pretpostavka: useAuth daje trenutnog korisnika
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');

    // Fetch courses when component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/kursevi/instruktor/${user.id}`);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        if (user) {
            fetchCourses();
        }
    }, [user]);

    // Fetch lessons when a course is selected
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/lekcije/course/${selectedCourse}`);
                setLessons(response.data);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            }
        };

        if (selectedCourse) {
            fetchLessons();
        }
    }, [selectedCourse]);

    const handleAddAnswer = () => {
        if (newAnswer.trim()) {
            setAnswers([...answers, newAnswer]);
            setNewAnswer('');
        }
    };

    const handleAddQuestion = () => {
        if (question.trim() && correctAnswer.trim()) {
            setQuestions([
                ...questions,
                { question, answers, correctAnswer }
            ]);
            // Reset question inputs
            setQuestion('');
            setAnswers([]);
            setCorrectAnswer('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            for (const q of questions) {
                await axios.post('http://localhost:5000/api/kvizovi', {
                    lesson_id: selectedLesson,
                    question: q.question,
                    answers: q.answers,
                    correct_answer: q.correctAnswer
                });
            }
            alert('Quiz added successfully');
            // Reset form
            setSelectedCourse('');
            setSelectedLesson('');
            setQuestions([]);
        } catch (error) {
            console.error('Error adding quiz:', error.response?.data || error);
            alert('Error adding quiz');
        }
    };
    

    return (
        <div className="kviz-container">
            <h2 className="kviz-naslov">Create a Quiz</h2>
            <form className="kviz-form" onSubmit={handleSubmit}>
                <div className="kviz-input-group">
                    <label className="kviz-label">Course:</label>
                    <select
                        className="kviz-input"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                    >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.naziv}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourse && (
                    <div className="kviz-input-group">
                        <label className="kviz-label">Lesson:</label>
                        <select
                            className="kviz-input"
                            value={selectedLesson}
                            onChange={(e) => setSelectedLesson(e.target.value)}
                            required
                        >
                            <option value="">Select a lesson</option>
                            {lessons.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="kviz-input-group">
                    <label className="kviz-label">Question:</label>
                    <input
                        type="text"
                        className="kviz-input"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>

                <div className="kviz-input-group">
                    <label className="kviz-label">Answers:</label>
                    <input
                        type="text"
                        className="kviz-input"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                    />
                    <button type="button" className="kviz-add-button" onClick={handleAddAnswer}>Add Answer</button>
                    <ul className="kviz-answer-list">
                        {answers.map((answer, index) => (
                            <li key={index} className="kviz-answer">{answer}</li>
                        ))}
                    </ul>
                </div>

                <div className="kviz-input-group">
                    <label className="kviz-label">Correct Answer:</label>
                    <input
                        type="text"
                        className="kviz-input"
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                    />
                </div>

                <button type="button" className="kviz-submit-button" onClick={handleAddQuestion}>Add Question</button>

                <button type="submit" className="kviz-submit-button">Submit Quiz</button>
            </form>

            {questions.length > 0 && (
                <div>
                    <h3>Questions:</h3>
                    <ul>
                        {questions.map((q, index) => (
                            <li key={index}>
                                <p><strong>Question:</strong> {q.question}</p>
                                <p><strong>Answers:</strong> {q.answers.join(', ')}</p>
                                <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Kviz;
