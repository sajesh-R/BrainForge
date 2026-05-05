import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../api/course/course';
import { useAuth } from '../../context/AuthContext';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import '../../assets/styles/course/Courses.css';

const CreateCourse = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { title, description, videoUrl } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !description) {
            setError('Please fill in all fields');
            return;
        }

        try {
            await createCourse({
                ...formData,
                instructorId: user?.id || user?._id || 'mock-id'
            });
            setSuccess('Course created successfully!');
            setTimeout(() => navigate('/courses'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course');
        }
    };

    return (
        <DiscoveryLayout>
            <header className="discovery-header">
                <div className="discovery-header-info">
                    <h1>Create New Course</h1>
                    <p>Ready to share your knowledge? Fill in the details below to publish your masterclass.</p>
                </div>
            </header>
            <div className="course-form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>

                {error && <p className="msg error">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <form onSubmit={onSubmit}>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px', display: 'block' }}>Course Title</label>
                        <input
                            type="text"
                            name="title"
                            className="search-input"
                            style={{ paddingLeft: '20px' }}
                            value={title}
                            onChange={onChange}
                            placeholder="e.g. Advanced UI Design Systems"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ color: '#fff', fontSize: '1rem' }}>Detailed Description</label>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{description.length} / 1000</span>
                        </div>
                        <textarea
                            name="description"
                            className="search-input"
                            style={{ paddingLeft: '20px', minHeight: '200px', resize: 'vertical', paddingTop: '16px' }}
                            value={description}
                            onChange={onChange}
                            placeholder="Tell your students what exciting skills they'll master in this course..."
                            maxLength="1000"
                            required
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginTop: '32px' }}>
                        <label style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px', display: 'block' }}>Video URL (YouTube/Vimeo)</label>
                        <input
                            type="text"
                            name="videoUrl"
                            className="search-input"
                            style={{ paddingLeft: '20px' }}
                            value={videoUrl}
                            onChange={onChange}
                            placeholder="e.g. https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    <div style={{ marginTop: '48px', display: 'flex', gap: '20px' }}>
                        <button type="submit" className="btn-sidebar-create" style={{ padding: '16px 32px', width: 'auto', minWidth: '200px' }}>
                            Publish Course
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/courses')}
                            className="btn-secondary"
                            style={{ margin: 0 }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </DiscoveryLayout>
    );
};

export default CreateCourse;
