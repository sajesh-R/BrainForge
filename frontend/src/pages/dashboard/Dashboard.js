import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import * as dashboardApi from '../../api/dashboard/dashboard';
import '../../assets/styles/dashboard/Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({ courses: 0, enrollment: 0, assignments: 0 });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [timeline, setTimeline] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coursesRes, enrolledRes, assignmentsRes, notifsRes, timelineRes] = await Promise.all([
                    dashboardApi.getCourses(),
                    dashboardApi.getEnrolledCourses(),
                    dashboardApi.getAssignments(),
                    dashboardApi.getNotifications(),
                    dashboardApi.getTimeline()
                ]);

                setStats({
                    courses: coursesRes.data.count || 0,
                    enrollment: enrolledRes.data.count || 0,
                    assignments: assignmentsRes.data.length || 0
                });

                setEnrolledCourses(enrolledRes.data.data || []);
                setAssignments(assignmentsRes.data || []);
                setNotifications(notifsRes.data || []);

                setTimeline(timelineRes.data || []);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleMarkRead = async (notifId) => {
        try {
            await dashboardApi.markNotificationRead(notifId);
            setNotifications(notifications.map(n =>
                n._id === notifId ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    useEffect(() => {
        // Handle scrolling to hash (#id) if it exists in URL
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [loading, location.hash]);

    if (loading) return <div className="loading-screen">Preparing your dashboard...</div>;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <DiscoveryLayout>
            <div className="dashboard-container">
                {/* Header Section */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1 className="gradient-text">Welcome Back!</h1>
                        <p className="stat-label">Here's what's happening with your courses today.</p>
                    </div>
                    <div className="header-right">
                        <div className="notification-bell" onClick={() => setShowNotifs(!showNotifs)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}

                            {showNotifs && (
                                <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="notification-header">Notifications</div>
                                    {notifications.length > 0 ? (
                                        notifications.map(n => (
                                            <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleMarkRead(n._id)}>
                                                <strong>{n.title}</strong>
                                                <p>{n.message}</p>
                                                <span className="event-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="notif-item">No new notifications</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="user-profile-summary">
                            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                            <button className="btn-logout" onClick={logout}>Logout</button>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="dashboard-grid">
                    <div className="smart-card stat-card">
                        <div>
                            <span className="stat-label">Total Courses</span>
                            <div className="stat-value">{stats.courses}</div>
                        </div>
                        <div className="item-icon" style={{ background: '#E0E7FF', color: '#4338CA' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        </div>
                    </div>
                    <div className="smart-card stat-card">
                        <div>
                            <span className="stat-label">Enrolled</span>
                            <div className="stat-value">{stats.enrollment}</div>
                        </div>
                        <div className="item-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                        </div>
                    </div>
                    <div className="smart-card stat-card">
                        <div>
                            <span className="stat-label">Assignments</span>
                            <div className="stat-value">{stats.assignments}</div>
                        </div>
                        <div className="item-icon" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>

                    {/* Enrolled Courses */}
                    <div className="smart-card list-card">
                        <div className="card-header">
                            <h3>Enrolled Courses</h3>
                            <Link to="/courses" className="btn-view-all">See All</Link>
                        </div>
                        <div className="data-list">
                            {enrolledCourses.length > 0 ? (
                                enrolledCourses.map(course => (
                                    <Link to={`/courses/${course._id}`} key={course._id} className="data-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="item-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                                        </div>
                                        <div className="item-info">
                                            <h4>{course.title}</h4>
                                            <p>{course.description.substring(0, 60)}...</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="stat-label">No courses enrolled yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Assignments */}
                    <div id="assignments-section" className="smart-card list-card">
                        <div className="card-header">
                            <h3>Upcoming Assignments</h3>
                        </div>
                        <div className="data-list">
                            {assignments.length > 0 ? (
                                assignments.map(asm => (
                                    <Link to={`/courses/${asm.course?._id}/assignments`} key={asm._id} className="data-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="item-icon" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        </div>
                                        <div className="item-info">
                                            <h4>{asm.title}</h4>
                                            <p>Due: {new Date(asm.dueDate).toLocaleDateString()} • {asm.course?.title}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="stat-label">No pending assignments.</p>
                            )}
                        </div>
                    </div>





                    {/* Activity Timeline */}
                    <div className="smart-card list-card">
                        <div className="card-header">
                            <h3>Activity Timeline</h3>
                        </div>
                        <div className="timeline">
                            {timeline.length > 0 ? (
                                timeline.slice(0, 5).map(log => (
                                    <div key={log._id} className="timeline-event">
                                        <div className="item-info">
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{log.action}</h4>
                                            <p style={{ fontSize: '0.75rem' }}>{log.details}</p>
                                            <span className="event-time">{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="stat-label">No activity logged yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DiscoveryLayout>
    );
};

export default Dashboard;
