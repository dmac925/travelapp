import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { URL } from "../config";

const Register = (props) => {
	const [ formData, setFormData ] = useState({
		email: '',
		password: '',
		password2: '',
    admin: false,
	});
	const [ message, setMessage ] = useState('');

	const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
		debugger
		e.preventDefault();
		try {
			const response = await axios.post(`${URL}/users/register`, {
				email: formData.email,
				password: formData.password,
				password2: formData.password2,
        admin: formData.admin
			});
			setMessage(response.data.message);
			//console.log(response)
			if (response.data.ok) {
				setTimeout(() => {
					navigate('/login');
				}, 500);
			}
		} catch (error) {
			console.log(error);
		}
	};

  return (


    <div className="formContainer">

    <div>
        <h1>Register</h1>

    <div className="formContainer">
      <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email address
          <input 
            type="text"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        </div>
        

        <div className="mb-3">
        <label htmlFor="password" className="form-label">Password
        <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        </div>

        <div className="mb-3">
        <label htmlFor="password" className="form-label">Password
        <input
            type="password"
            className="form-control"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
          />
        </label>
        </div>
     
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
      <div class="registerMessage">
      <p>{message}</p>
      </div>
      </div>
      </div>
    </div>
  );
};

export default Register;