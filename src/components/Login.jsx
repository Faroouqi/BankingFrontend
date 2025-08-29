import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ---------------- LOGIN ----------------
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

    // ---------------- REGISTER ----------------
    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:8089/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });

            if (res.ok) {
                    setShowOtp(true);
                    alert("We have sent an OTP to your email. Please verify.");
                    setError("")

            } else {
                const errorMsg = await res.text();
                setError(errorMsg);
            }
        } catch {
            setError("Something went wrong. Try again.");
        }
    };


    // ---------------- VERIFY OTP ----------------
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8089/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp,
                }),
            });

            if (res.ok) {
                alert("✅ Email verified successfully! You can now log in.");
                const response = await fetch("http://localhost:8089/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    }),
                    credentials: "include",
                });
                if(response.ok) {
                    setIsActive(false); // back to login
                    setShowOtp(false);
                    setError("")
                }
                else {
                    const errorMsg = await response.text();
                    setError(errorMsg);
                }

            } else {
                setError("Invalid or expired OTP");
            }
        } catch {
            setError("Something went wrong. Try again.");
        }
    };


    return (
        <div className={`container ${isActive ? "active" : ""}`}>
            {/* Sign Up Form */}
            <div className="form-container sign-up">
                <form onSubmit={showOtp ? handleVerifyOtp : handleRegister}>
                    <h1>{showOtp ? "Verify OTP" : "Create Account"}</h1>
                    {error && <p className="error">{error}</p>}

                    {!showOtp && (
                        <>
                            <input
                                type="text"
                                name="username"
                                placeholder="Name"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    {showOtp && (
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    )}

                    <button type="submit">
                        {showOtp ? "Verify OTP" : "Sign Up"}
                    </button>
                </form>
            </div>

            {/* Sign In Form */}
            <div className="form-container sign-in">
                <form onSubmit={handleSubmit}>
                    <h1>Sign In</h1>
                    {error && <p className="error">{error}</p>}
                    <input
                        type="email"
                        name="username"
                        placeholder="Email"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <div className="form-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="Forget-password">
                        <a href="#">Forget Your Password?</a>
                        <button type="submit">Sign In</button>
                    </div>
                </form>
            </div>

            {/* Toggle Panel */}
            <div className="toggle-container">
                <div className="toggle">
                    <div className="toggle-panel toggle-left">
                        <h1>Welcome Back!</h1>
                        <p>Enter your personal details to use all of site features</p>
                        <button className="hidden" onClick={() => setIsActive(false)}>
                            Sign In
                        </button>
                    </div>
                    <div className="toggle-panel toggle-right">
                        <h1>Hello, Friend!</h1>
                        <p>Register with your personal details to use all of site features</p>
                        <button className="hidden" onClick={() => setIsActive(true)}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
