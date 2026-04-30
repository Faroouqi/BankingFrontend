import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBullseye, FaChartLine, FaEye, FaEyeSlash, FaShieldAlt, FaWallet } from 'react-icons/fa';
import '../css/Login.css';

const API_BASE = 'http://localhost:8089';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotForm, setForgotForm] = useState({ username: '', newPassword: '' });
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const resetAuthMessages = () => {
        setError('');
        setForgotError('');
        setForgotSuccess('');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleForgotChange = (event) => {
        const { name, value } = event.target;
        setForgotForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        resetAuthMessages();

        const body = new URLSearchParams();
        body.append('username', formData.username);
        body.append('password', formData.password);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
                credentials: 'include',
            });

            if (!response.ok) {
                setError('Invalid email or password.');
                return;
            }

            navigate('/dashboard');
        } catch {
            setError('Unable to connect to the server right now.');
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        resetAuthMessages();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            if (!response.ok) {
                setError(await response.text());
                return;
            }

            setShowOtp(true);
        } catch {
            setError('Unable to send OTP right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (event) => {
        event.preventDefault();
        resetAuthMessages();
        setLoading(true);

        try {
            const verifyResponse = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp,
                }),
            });

            if (!verifyResponse.ok) {
                setError('Invalid or expired OTP.');
                return;
            }

            const registerResponse = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
                credentials: 'include',
            });

            if (!registerResponse.ok) {
                setError(await registerResponse.text());
                return;
            }

            setShowOtp(false);
            setOtp('');
            setIsActive(false);
            setForgotSuccess('Account created successfully. Please sign in.');
        } catch {
            setError('Something went wrong during verification.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (event) => {
        event.preventDefault();
        setForgotError('');
        setForgotSuccess('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(forgotForm),
            });

            if (!response.ok) {
                setForgotError(await response.text());
                return;
            }

            setForgotSuccess('Password reset successful. You can sign in now.');
            setForgotForm({ username: '', newPassword: '' });
            setShowForgotPassword(false);
        } catch {
            setForgotError('Unable to reset password right now.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (nextActive) => {
        setIsActive(nextActive);
        setShowOtp(false);
        setOtp('');
        setShowForgotPassword(false);
        resetAuthMessages();
    };

    return (
        <div className="auth-shell">
            <div className="auth-backdrop" />
            <div className="auth-layout">
                <aside className="auth-showcase">
                    <div className="auth-brand-pill">Finance Manager</div>
                    <h1>Track money with clarity, not clutter.</h1>
                    <p>
                        A cleaner dashboard for budgets, goals, savings, and smarter financial
                        decisions.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature-card">
                            <FaWallet />
                            <div>
                                <strong>Cash flow visibility</strong>
                                <span>Monitor income, expenses, and monthly balance in one place.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <FaBullseye />
                            <div>
                                <strong>Goal-first planning</strong>
                                <span>Set savings targets and track progress month by month.</span>
                            </div>
                        </div>
                        <div className="auth-feature-card">
                            <FaChartLine />
                            <div>
                                <strong>Better insights</strong>
                                <span>Spot spending patterns quickly with charts and summaries.</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="auth-panel">
                    <div className="auth-panel-header">
                        <div>
                            <span className="auth-eyebrow">
                                <FaShieldAlt /> Secure access
                            </span>
                            <h2>{isActive ? 'Create your account' : 'Welcome back'}</h2>
                            <p>
                                {isActive
                                    ? 'Start with your email and verify it using OTP.'
                                    : 'Sign in to continue managing your finances.'}
                            </p>
                        </div>

                        <div className="auth-mode-toggle">
                            <button
                                type="button"
                                className={!isActive ? 'active' : ''}
                                onClick={() => switchMode(false)}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={isActive ? 'active' : ''}
                                onClick={() => switchMode(true)}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {!isActive && !showForgotPassword && forgotSuccess && (
                        <p className="auth-message success">{forgotSuccess}</p>
                    )}

                    {!isActive ? (
                        showForgotPassword ? (
                            <form className="auth-form" onSubmit={handleForgotSubmit}>
                                <div className="auth-field">
                                    <label htmlFor="forgot-username">Username</label>
                                    <input
                                        id="forgot-username"
                                        type="text"
                                        name="username"
                                        placeholder="Enter your username"
                                        value={forgotForm.username}
                                        onChange={handleForgotChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="forgot-password">New Password</label>
                                    <input
                                        id="forgot-password"
                                        type="password"
                                        name="newPassword"
                                        placeholder="Enter a new password"
                                        value={forgotForm.newPassword}
                                        onChange={handleForgotChange}
                                        required
                                    />
                                </div>

                                {forgotError && <p className="auth-message error">{forgotError}</p>}

                                <div className="auth-actions">
                                    <button className="auth-primary-btn" type="submit" disabled={loading}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                    <button
                                        className="auth-secondary-btn"
                                        type="button"
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setForgotError('');
                                        }}
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="auth-field">
                                    <label htmlFor="login-email">Email</label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        name="username"
                                        placeholder="you@example.com"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="login-password">Password</label>
                                    <div className="auth-password-wrap">
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="auth-message error">{error}</p>}

                                <div className="auth-inline-actions">
                                    <button
                                        type="button"
                                        className="auth-text-btn"
                                        onClick={() => {
                                            setShowForgotPassword(true);
                                            setError('');
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                    <button className="auth-primary-btn" type="submit">
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        )
                    ) : (
                        <form className="auth-form" onSubmit={showOtp ? handleVerifyOtp : handleRegister}>
                            {!showOtp ? (
                                <>
                                    <div className="auth-field">
                                        <label htmlFor="register-name">Name</label>
                                        <input
                                            id="register-name"
                                            type="text"
                                            name="username"
                                            placeholder="Your full name"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="auth-field">
                                        <label htmlFor="register-email">Email</label>
                                        <input
                                            id="register-email"
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="auth-field">
                                        <label htmlFor="register-password">Password</label>
                                        <input
                                            id="register-password"
                                            type="password"
                                            name="password"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="auth-field">
                                    <label htmlFor="register-otp">OTP Verification Code</label>
                                    <input
                                        id="register-otp"
                                        type="text"
                                        name="otp"
                                        placeholder="Enter the OTP sent to your email"
                                        value={otp}
                                        onChange={(event) => setOtp(event.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {showOtp && (
                                <div className="auth-otp-note">
                                    We sent a verification code to <strong>{formData.email}</strong>.
                                </div>
                            )}

                            {error && <p className="auth-message error">{error}</p>}

                            <div className="auth-actions">
                                <button className="auth-primary-btn" type="submit" disabled={loading}>
                                    {loading
                                        ? showOtp
                                            ? 'Verifying...'
                                            : 'Sending OTP...'
                                        : showOtp
                                        ? 'Verify OTP'
                                        : 'Continue'}
                                </button>
                                {showOtp && (
                                    <button
                                        className="auth-secondary-btn"
                                        type="button"
                                        onClick={() => setShowOtp(false)}
                                    >
                                        Back
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Login;
