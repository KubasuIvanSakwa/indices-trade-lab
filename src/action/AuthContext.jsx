/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import useAxios from './useAxios';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens')
      ? jwtDecode(localStorage.getItem('authTokens'))
      : null
  );
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loginUser = async (username, password) => {
    try {

      await API.post('/log_in/', {
        username: username,
        password: password
      }).then(response => {

        let data = response.data

        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem('authTokens', JSON.stringify(data));
        localStorage.setItem('user', JSON.stringify(jwtDecode(data.access)));
        toast.success(
          'Login successful! Redirecting to dashboard')

        setTimeout(() => {
          navigate('/dashboard');
        }, 4000)

      }).catch(error => {
        toast.error(error.response.data);
      })
    }
    catch (error) {
      console.log(error.message)
      toast.error(`Login failed. Please try again later!`);
    }
  };

  const registerUser = async (data) => {

    await API.post('/sign_up/', {
      id_number: data.id_number,
      username: data.username,
      email: data.email,
      password1: data.password1,
      password2: data.password2,
    })
      .then(() => {
        navigate('/login');
        toast('Registration successful! Please login to continue.', {
          type: 'success'
        })
      })
      .catch(error => {
        toast('Registration failed. Please try again later', {
          type: 'error'
        })
        console.error(error)
      })
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.clear('authTokens');
    navigate('/', { replace: true });
    toast('Logout was successfull', {
      type: 'success'
    })
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
