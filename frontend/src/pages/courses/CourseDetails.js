import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, enrollInCourse } from '../../api/course/course';
import { useAuth } from '../../context/AuthContext';
import DocumentModule from '../documents/DocumentModule';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import '../../assets/styles/course/Courses.css';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await getCourseById(id);
                setCourse(res.data);
                setIsEnrolled(res.data.isEnrolled);
            } catch (err) {
                setError('Failed to fetch course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setEnrolling(true);
        setError('');
        try {
            await enrollInCourse(id);
            setSuccess('Successfully enrolled!');
            setIsEnrolled(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="courses-container"><div className="loader">Loading Course...</div></div>;
    if (!course) return <div className="courses-container"><div className="msg error">Course not found.</div></div>;

    const heroImage = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80`;

    return (
        <DiscoveryLayout>
            <div className="discovery-main-top" style={{ padding: '24px 40px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <button onClick={() => navigate('/courses')} className="btn-secondary" style={{ width: 'auto', padding: '10px 20px' }}>
                        &larr; Back to Catalog
                    </button>
                </div>

                <div className="course-details-hero">
                    <img src={heroImage} alt={course.title} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: '#fff' }}>
                        <span className="badge-primary" style={{ background: '#A855F7', color: '#fff', padding: '6px 16px' }}>Masterclass</span>
                        <h1 style={{ fontSize: '3.5rem', marginTop: '16px', fontWeight: '800' }}>{course.title.toLowerCase()}</h1>
                    </div>
                </div>

                <div className="course-details-grid">
                    <div className="course-main-content">
                        <div className="course-description-full">
                            <h2 style={{ fontSize: '1.8rem', color: '#111827', marginBottom: '24px' }}>Course Syllabus & Overview</h2>
                            <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.8' }}>
                                {course.description || "In this comprehensive program, you will dive deep into the core concepts and advanced methodologies required to excel in the industry. Our curriculum is designed to bridge the gap between theoretical knowledge and practical application."}
                            </p>
                        </div>

                        {course.videoUrl && (
                            <div className="course-video-container" style={{ marginTop: '40px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <h2 style={{ fontSize: '1.8rem', color: '#111827', marginBottom: '24px' }}>Course Preview</h2>
                                {course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be') ? (
                                    <iframe
                                        width="100%"
                                        height="450"
                                        src={`https://www.youtube.com/embed/${course.videoUrl.split('v=')[1] || course.videoUrl.split('/').pop()}`}
                                        title="Course Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video controls width="100%" style={{ borderRadius: '16px' }}>
                                        <source src={course.videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: '48px' }}>
                            <DocumentModule courseId={id} />
                        </div>
                    </div>

                    <aside className="course-sidebar">
                        <div className="sidebar-card">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>Expert Instructor</h3>
                            <div className="course-instructor-hero">
                                <div className="instructor-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                    {course.instructor?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="instructor-details">
                                    <span className="instructor-name">{course.instructor?.name || 'Academic Lead'}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Senior Developer</span>
                                </div>
                            </div>

                            <button
                                className="btn-primary-action"
                                style={{ width: '100%', padding: '16px', background: isEnrolled ? '#10b981' : '' }}
                                onClick={handleEnroll}
                                disabled={enrolling || success || isEnrolled}
                            >
                                {enrolling ? 'Enrolling...' : (success || isEnrolled) ? '✓ Already Enrolled' : 'Enroll Now'}
                            </button>

                            {error && <p className="msg error" style={{ marginTop: '16px' }}>{error}</p>}
                            {success && <p className="success-message" style={{ marginTop: '16px' }}>{success}</p>}
                        </div>

                        <div className="sidebar-card">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#111827' }}>Course Resources</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button className="btn-secondary" onClick={() => navigate(`/courses/${id}/assignments`)} style={{ marginTop: 0 }}>
                                    📝 View Assignments
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DiscoveryLayout>
    );
};

export default CourseDetails;
