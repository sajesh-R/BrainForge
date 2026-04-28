import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllCourses } from '../../api/course/course';
import DiscoveryLayout, { useModal } from '../../components/layout/DiscoveryLayout';
import '../../assets/styles/course/Courses.css';

const CourseListContent = ({ courses, loading, error, openCreateModal, searchQuery }) => {
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="courses-container"><div className="loader">Loading Discovery Page...</div></div>;

    return (
        <>
            <header className="discovery-header">
                <div className="discovery-header-info">
                    <h1>Discovery</h1>
                    <p>Expand your horizons with our latest professional certifications and expert-led masterclasses.</p>
                </div>
                <div className="discovery-header-actions">
                    <button
                        onClick={openCreateModal}
                        className="btn-sidebar-create"
                        style={{ width: 'auto', padding: '12px 24px' }}
                    >
                        + Create New Course
                    </button>
                </div>
            </header>

            {error && <p className="msg error">{error}</p>}

            <div className="course-grid">
                {filteredCourses.map((course) => (
                    <div key={course._id} className="course-card">
                        <div className="course-card-image">
                            <div className="course-card-badge">Course</div>
                            <img
                                src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                                alt={course.title}
                            />
                        </div>
                        <div className="course-card-content">
                            <h3 className="course-title">{course.title}</h3>
                            <p className="course-description">
                                {course.description || "Learn the fundamental principles and advanced techniques in this comprehensive masterclass."}
                            </p>
                        </div>
                        <div className="course-card-footer">
                            <div className="instructor-info">
                                <div className="instructor-avatar">
                                    {course.instructor?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="instructor-details">
                                    <span className="instructor-name">{course.instructor?.name || 'Academic Team'}</span>
                                    <span className="course-date">
                                        {new Date(course.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <Link to={`/courses/${course._id}`} className="btn-view-details">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && !error && (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#3A4B41' }}>
                    <p>No courses found. Try different keywords!</p>
                </div>
            )}

        </>
    );
};

// Internal component to use hook
const CourseListInner = ({ fetchCourses, courses, loading, error }) => {
    const { openCreateModal } = useModal();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';

    return <CourseListContent
        courses={courses}
        loading={loading}
        error={error}
        openCreateModal={openCreateModal}
        searchQuery={searchQuery}
    />;
}

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCourses = useCallback(async () => {
        try {
            const res = await getAllCourses();
            setCourses(res.data);
        } catch (err) {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return (
        <DiscoveryLayout onCourseCreated={fetchCourses}>
            <CourseListInner fetchCourses={fetchCourses} courses={courses} loading={loading} error={error} />
        </DiscoveryLayout>
    );
};

export default CourseList;
