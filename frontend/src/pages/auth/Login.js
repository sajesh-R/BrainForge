import React, { useState } from 'react';
import { loginUser } from '../../api/auth/auth';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/auth/Auth.css';

import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const { saveAuth } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginUser(form);
            // Save token and user to context + localStorage
            saveAuth(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-brand">
                <h1>BrainForge</h1>
                <p>ACADEMIC LEARNING MANAGEMENT SYSTEM</p>
            </div>
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="subtitle">Sign in to your BrainForge account</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <p className="msg error">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <p className="switch-link">
                    Don't have an account?{' '}
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
