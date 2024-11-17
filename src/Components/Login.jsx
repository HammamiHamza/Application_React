import React, { useState } from 'react';
import login from '../Services/Auth'; // Default import
import  loginWithGoogle  from '../Services/Auth';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Replaced useHistory with useNavigate

  const handleLogin = async () => {
    const data = await login(email, password);
    if (data.token) {
      localStorage.setItem('token', data.token); // Store JWT token
      navigate('/profile'); // Replaced history.push with navigate
    }
  };

  const handleGoogleLogin = async (response) => {
    const data = await loginWithGoogle(response.credential); // Ensure loginWithGoogle is defined
    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/profile'); // Replaced history.push with navigate
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>

      <GoogleLogin onSuccess={handleGoogleLogin} onError={() => console.log('Login Failed')} />
    </div>
  );
}

export default Login;
