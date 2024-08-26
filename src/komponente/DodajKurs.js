import React, { useState } from 'react';

const DodajKurs = () => {
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [instruktorId, setInstruktorId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const kurs = { naziv, opis, instruktor_id: instruktorId };

        try {
            const response = await fetch('http://localhost:5000/api/kursevi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(kurs),
            });

            if (response.ok) {
                console.log('Course added successfully');
                // Resetuj polja nakon uspešnog dodavanja
                setNaziv('');
                setOpis('');
                setInstruktorId('');
            } else {
                console.error('Failed to add course');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Naziv Kursa:</label>
                <input
                    type="text"
                    value={naziv}
                    onChange={(e) => setNaziv(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Opis Kursa:</label>
                <textarea
                    value={opis}
                    onChange={(e) => setOpis(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Instruktor ID:</label>
                <input
                    type="text"
                    value={instruktorId}
                    onChange={(e) => setInstruktorId(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Dodaj Kurs</button>
        </form>
    );
};

export default DodajKurs;
