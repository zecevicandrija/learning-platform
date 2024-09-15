import React, { useState } from 'react';
import axios from 'axios';
import './Popust.css';

const Popust = () => {
    const [discountCode, setDiscountCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const createDiscount = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/popusti/create', {
                code: discountCode,
                discountPercent: Number(discountPercent),
            });

            if (response.data.success) {
                setMessage('Kod popusta je uspešno kreiran');
                setDiscountCode('');
                setDiscountPercent('');
            } else {
                setError('Neuspešno kreiranje koda popusta');
            }
        } catch (err) {
            setError('Greška prilikom kreiranja koda popusta');
            console.error('Detalji greške:', err); // Added for debugging
        }
    };

    return (
        <div className="popust-container">
            <h1>Kreirajte popust kod</h1>
            <input 
                type="text" 
                className="popust-input-kod" 
                placeholder="Unesite kod popusta" 
                value={discountCode} 
                onChange={(e) => setDiscountCode(e.target.value)} 
            />
            <input 
                type="number" 
                className="popust-input-procenat" 
                placeholder="Unesite procenat popusta" 
                value={discountPercent} 
                onChange={(e) => setDiscountPercent(e.target.value)} 
            />
            <button className="popust-dugme" onClick={createDiscount}>Kreiraj popust</button>
            {message && <p className="popust-poruka">{message}</p>}
            {error && <p className="popust-greska">{error}</p>}
        </div>
    );
};

export default Popust;
