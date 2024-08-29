import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './KursLista.css';

const KursLista = () => {
    const [kursevi, setKursevi] = useState([]);

    useEffect(() => {
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

        fetchKursevi();
    }, []);

    return (
        <div className="kurs-container">
            <h2 className="title">Lista Kurseva</h2>
            <div className="kurs-lista">
            {kursevi.map(kurs => (
    <Link to={`/kurs/${kurs.id}`} className="kurs-card" key={kurs.id}>
        {kurs.slika && (
            <img src={kurs.slika} alt={kurs.naziv} className="kurs-slika" />
        )}
        <p className="kurs-naziv">{kurs.naziv}</p>
        <p className="kurs-opis">{kurs.opis}</p>
        <p className="kurs-instruktor">Instruktor ID: {kurs.instruktor_id}</p>
        <p className="kurs-datum">Datum Kreiranja: {new Date(kurs.created_at).toLocaleDateString()}</p>
    </Link>
))}

            </div>
        </div>
    );
};

export default KursLista;
