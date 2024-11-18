// import React, { useState, useEffect } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import { GoogleOAuthProvider } from '@react-oauth/google'; // Import the GoogleOAuthProvider

// import Login from './Components/Login';
// import Register from './Components/Register';
// import Profile from './Components/Profile';
// import Post from './Components/Post';
// import './App.css';

// function App() {
//   const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

//   useEffect(() => {
//     document.body.className = darkMode ? 'dark-mode' : '';
//     localStorage.setItem('darkMode', darkMode);
//   }, [darkMode]);

//   return (
//     <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
//       {/* Wrap your app with the GoogleOAuthProvider */}
//       <button onClick={() => setDarkMode(!darkMode)}>
//         {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
//       </button>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/posts" element={<Post />} />
//       </Routes>
//     </GoogleOAuthProvider>
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router

import { GoogleOAuthProvider } from '@react-oauth/google';  // Ensure this is inside the Router
import 'bootstrap/dist/css/bootstrap.min.css';


import Login from './Components/Login';
import Register from './Components/Register';
import Profile from './Components/Profile';
import Post from './Components/Post';
import Comments from './Components/Comments';
import './App.css';
import Navbar from './Components/Navbar';
import Users from './Components/Users';

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>  {/* Wrap your app in Router */}
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/posts" element={<Post />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
