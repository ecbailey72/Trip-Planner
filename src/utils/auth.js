import axios from 'axios';

// Set up axios to always send the auth token
export const setupAxiosAuth = () => {
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('ventaro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // If we get a 401, redirect to login
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('ventaro_token');
        localStorage.removeItem('ventaro_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ventaro_user'));
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('ventaro_token');
  localStorage.removeItem('ventaro_user');
  window.location.href = '/login';
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('ventaro_token');
};
