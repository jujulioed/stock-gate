import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    })
    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(process.env.REACT_APP_API_URL + '/register', values)
        .then(res => {
            if(res.data.Status === "Success") {
                navigate('/login');
            } else {
                alert("Error");
            }
        })
        .then(err => console.log(err));
    }
  return (
    <div className='register-main-frame'>
        <div className='bg-white'>
            <h2>Sing-up</h2>
            <form onSubmit={handleSubmit}>
                <div className='field'>
                    <label htmlFor="name"><strong>Name</strong></label>
                    <input type="text" placeholder='Enter name' name='name' className='form-control rounded-0'
                    onChange={e => setValues({...values, name: e.target.value})}/>
                </div>
                <div className='field'>
                    <label htmlFor="email"><strong>Email</strong></label>
                    <input type="email" placeholder='Enter Email' name='email' className='form-control rounded-0'
                    onChange={e => setValues({...values, email: e.target.value})}/>
                </div>
                <div className='field'>
                    <label htmlFor="role"><strong>Role</strong></label>
                    <input type="text" placeholder='role' name='role' className='form-control rounded-0'
                    onChange={e => setValues({...values, role: e.target.value})}/>
                </div>
                <div className='field'>
                    <label htmlFor="password"><strong>Password</strong></label>
                    <input type="password" placeholder='Enter password' name='password' className='form-control rounded-0'
                    onChange={e => setValues({...values, password: e.target.value})}/>
                </div>
                <button type='submit' className='btn'>Sign Up</button>
                <p>You are agree to our terms and policies</p>
                <Link to="/login" className='btn'>Go to Login</Link>
            </form>
        </div>
    </div>
  )
}

export default Register;
