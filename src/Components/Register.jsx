import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../Services/AuthServices';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError("La photo ne doit pas dépasser 5MB");
        return;
      }
      setPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      console.log('Starting registration process...');
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await register(formData);
      console.log('Registration successful:', response);
      navigate('/login');
    } catch (error) {
      console.error('Detailed registration error:', error);
      
      if (error.message.includes('API key not valid')) {
        setError("Erreur de configuration. Veuillez contacter l'administrateur.");
      } else {
        switch (error.message) {
          case 'EMAIL_EXISTS':
            setError("Cette adresse email est déjà associée à un compte. Veuillez vous connecter ou utiliser une autre adresse.");
            break;
          case 'INVALID_EMAIL':
            setError("L'adresse email n'est pas valide.");
            break;
          case 'OPERATION_NOT_ALLOWED':
            setError("La création de compte est désactivée.");
            break;
          case 'WEAK_PASSWORD':
            setError("Le mot de passe est trop faible.");
            break;
          default:
            setError(`Erreur lors de l'inscription: ${error.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Inscription</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                {/* Photo Upload */}
                <div className="mb-4 text-center">
                  <div className="position-relative d-inline-block">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <i className="bi bi-person-fill fs-1"></i>
                      </div>
                    )}
                    <label
                      htmlFor="photo"
                      className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1"
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="bi bi-camera-fill"></i>
                    </label>
                    <input
                      type="file"
                      id="photo"
                      className="d-none"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="firstName" className="form-label">Prénom</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="lastName" className="form-label">Nom</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                {/* Existing Fields */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Inscription en cours...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Déjà inscrit ?{' '}
                  <a href="/login" className="text-decoration-none">
                    Connectez-vous
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;