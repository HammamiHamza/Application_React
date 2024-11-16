// // src/services/authService.js
// import axios from 'axios';

// const API_URL = 'http://localhost:3000';

// export const register = async (email, password) => {
//   return await axios.post(`${API_URL}/auth/register`, { email, password });
// };

// export const login = async (email, password) => {
//   const response = await axios.post(`${API_URL}/auth/login`, { email, password });
//   if (response.data.access_token) {
//     localStorage.setItem('user', JSON.stringify(response.data));
//   }
//   return response.data;
// };

// export const logout = () => {
//   localStorage.removeItem('user');
// };
