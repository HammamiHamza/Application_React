import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router

import { GoogleOAuthProvider } from '@react-oauth/google';  // Ensure this is inside the Router
import 'bootstrap/dist/css/bootstrap.min.css';

import { Provider } from 'react-redux';
import { store } from './store';

import Login from './Components/Login';
import Register from './Components/Register';
import Profile from './Components/Profile';
import Posts from './Components/Posts';
import Comments from './Components/Comments';
import './App.css';
import Navbar from './Components/Navbar';
import Users from './Components/Users';
import Home from './Components/Home';

console.log('Navbar:', Navbar);
console.log('Home:', Home);
console.log('Login:', Login);
console.log('Register:', Register);
console.log('Profile:', Profile);
console.log('Posts:', Posts);
console.log('Comments:', Comments);
console.log('Users:', Users);

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Provider store={store}>
      <Router>  {/* Wrap your app in Router */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
