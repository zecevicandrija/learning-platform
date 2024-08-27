import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './KursDetalj.css';

const KursDetalj = () => {
    const { id } = useParams();
    const [kurs, setKurs] = useState(null);
    const [lekcije, setLekcije] = useState([]);

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

        fetchKurs();
        fetchLekcije();
    }, [id]);

    if (!kurs) return <p>Loading...</p>;

    return (
        <div className="kurs-detalj-container">
            <h2 className="kurs-title">{kurs.naziv}</h2>
            <p className="kurs-opis">{kurs.opis}</p>
            <p><strong>Instruktor ID:</strong> {kurs.instruktor_id}</p>
            <p><strong>Datum Kreiranja:</strong> {new Date(kurs.created_at).toLocaleDateString()}</p>

            <div className="lekcije-container">
                <h3>Lekcije</h3>
                <ul>
                    {lekcije.map((lekcija) => (
                        <li key={lekcija.id}>
                            <h4>{lekcija.title}</h4>
                            <p>{lekcija.content}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default KursDetalj;
