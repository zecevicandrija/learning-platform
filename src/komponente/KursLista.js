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
        <div className="container">
            <h2 className="title">Lista Kurseva</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Naziv</th>
                        <th>Opis</th>
                        <th>Instruktor ID</th>
                        <th>Datum Kreiranja</th>
                    </tr>
                </thead>
                <tbody>
                    {kursevi.map(kurs => (
                        <tr key={kurs.id}>
                            <td>
                                <Link to={`/kurs/${kurs.id}`}>
                                    {kurs.naziv}
                                </Link>
                            </td>
                            <td>{kurs.opis}</td>
                            <td>{kurs.instruktor_id}</td>
                            <td>{new Date(kurs.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KursLista;
