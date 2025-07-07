import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBInput,
} from "mdb-react-ui-kit";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "./Auth.css";

const SignUpPage = () => {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [sifra, setSifra] = useState("");
  const [uloga, setUloga] = useState("");
  const [adresa, setAdresa] = useState("");
  const [telefon, setTelefon] = useState("");
  const [showRole, setShowRole] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setShowRole(emailValue.includes("@undovrbas.com"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/korisnici", {
        ime,
        prezime,
        email,
        sifra,
        uloga: showRole ? uloga : "korisnik",
        telefon,
        adresa
      });
      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Došlo je do greške pri registraciji");
    }
  };

  return (
    <MDBContainer fluid className="auth-page-container">
      
      <MDBCard
        className="mx-5 mb-5 p-5 shadow-5 auth-card"
      >
        <MDBCardBody className="auth-card-body">
          <h2 className="auth-title">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <MDBRow>
              <MDBCol col="6">
                <MDBInput
                  wrapperClass="mb-4"
                  className="auth-form-input"
                  labelClass="auth-form-label"
                  label="Ime"
                  id="firstName"
                  type="text"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  required
                />
              </MDBCol>

              <MDBCol col="6">
                <MDBInput
                  wrapperClass="mb-4"
                  className="auth-form-input"
                  labelClass="auth-form-label"
                  label="Prezime"
                  id="lastName"
                  type="text"
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                  required
                />
              </MDBCol>
            </MDBRow>

            <MDBInput
              wrapperClass="mb-4"
              className="auth-form-input"
              labelClass="auth-form-label"
              label="Email"
              id="signupEmail"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              className="auth-form-input"
              labelClass="auth-form-label"
              label="Šifra"
              id="signupPassword"
              type="password"
              value={sifra}
              onChange={(e) => setSifra(e.target.value)}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              className="auth-form-input"
              labelClass="auth-form-label"
              label="Telefon"
              id="phoneNumber"
              type="text"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              className="auth-form-input"
              labelClass="auth-form-label"
              label="Adresa"
              id="address"
              type="text"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              required
            />

            {showRole && (
              <div className="mb-4">
                <select
                  className="auth-role-select"
                  value={uloga}
                  onChange={(e) => setUloga(e.target.value)}
                  required
                >
                  <option value="" disabled>Odaberi ulogu</option>
                  <option value="admin">Admin</option>
                  <option value="instruktor">Instruktor</option>
                  <option value="korisnik">Korisnik</option>
                </select>
              </div>
            )}

            <MDBBtn className="w-100 mb-4 auth-btn" size="md" type="submit">
              Sign Up
            </MDBBtn>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default SignUpPage;