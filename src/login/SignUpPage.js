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

  // Function to handle email input change and conditionally show the role field
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    // Show role field only if email contains @undovrbas.com
    setShowRole(emailValue.includes("@undovrbas.com"));
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending data:", {
        ime,
        prezime,
        email,
        sifra,
        uloga: showRole ? uloga : "kupac",
        adresa,
        telefon,
      });
      const response = await axios.post("http://localhost:5000/api/korisnici", {
        ime,
        prezime,
        email,
        sifra,
        uloga: showRole ? uloga : "kupac",
        telefon,
        adresa
      });
      console.log(response.data);
      alert(response.data.message); // Display message
      navigate("/");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };
  console.log(`telefon: ${telefon} `);

  return (
    <MDBContainer fluid>
      <div
        className="p-5 bg-image"
        style={{
          backgroundImage:
            "url(https://mdbootstrap.com/img/new/textures/full/171.jpg)",
          height: "300px",
        }}
      ></div>

      <MDBCard
        className="mx-5 mb-5 p-5 shadow-5"
        style={{
          marginTop: "-100px",
          background: "hsla(0, 0%, 100%, 0.8)",
          backdropFilter: "blur(30px)",
        }}
      >
        <MDBCardBody className="p-5 text-center">
          <h2 className="fw-bold mb-5">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <MDBRow>
              <MDBCol col="6">
                <MDBInput
                  wrapperClass="mb-4"
                  label="Ime"
                  id="form1"
                  type="text"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  required
                />
              </MDBCol>

              <MDBCol col="6">
                <MDBInput
                  wrapperClass="mb-4"
                  label="Prezime"
                  id="form2"
                  type="text"
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                  required
                />
              </MDBCol>
            </MDBRow>

            <MDBInput
              wrapperClass="mb-4"
              label="Email"
              id="form3"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              label="Šifra"
              id="form4"
              type="password"
              value={sifra}
              onChange={(e) => setSifra(e.target.value)}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              label="telefon"
              id="form6"
              type="text"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              required
            />

            <MDBInput
              wrapperClass="mb-4"
              label="adresa"
              id="form5"
              type="text"
              value={adresa}
              onChange={(e) => setAdresa(e.target.value)}
              required
            />

            {showRole && (
              <div className="mb-4">
                <select
                  className="form-select"
                  value={uloga}
                  onChange={(e) => setUloga(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Odaberi ulogu
                  </option>
                  <option value="admin">Admin</option>
                  <option value="kupac">Korisnik</option>
                </select>
              </div>
            )}

            <MDBBtn className="w-100 mb-4" size="md" type="submit">
              Sign Up
            </MDBBtn>
          </form>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default SignUpPage;
