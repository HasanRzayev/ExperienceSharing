import axios from 'axios';
import Cookies from 'js-cookie';
import swal from 'sweetalert';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/Auth`;

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
    
    return { ...response.data, userData };
  } catch (error) {
    swal({
      title: "Error!",
      text: "Kullanıcı eklenirken bir hata oluştu",
      icon: "error",
      timer: 3000,
      button: false
    });
    throw error.response.data;
    console.log(error.response.data)
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
    return response.data;
  } catch (error) {
    console.error('Giriş hatası:', error.response?.data || error.message);
    swal({
      title: "Error!",
      text: "Giriş sırasında bir hata oluştu",
      icon: "error",
      timer: 3000,
      button: false
    });
    throw error.response?.data || error.message;
  }
};

export { register, login };
