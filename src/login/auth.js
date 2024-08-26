import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
} from "mdb-react-ui-kit"; // Uvoz komponenti modala

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // State za prikaz modala
  const [modalMessage, setModalMessage] = useState(""); // Poruka koja će se prikazati u modalu
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, sifra) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, sifra }
      );
      if (response.status === 200) {
        const loggedInUser = response.data.user;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        console.log("Login successful:", loggedInUser);
        navigate("/");
        return loggedInUser;
      } else {
        setShowModal(true); // Prikaz modala za neuspešnu prijavu
        setModalMessage(
          "Neuspešna prijava. Proverite vaše korisničke podatke i pokušajte ponovo."
        );
        console.error("Login failed:", response.data.message);
        return null;
      }
    } catch (error) {
      setModalMessage(
        "Došlo je do greške prilikom prijave. Molimo pokušajte ponovo kasnije."
      );
      setShowModal(true); // Prikaz modala za grešku pri prijavi
      console.error("Error logging in:", error);

      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false); // Funkcija za zatvaranje modala
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };
  const updateUser = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/update",
        userData
      );
      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("User updated successfully:", updatedUser);
        return updatedUser;
      } else {
        setShowModal(true);
        setModalMessage("Neuspešno ažuriranje korisnika. Pokušajte ponovo.");
        console.error("Update failed:", response.data.message);
        return null;
      }
    } catch (error) {
      setModalMessage(
        "Došlo je do greške prilikom ažuriranja korisnika. Molimo pokušajte ponovo kasnije."
      );
      setShowModal(true);
      console.error("Error updating user:", error);
      throw error;
    }
  };

  return (
    <>
      <AuthContext.Provider value={{ user, login, logout, updateUser }}>
        {children}
      </AuthContext.Provider>

      {/* Modal za prikaz greške */}
      <MDBModal
        tabIndex="-1"
        show={showModal}
        getOpenState={(isOpen) => setShowModal(isOpen)}
        centered
      >
        <MDBModalHeader>Greška pri prijavi</MDBModalHeader>
        <MDBModalBody>{modalMessage}</MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color="secondary" onClick={closeModal}>
            Zatvori
          </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </>
  );
};

export const useAuth = () => React.useContext(AuthContext);
