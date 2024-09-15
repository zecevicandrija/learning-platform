import React, { useState } from 'react';
import { useAuth } from '../login/auth';
import './DodajKurs.css';

const DodajKurs = () => {
    const { user } = useAuth(); // Preuzmi trenutno prijavljenog korisnika
    const [naziv, setNaziv] = useState('');
    const [opis, setOpis] = useState('');
    const [slika, setSlika] = useState(null);
    const [cena, setCena] = useState(''); // Dodaj stanje za cenu

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            console.error('Korisnik nije prijavljen.');
            return;
        }

        const formData = new FormData();
        formData.append('naziv', naziv);
        formData.append('opis', opis);
        formData.append('instruktor_id', user.id); // Koristi ID prijavljenog korisnika
        formData.append('cena', cena); // Dodaj cenu u formData
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
                setCena(''); // Resetuj polje za cenu
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
        <form className="dodaj-kurs-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Naziv Kursa:</label>
                <input
                    className="form-input"
                    type="text"
                    value={naziv}
                    onChange={(e) => setNaziv(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Opis Kursa:</label>
                <textarea
                    className="form-textarea"
                    value={opis}
                    onChange={(e) => setOpis(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Cena Kursa:</label>
                <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={cena}
                    onChange={(e) => setCena(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Izaberi Sliku:</label>
                <input
                    className="form-file-input"
                    type="file"
                    onChange={handleFileChange}
                />
            </div>
            <button className="form-submit-btn" type="submit">Dodaj Kurs</button>
        </form>
    );
};

export default DodajKurs;
