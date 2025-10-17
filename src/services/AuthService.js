import axios from 'axios';
import Cookies from 'js-cookie';
import swal from 'sweetalert';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5029/api'}/Auth`;

const register = async (firstName, lastName, email, password, country, profileImage = null, userName) => {
  try {
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('country', country);
    formData.append('userName', userName);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const response = await axios.post(`${API_URL}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.token) {
      swal({
        title: "Success!",
        text: "Kayıt başarılı",
        icon: "success",
        timer: 3000,
        button: false
      });
      Cookies.set('token', response.data.token, { expires: 1 }); // 1 gün süreyle saklar
    }
    
    // Create userData object for context
    const userData = {
      fullName: `${firstName} ${lastName}`,
      email: email,
      userName: userName,
      profileImage: profileImage ? URL.createObjectURL(profileImage) : null
    };
    
    return { success: true, ...response.data, userData };
  } catch (error) {
    console.log('Register error:', error.response?.data);
    // Backend-dən gələn xəta mesajını əldə et
    const errorMessage = error.response?.data?.message || error.response?.data || 'Qeydiyyat zamanı xəta baş verdi';
    
    // sweetalert-i silək, error mesajını frontend-də göstərəcəyik
    return { success: false, error: errorMessage };
  }
};

const login = async (email, password) => {
  try {
    console.log('Giriş isteği gönderiliyor:', { email, password });
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });

    if (response.data.token) {
      swal({
        title: "Success!",
        text: "Giriş başarılı",
        icon: "success",
        timer: 3000,
        button: false
      });
      Cookies.set('token', response.data.token, { expires: 1 }); // 1 gün süreyle saklar
    }

    // For login, we'll fetch user data from the API
    // For now, return the response data
    return { success: true, ...response.data };
  } catch (error) {
    console.error('Giriş hatası:', error.response?.data || error.message);
    // Backend-dən gələn xəta mesajını əldə et
    const errorMessage = error.response?.data?.message || error.response?.data || 'Giriş zamanı xəta baş verdi. Email və ya parol səhvdir.';
    
    // sweetalert-i silək, error mesajını frontend-də göstərəcəyik
    return { success: false, error: errorMessage };
  }
};

const googleLogin = async (googleToken) => {
  try {
    const response = await axios.post(`${API_URL}/google-login`, {
      googleToken: googleToken
    });

    if (response.data.token) {
      swal({
        title: "Success!",
        text: "Google ilə giriş uğurlu oldu!",
        icon: "success",
        timer: 3000,
        button: false
      });
      Cookies.set('token', response.data.token, { expires: 1 });
    }

    return { success: true, ...response.data };
  } catch (error) {
    console.error('Google login error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data || 'Google ilə giriş zamanı xəta baş verdi';
    return { success: false, error: errorMessage };
  }
};

export { register, login, googleLogin };
