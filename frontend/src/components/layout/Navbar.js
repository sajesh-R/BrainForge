import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/layout/Navbar.css';

const Navbar = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">BrainForge</Link>
            </div>
            <ul className="nav-links">
                {token ? (
                    <>
                        <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                        <li><Link to="/courses" className={isActive('/courses')}>Courses</Link></li>
                        <li><Link to="/smart" className={isActive('/smart')}>AI Hub</Link></li>
                        <li><Link to="/chat" className={isActive('/chat')}>Messages</Link></li>
                        <li><Link to="/reports" className={isActive('/reports')}>Reports</Link></li>
                        <li><button onClick={handleLogout} className="btn-logout-nav">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login" className={isActive('/login')}>Login</Link></li>
                        <li><Link to="/register" className={isActive('/register')}>Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
