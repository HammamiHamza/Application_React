// import axios from 'axios';

// const API_URL = 'https://bookings-80088-default-rtdb.firebaseio.com'; // Replace with your backend API

// export const register = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/register`, { email, password });
//     return response.data;
//   } catch (error) {
//     console.error('Error during registration', error);
//   }
// };

// export const login = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/auth/login`, { email, password });
//     return response.data; // Should return JWT token
//   } catch (error) {
//     console.error('Error during login', error);
//   }
// };

// // Updated loginWithGoogle using axios
// export const loginWithGoogle = async (credential) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/google`, { credential });
//       return response.data; // Assuming your API returns a token
//     } catch (error) {
//       console.error('Google login failed:', error);
//     }
//   };
  
