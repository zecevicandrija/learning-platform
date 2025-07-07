import React, { useState } from 'react';
import axios from 'axios';
import { 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import './DodajKorisnika.css';

const DodajKorisnika = () => {
    const [ime, setIme] = useState('');
    const [prezime, setPrezime] = useState('');
    const [email, setEmail] = useState('');
    const [sifra, setSifra] = useState('');
    const [uloga, setUloga] = useState('');
    const [telefon, setTelefon] = useState('');
    const [adresa, setAdresa] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleDodajKorisnika = async (e) => {
        e.preventDefault();
        try {
            const noviKorisnik = { 
                ime, 
                prezime, 
                email, 
                sifra, 
                uloga: uloga || 'korisnik', // Default role if not selected
                telefon, 
                adresa 
            };
            
            const response = await axios.post('http://localhost:5000/api/korisnici', noviKorisnik);
            
            setSnackbar({
                open: true,
                message: 'Korisnik uspešno dodat!',
                severity: 'success'
            });

            // Reset form
            setIme('');
            setPrezime('');
            setEmail('');
            setSifra('');
            setUloga('');
            setTelefon('');
            setAdresa('');
            
        } catch (error) {
            console.error('Greška pri dodavanju korisnika:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Došlo je do greške pri dodavanju korisnika',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    return (
        <div className="dodaj-korisnika-container">
            <h2 className="dodaj-korisnika-title">Dodaj Korisnika</h2>
            <form onSubmit={handleDodajKorisnika} className="dodaj-korisnika-form">
                <TextField
                    label="Ime"
                    value={ime}
                    onChange={(e) => setIme(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Prezime"
                    value={prezime}
                    onChange={(e) => setPrezime(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    type="password"
                    label="Šifra"
                    value={sifra}
                    onChange={(e) => setSifra(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    inputProps={{ minLength: 6 }}
                />
                <TextField
                    label="Telefon"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Adresa"
                    value={adresa}
                    onChange={(e) => setAdresa(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="select-uloga-label">Uloga</InputLabel>
                    <Select
                        labelId="select-uloga-label"
                        value={uloga}
                        onChange={(e) => setUloga(e.target.value)}
                        label="Uloga"
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="instruktor">Instruktor</MenuItem>
                        <MenuItem value="korisnik">Korisnik</MenuItem>
                    </Select>
                </FormControl>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    size="large"
                >
                    Dodaj Korisnika
                </Button>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default DodajKorisnika;