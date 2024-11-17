import React, { useState } from 'react';
import register from '../Services/Auth'; // Default import
import loginWithGoogle  from '../Services/Auth';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import { GoogleLogin } from '@react-oauth/google';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Use navigate for programmatic routing

  const handleRegister = async () => {
    const data = await register(email, password); // Assuming you have a register function
    if (data.token) {
      localStorage.setItem('token', data.token); // Store JWT token
      navigate('/profile'); // Use navigate to redirect
    }
  };

  const handleGoogleLogin = async (response) => {
    const data = await loginWithGoogle(response.credential); // Ensure loginWithGoogle is defined
    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/profile'); // Use navigate to redirect
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>

      <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log('Login Failed')} />
    </div>
  );
}

export default Register;
