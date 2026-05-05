import React, { useState, useEffect } from 'react';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import * as smartApi from '../../api/smart/smart';
import '../../assets/styles/smart/SmartDashboard.css';

const SmartDashboard = () => {
    const [user, setUser] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [atRiskUsers, setAtRiskUsers] = useState([]);
    const [taggedDocs, setTaggedDocs] = useState([]);
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [query, setQuery] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, timelineRes, leaderRes, remindersRes, docsRes] = await Promise.all([
                    smartApi.getUserProfile(),
                    smartApi.getTimeline(),
                    smartApi.getLeaderboard(),
                    smartApi.getReminders(),
                    smartApi.getTaggedDocuments()
                ]);

                setUser(userRes.data.user || userRes.data);
                setTimeline(timelineRes.data);
                setLeaderboard(leaderRes.data);
                setReminders(remindersRes.data);
                setTaggedDocs(docsRes.data);

                const profileData = userRes.data.user || userRes.data;
                if (profileData.role === 'Admin') {
                    const atRiskRes = await smartApi.getAtRiskUsers();
                    setAtRiskUsers(atRiskRes.data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssistantQuery = async (e) => {
        e.preventDefault();
        try {
            const res = await smartApi.askAssistant(query);
            setAssistantResponse(res.data.response);
            setQuery('');
        } catch (error) {
            console.error('Error with assistant:', error);
        }
    };

    if (loading) return <div className="loading">Loading Smart Features...</div>;

    const profileData = user?.user || user;

    return (
        <DiscoveryLayout>
            <div className="smart-dashboard-container">
                <header className="discovery-header">
                    <div className="discovery-header-info">
                        <h1>Smart Features Hub</h1>
                        <p className="subtitle">AI-powered insights and course analytics</p>
                    </div>
                    <div className="user-stats">
                        <div className="stat-card">
                            <span className="stat-label">Your Points</span>
                            <span className="stat-value">{profileData?.points || 0} XP</span>
                        </div>
                    </div>
                </header>

                <div className="smart-grid">
                    {/* 1. Smart Assistant */}
                    <section className="smart-card assistant-section">
                        <div className="card-header">
                            <h3>Smart Assistant</h3>
                        </div>
                        <div className="assistant-box">
                            <div className="response-area">
                                {assistantResponse ? (
                                    <div className="response-bubble">
                                        <p>{assistantResponse}</p>
                                    </div>
                                ) : (
                                    <p className="placeholder">Ask me about your deadlines, points, or courses!</p>
                                )}
                            </div>
                            <form onSubmit={handleAssistantQuery} className="assistant-input-group">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type your question..."
                                    required
                                />
                                <button type="submit">Ask AI</button>
                            </form>
                        </div>
                    </section>

                    {/* 5. Leaderboard */}
                    <section className="smart-card leaderboard-section">
                        <div className="card-header">
                            <h3>Global Leaderboard</h3>
                        </div>
                        <div className="leaderboard-list">
                            {leaderboard.map((item, index) => (
                                <div key={item._id} className="leader-item">
                                    <span className="rank">{index + 1}</span>
                                    <div className="leader-info">
                                        <span className="name">{item.name}</span>
                                    </div>
                                    <span className="points">{item.points} XP</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Deadlines & Reminders */}
                    <section className="smart-card reminders-section">
                        <div className="card-header">
                            <h3>Upcoming Deadlines</h3>
                        </div>
                        {reminders.length > 0 ? (
                            <div className="reminder-list">
                                {reminders.map((r, i) => (
                                    <div key={i} className="reminder-item">
                                        <div className="reminder-info">
                                            <span className="reminder-title">{r.title}</span>
                                            <span className="reminder-date">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`reminder-days ${r.daysLeft <= 1 ? 'urgent' : ''}`}>
                                            {r.daysLeft === 0 ? 'Due Today' : `${r.daysLeft}d left`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No immediate deadlines.</p>
                            </div>
                        )}
                    </section>

                    {/* 4. Activity Timeline */}
                    <section className="smart-card timeline-section">
                        <div className="card-header">
                            <h3>Recent Activity</h3>
                        </div>
                        <div className="timeline-list">
                            {timeline.length > 0 ? (
                                timeline.map((log) => (
                                    <div key={log._id} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <span className="action">{log.action}</span>
                                                <span className="time">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="details">{log.details}</p>
                                            {log.pointsEarned > 0 && (
                                                <span className="xp-gain">+{log.pointsEarned} XP</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-text">No recent activity found.</p>
                            )}
                        </div>
                    </section>

                    {/* 2. Predictive Progress (Admin Only) */}
                    {profileData?.role === 'Admin' && (
                        <section className="smart-card at-risk-section">
                            <div className="card-header">
                                <h3>Predictive progress</h3>
                            </div>
                            <div className="at-risk-list">
                                {atRiskUsers.length > 0 ? (
                                    atRiskUsers.map((item, i) => (
                                        <div key={i} className="at-risk-item">
                                            <div className="user-info">
                                                <span className="user-name">{item.user.name}</span>
                                                <span className="risk-reason">{item.reason}</span>
                                            </div>
                                            <span className="risk-badge">{item.riskLevel} RISK</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state success">
                                        <p>All students are currently meeting performance benchmarks.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* 6. Intelligent Tagging */}
                    <section className="smart-card tagging-section">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <h3>Intelligent Tagging</h3>
                            <input 
                                type="text"
                                placeholder="Filter by tag (PDF, Task...)"
                                value={tagSearchQuery}
                                onChange={(e) => setTagSearchQuery(e.target.value)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    fontSize: '0.8rem',
                                    width: '180px'
                                }}
                            />
                        </div>
                        <div className="tagged-docs-list">
                            {taggedDocs
                                .filter(doc => 
                                    doc.fileName.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
                                    doc.tags?.some(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                                )
                                .length > 0 ? (
                                    taggedDocs
                                        .filter(doc => 
                                            doc.fileName.toLowerCase().includes(tagSearchQuery.toLowerCase()) ||
                                            doc.tags?.some(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                                        )
                                        .map((doc) => (
                                    <div key={doc._id} className="tagged-doc-item" style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <span className="doc-name" style={{ fontWeight: 700, display: 'block', color: '#111827' }}>{doc.fileName}</span>
                                                <span className="course-name" style={{ fontSize: '0.8rem', color: '#6b7280' }}>Course: {doc.courseId?.title}</span>
                                            </div>
                                            <div className="tags-badges" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                {doc.tags?.map((tag, idx) => (
                                                    <span key={idx} className="xp-gain" style={{ margin: 0, fontSize: '9px' }}>{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-text">No matching tagged documents.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </DiscoveryLayout>
    );
};

export default SmartDashboard;
