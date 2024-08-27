import Pocetna from './komponente/Pocetna';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import KursLista from './komponente/KursLista';
import React from 'react';
import DodajKurs from './komponente/DodajKurs';
import LoginPage from './login/LoginPage';
import SignUpPage from './login/SignUpPage';
import DodajKorisnika from './login/DodajKorisnika';
import { AuthProvider } from './login/auth';
import Navbar from './Navigacija/Navbar';
import KursDetalj from './komponente/KursDetalj';
import Lekcije from './komponente/Lekcije';

import './App.css';

  const App = () => {
    

  return (
    <Router>
      <AuthProvider>
      <Navbar />
        <Routes>
          <Route path="/" element={<Pocetna />} />
          <Route path="/kursevi" element={<KursLista />} />
          <Route path="/dodajkurs" element={<DodajKurs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Signup" element={<SignUpPage />} />
          <Route path="/Dodajkorisnika" element={<DodajKorisnika />} />
          <Route path="/kurs/:id" element={<KursDetalj />} />
          <Route path="/lekcije" element={<Lekcije />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
