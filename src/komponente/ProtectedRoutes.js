import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../login/auth';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();
//   console.log("Korisnik u ProtectedRoute:", user);
//   console.log("Dozvoljene uloge:", allowedRoles);
  // Ako `user` ne postoji, preusmeri na login
  if (!user) {
    return <Link to="/login" />;
  }

  // Ako uloga korisnika nije dozvoljena, preusmeri na stranicu za nepostojecu stranicu
  if (allowedRoles && !allowedRoles.includes(user.uloga)) {
    return <Link to="/nevazeca" />;
  }

  // Ako je sve u redu, renderuj element
  return element;
  
};

export default ProtectedRoute;
