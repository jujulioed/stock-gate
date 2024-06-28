import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './index.css';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const handleSubmit = (event) => {

        event.preventDefault();
        axios.post(`${process.env.REACT_APP_API_URL}/login`, values)
        .then(res => {
            if (res.data.Status === "Success") {
                navigate('/');
            } else {
                alert(res.data.Error);
            }
        })
        .catch(err => {
            console.log(err);
            alert("Network error: " + err.message);
        });
    };

    return (
        <div className='register-main-frame'>
            <div className='bg-white'>
                <h2>Log-in</h2>
                <form onSubmit={handleSubmit}>
                    <div className='field'>
                        <label htmlFor="email"><strong>Email</strong></label>
                        <input type="email" placeholder='Enter Email' name='email' className='form-control rounded-0'
                        onChange={e => setValues({...values, email: e.target.value})}/>
                    </div>
                    <div className='field'>
                        <label htmlFor="password"><strong>Password</strong></label>
                        <input type="password" placeholder='Enter password' name='password' className='form-control rounded-0'
                        onChange={e => setValues({...values, password: e.target.value})}/>
                    </div>
                    <button type='submit' className='btn-a'>Log in</button>

                    <Link to="/register" className='btn'>Sign-up</Link>
                </form>
            </div>
        </div>
    );
}

export default Login;
