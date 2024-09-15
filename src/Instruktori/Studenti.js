import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Studenti.css'

const Studenti = () => {
    const [studenti, setStudenti] = useState([]);
    const [kursNaziv, setKursNaziv] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { kursId } = useParams();

    useEffect(() => {
        const fetchStudenti = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/kupovina/studenti/${kursId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStudenti(data);
                } else {
                    console.error('Failed to fetch students');
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        const fetchKursNaziv = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/kursevi/${kursId}`);
                if (response.ok) {
                    const data = await response.json();
                    setKursNaziv(data.naziv);
                } else {
                    console.error('Failed to fetch course name');
                }
            } catch (error) {
                console.error('Error fetching course name:', error);
            }
        };

        fetchStudenti();
        fetchKursNaziv();
    }, [kursId]);

    const filteredStudenti = studenti.filter(student =>
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="studenti-container">
            <h2 className="studenti-title">Studenti koji su kupili kurs: {kursNaziv}</h2>
            <input 
                type="text"
                placeholder="Pretraži po email-u"
                className="studenti-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredStudenti.length > 0 ? (
                <ul className="studenti-list">
                    {filteredStudenti.map(student => (
                        <li key={student.id} className="student-item">
                            <span className="student-name">{student.ime} {student.prezime}</span>
                            <span className="student-email">({student.email})</span>
                            <span className="student-date">Kupljeno: {new Date(student.datum_kupovine).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-students">Nema studenata koji su kupili ovaj kurs.</p>
            )}
        </div>
    );
};

export default Studenti;
