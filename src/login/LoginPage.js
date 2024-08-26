import React, { useState } from 'react';
import { useAuth } from './auth';
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCol,
  MDBRow,
  MDBInput,
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter
} from 'mdb-react-ui-kit';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [sifra, setSifra] = useState('');
  const [showModal, setShowModal] = useState(false); // State za prikaz modala
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, sifra);
    } catch (error) {
      setShowModal(true); // Prikazivanje modala u slučaju greške
      console.error('Login error:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Funkcija za zatvaranje modala
  };

  return (
    <MDBContainer fluid>
      <div className="p-5 bg-image" style={{ backgroundImage: 'url(https://undovrbas.com/static/media/logoundo.05cb548dd95412eff4cb.jpg)', height: '300px' }}></div>

      <MDBCard className='mx-5 mb-5 p-5 shadow-5' style={{ marginTop: '-100px', background: 'hsla(0, 0%, 100%, 0.8)', backdropFilter: 'blur(30px)' }}>
        <MDBCardBody className='p-5 text-center'>

          <h2 className="fw-bold mb-5">Login</h2>

          <form onSubmit={handleSubmit}>
            <MDBRow>
              <MDBCol col='12'>
                <MDBInput
                  wrapperClass='mb-4'
                  label='Email'
                  id='form1'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </MDBCol>
            </MDBRow>

            <MDBInput
              wrapperClass='mb-4'
              label='Password'
              id='form2'
              type='password'
              value={sifra}
              onChange={(e) => setSifra(e.target.value)}
              required
            />

            <MDBBtn className='w-100 mb-4' size='md' type="submit">Login</MDBBtn>
          </form>

        </MDBCardBody>
      </MDBCard>

      {/* Modal za prikaz greške */}
      <MDBModal tabIndex='-1' show={showModal} getOpenState={(isOpen) => setShowModal(isOpen)} centered>
        <MDBModalHeader>Zatražena prijava nije uspjela</MDBModalHeader>
        <MDBModalBody>
          Molimo provjerite vaše korisničke podatke i pokušajte ponovo.
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color='secondary' onClick={closeModal}>Zatvori</MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </MDBContainer>
  );
};

export default LoginPage;
