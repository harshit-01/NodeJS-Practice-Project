/*eslint disable*/
import {axios} from 'axios';

export const login = async (email, password) => {
  if (email && password) {
    alert('Logged in successfully');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  }
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/v1/users/login',
        data: {
          email:req.body.email,
          password:req.body.password
        }
      });
     
    } catch (err) {
      alert('error', err.response.data.message);
    }
  
  };

export const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/api/v1/users/logout'
      });
      if ((res.data.status = 'success')) location.reload(true);
    } catch (err) {
      console.log(err.response);
      alert('error', 'Error logging out! Try again.');
    }
  };

