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
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [sifra, setSifra] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(email, sifra);
    } catch (error) {
      setShowModal(true);
      console.error('Login error:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <MDBContainer fluid className="auth-page-container">
      <MDBCard className='mx-5 mb-5 p-5 shadow-5 auth-card'>
        <MDBCardBody className='auth-card-body'>
          <h2 className="auth-title">Login</h2>

          <form onSubmit={handleSubmit}>
            <MDBRow>
              <MDBCol col='12'>
                <MDBInput
                  wrapperClass='mb-4'
                  className='auth-form-input'
                  labelClass='auth-form-label'
                  label='Email'
                  id='loginEmail'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </MDBCol>
            </MDBRow>

            <MDBInput
              wrapperClass='mb-4'
              className='auth-form-input'
              labelClass='auth-form-label'
              label='Password'
              id='loginPassword'
              type='password'
              value={sifra}
              onChange={(e) => setSifra(e.target.value)}
              required
            />

            <MDBBtn className='w-100 mb-4 auth-btn' size='md' type="submit">
              Login
            </MDBBtn>
          </form>
        </MDBCardBody>
      </MDBCard>

      <MDBModal tabIndex='-1' show={showModal} setShow={setShowModal} className='auth-modal' centered>
        <MDBModalHeader>
          <h5 className='mb-0'>Prijava nije uspjela</h5>
        </MDBModalHeader>
        <MDBModalBody>
          Molimo provjerite vaše korisničke podatke i pokušajte ponovo.
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color='secondary' onClick={closeModal} className='auth-btn'>
            Zatvori
          </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </MDBContainer>
  );
};

export default LoginPage;