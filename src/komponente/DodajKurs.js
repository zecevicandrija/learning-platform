import React, { useState } from 'react';

const DodajKurs = () => {
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [instruktorId, setInstruktorId] = useState('');
    const [slika, setSlika] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('naziv', naziv);
        formData.append('opis', opis);
        formData.append('instruktor_id', instruktorId);
        if (slika) {
            formData.append('slika', slika);
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/kursevi', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                console.log('Kurs je uspešno dodat');
                setNaziv('');
                setOpis('');
                setInstruktorId('');
                setSlika(null);
            } else {
                console.error('Greška pri dodavanju kursa');
            }
        } catch (error) {
            console.error('Greška:', error);
        }
    };
    

    const handleFileChange = (e) => {
        setSlika(e.target.files[0]);
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
            <div>
                <label>Izaberi Sliku:</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                />
            </div>
            <button type="submit">Dodaj Kurs</button>
        </form>
    );
};

export default DodajKurs;
