import React, { useState, useEffect } from 'react';
import { useAuth } from '../login/auth';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import './Instruktor.css';
import Zarada from './Zarada';
import Popust from '../Kupovina/Popust';

const Instruktor = () => {
    const [kursevi, setKursevi] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const { user } = useAuth();
    const instructorId = user ? user.id : null;
    const navigate = useNavigate();

    const [editingCourse, setEditingCourse] = useState(null);
    const [courseImageFile, setCourseImageFile] = useState(null);
    const [editCourseForm, setEditCourseForm] = useState({ naziv: '', opis: '', cena: '' });

    useEffect(() => {
        fetchKursevi();

        const fetchTotalEarnings = async () => {
            if (instructorId) {
                try {
                    const response = await fetch(`http://localhost:5000/api/kupovina/zarada/${instructorId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setTotalEarnings(data.totalEarnings);
                    } else {
                        console.error('Failed to fetch total earnings');
                    }
                } catch (error) {
                    console.error('Error fetching total earnings:', error);
                }
            }
        };

        
        fetchTotalEarnings();
    }, [instructorId]);

    //edit
    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setEditCourseForm({
            naziv: course.naziv,
            opis: course.opis,
            cena: course.cena,
        });
        setIsEditModalOpen(true);
    };

    const handleEditCourseChange = (e) => {
        const { name, value } = e.target;
        setEditCourseForm({ ...editCourseForm, [name]: value });
    };

    const handleCourseImageChange = (e) => {
        setCourseImageFile(e.target.files[0]);
    };
    

    const handleEditCourseSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('naziv', editCourseForm.naziv);
        formData.append('opis', editCourseForm.opis);
        formData.append('cena', editCourseForm.cena);
        formData.append('instruktor_id', instructorId);
    
        if (courseImageFile) {
            formData.append('slika', courseImageFile);
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/kursevi/${editingCourse.id}`, {
                method: 'PUT',
                body: formData,
            });
    
            if (response.ok) {
                // Option 1: Re-fetch the courses after a successful update
                await fetchKursevi();  // Re-fetch the course list after update
    
                // Close the modal
                setIsEditModalOpen(false);
            } else {
                const errorText = await response.text();
                console.error('Failed to update course', errorText);
            }
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };
    
    // Function to refetch courses
const fetchKursevi = async () => {
    if (instructorId) {
        try {
            const response = await fetch(`http://localhost:5000/api/kursevi/instruktor/${instructorId}`);
            if (response.ok) {
                const data = await response.json();
                setKursevi(data);  // This will trigger a re-render
            } else {
                console.error('Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }
};
    
    
    
    




    const handleDelete = async (kursId) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovaj kurs?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/kursevi/${kursId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setKursevi(kursevi.filter(kurs => kurs.id !== kursId));
                } else {
                    console.error('Failed to delete course');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const viewStudents = (kursId) => {
        navigate(`/studenti/${kursId}`);
    };

    const handleShowLessons = async (course) => {
        setSelectedCourse(course);
        try {
            const response = await fetch(`http://localhost:5000/api/lekcije/course/${course.id}`);
            if (response.ok) {
                const data = await response.json();
                setLessons(data);
            } else {
                console.error('Failed to fetch lessons');
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
        setIsModalOpen(true);
    };

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setEditForm({
            title: lesson.title,
            content: lesson.content,
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });
    };

    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('course_id', editingLesson.course_id);
        formData.append('title', editForm.title);
        formData.append('content', editForm.content);
        formData.append('section', editingLesson.section);
        if (videoFile) formData.append('video', videoFile); // Append video file if available

        try {
            const response = await fetch(`http://localhost:5000/api/lekcije/${editingLesson.id}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.ok) {
                // Refetch the lessons
                const response = await fetch(`http://localhost:5000/api/lekcije/course/${selectedCourse.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setLessons(data);
                } else {
                    console.error('Failed to fetch lessons');
                }

                setIsEditModalOpen(false);
                setIsModalOpen(true); // Ensure main modal remains open
            } else {
                console.error('Failed to update lesson:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu lekciju?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/lekcije/${lessonId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
                } else {
                    console.error('Failed to delete lesson');
                }
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    return (
        <div className="instruktor-container">
            <h2 className="title">Moji Kursevi</h2>
            {kursevi.length > 0 ? (
                <>
                    <div className="kurs-lista">
                        {kursevi.map(kurs => (
                            <div className="kurs-card" key={kurs.id}>
                                {kurs.slika && (
                                    <img src={kurs.slika} alt={kurs.naziv} className="kurs-slika" />
                                )}
                                <p className="kurs-naziv">{kurs.naziv}</p>
                                <p className="kurs-opis">{kurs.opis}</p>
                                <p className="kurs-cena">{kurs.cena}$</p>
                                <p className="kurs-datum">Datum Kreiranja: {new Date(kurs.created_at).toLocaleDateString()}</p>
                                <button onClick={() => handleDelete(kurs.id)} className="delete-button2"><i className="ri-delete-bin-line"></i></button>
                                <button onClick={() => viewStudents(kurs.id)} className="view-students-button"><i className="ri-graduation-cap-line"></i></button>
                                <button onClick={() => handleShowLessons(kurs)} className="view-lessons-button"><i className="ri-git-repository-line"></i></button>
                                <button onClick={() => handleEditCourse(kurs)} className="edit-course-button">Edit</button>
                            </div>
                        ))}
                    </div>
                    <Popust />
                    <Zarada kursevi={kursevi} />

                    {/* Main Lessons Modal */}
                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>X</button>
                                <h2>{selectedCourse.naziv} - Lekcije</h2>
                                <div className="lessons-list">
                                    {lessons.length > 0 ? (
                                        lessons.map(lesson => (
                                            <div className="lesson-card" key={lesson.id}>
                                                <p className="lesson-title">{lesson.title}</p>
                                                <p className="lesson-content">{lesson.content}</p>
                                                {lesson.video_url && (
                                                    <video className="lesson-video" controls>
                                                        <source src={lesson.video_url} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                                <button onClick={() => handleEditLesson(lesson)} className="edit-lesson-button">Edit</button>
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="delete-lesson-button">Delete</button>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No lessons available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Lesson Modal */}
                    {isEditModalOpen && (
                        <div className="modal-overlay">
                            <div className="edit-modal-content">
                                <button className="close-modal-button" onClick={() => setIsEditModalOpen(false)}>X</button>
                                <h2>Edit Lesson</h2>
                                <form onSubmit={handleEditSubmit}>
                                    <label>
                                        Title:
                                        <input
                                            type="text"
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Content:
                                        <textarea
                                            name="content"
                                            value={editForm.content}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Video:
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                        />
                                    </label>
                                    <button type="submit" className="save-button">Save</button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>No courses available.</p>
            )}

            {/* Edit Course Modal */}
            {isEditModalOpen && (
                        <div className="modal-overlay">
                            <div className="edit-modal-content">
                                <button className="close-modal-button" onClick={() => setIsEditModalOpen(false)}>X</button>
                                <h2>Edit Course</h2>
                                <form onSubmit={handleEditCourseSubmit}>
                                    <label>
                                        Naziv:
                                        <input
                                            type="text"
                                            name="naziv"
                                            value={editCourseForm.naziv}
                                            onChange={handleEditCourseChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Opis:
                                        <textarea
                                            name="opis"
                                            value={editCourseForm.opis}
                                            onChange={handleEditCourseChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Cena:
                                        <input
                                            type="number"
                                            name="cena"
                                            value={editCourseForm.cena}
                                            onChange={handleEditCourseChange}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Slika:
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCourseImageChange}
                                        />
                                    </label>
                                    <button type="submit" className="save-button">Save</button>
                                </form>
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default Instruktor;

