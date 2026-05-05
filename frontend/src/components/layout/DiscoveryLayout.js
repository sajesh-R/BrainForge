import React, { useState, createContext, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createCourse } from '../../api/course/course';
import '../../assets/styles/course/Courses.css';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

const DiscoveryLayout = ({ children, onCourseCreated }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    // Global Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', videoUrl: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.title || !formData.description) {
            setFormError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCourse({
                ...formData,
                instructorId: user?.id || user?._id
            });
            setFormSuccess('Course created successfully!');

            if (onCourseCreated) onCourseCreated();
            setTimeout(() => {
                setIsModalOpen(false);
                setFormData({ title: '', description: '', videoUrl: '' });
                setFormSuccess('');
                setIsSubmitting(false);
            }, 1500);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create course');
            setIsSubmitting(false);
        }
    };

    const openCreateModal = () => setIsModalOpen(true);

    return (
        <ModalContext.Provider value={{ openCreateModal }}>
            <div className="discovery-layout-top">
                <header className="discovery-navbar">
                    <div className="nav-left">
                        <Link to="/dashboard" className="nav-brand">BrainForge</Link>
                    </div>

                    <nav className="nav-center">
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
                        <Link to="/courses" className={`nav-link ${isActive('/courses')}`}>Courses</Link>
                        <Link to="/smart" className={`nav-link ${isActive('/smart')}`}>AI Hub</Link>
                        <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>Messages</Link>
                        <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>Reports</Link>
                    </nav>

                    <div className="nav-right">
                        <div className="nav-search">
                            <span className="nav-search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="nav-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>

                        <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
                    </div>
                </header>

                <main className="discovery-main-top">
                    {children}
                </main>

                {/* Create Course Modal */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Create New Course</h2>
                                <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                            </div>

                            <div className="modal-body">
                                {formError && <p className="msg error" style={{ marginBottom: '16px' }}>{formError}</p>}
                                {formSuccess && <p className="success-message" style={{ marginBottom: '16px' }}>{formSuccess}</p>}

                                <form id="create-course-form" onSubmit={handleCreateCourse}>
                                    <div className="form-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="Enter course title"
                                            value={formData.title}
                                            onChange={handleFormChange}
                                            className="modal-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                        <textarea
                                            name="description"
                                            placeholder="Describe the course content..."
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            className="modal-textarea"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Video URL (Optional)</label>
                                        <input
                                            type="text"
                                            name="videoUrl"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.videoUrl}
                                            onChange={handleFormChange}
                                            className="modal-input"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="submit"
                                    form="create-course-form"
                                    className="btn-modal-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'CREATING...' : 'OK'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ModalContext.Provider>
    );
};

export default DiscoveryLayout;
