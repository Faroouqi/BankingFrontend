import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        console.log(e.target,e.value)
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const body = new URLSearchParams();
        body.append('username', formData.username);
        body.append('password', formData.password);

        try {
            const res = await fetch('http://localhost:8089/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                credentials: 'include',
            });

            if (res.ok) {
                navigate('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch {
            setError('Something went wrong. Try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel">
                <h2>Finance Manager</h2>
                <p className="sub-heading">Sign in to continue</p>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Email"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <div className="underline"></div>
                    </div>
                    <div className="form-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? '🙈' : '👁️'}
                    </span>
                        <div className="underline"></div>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
