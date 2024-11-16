// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get('http://localhost:3000/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user')}`,
        },
      });
      setProfile(response.data);
    };
    fetchProfile();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <img src={profile.photo} alt="Profile" />
      <h1>{profile.email}</h1>
      <p>{profile.bio}</p>
      <h3>Skills:</h3>
      <ul>{profile.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
    </div>
  );
}

export default Profile;
