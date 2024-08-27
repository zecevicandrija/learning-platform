// src/Lekcije.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Lekcije.css';

const Lekcije = () => {
    const [lekcije, setLekcije] = useState([]);
    const [courses, setCourses] = useState([]); // State to hold the list of courses
    const [newLekcija, setNewLekcija] = useState({ course_id: '', title: '', content: '' });

    // Fetch lessons and courses on component mount
    useEffect(() => {
        const fetchLekcije = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/lekcije');
                setLekcije(response.data);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kursevi');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchLekcije();
        fetchCourses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLekcija({ ...newLekcija, [name]: value });
    };

    const handleAddLekcija = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/lekcije', {
                course_id: newLekcija.course_id,
                title: newLekcija.title,
                content: newLekcija.content,
            });

            // Refresh the lessons list after adding a new lesson
            const response = await axios.get('http://localhost:5000/api/lekcije');
            setLekcije(response.data);
            setNewLekcija({ course_id: '', title: '', content: '' }); // Reset the form
        } catch (error) {
            console.error('Error adding lesson:', error);
        }
    };

    return (
        <div className="lekcije-container">
            <h3>Napravite Lekcije</h3>

            <form onSubmit={handleAddLekcija} className="add-lekcija-form">
                <div>
                    <label htmlFor="course_id">Izaberite kurs:</label>
                    <select
                        id="course_id"
                        name="course_id"
                        value={newLekcija.course_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">-- Izaberite kurs --</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.naziv}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="title">Naslov lekcije:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={newLekcija.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content">Sadržaj lekcije:</label>
                    <textarea
                        id="content"
                        name="content"
                        value={newLekcija.content}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Dodaj Lekciju</button>
            </form>
        </div>
    );
};

export default Lekcije;
