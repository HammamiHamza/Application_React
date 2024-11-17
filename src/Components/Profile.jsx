import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Replace with your backend API

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    };
    fetchProfile();
  }, []);

  return user ? (
    <div>
      <h2>Profile</h2>
      <img src={user.profilePic} alt="Profile" />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
      <p>{user.skills.join(', ')}</p>
      <p>GitHub: <a href={user.github}>Link</a></p>
      <p>LinkedIn: <a href={user.linkedin}>Link</a></p>
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default Profile;
