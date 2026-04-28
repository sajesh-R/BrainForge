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
    const [query, setQuery] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, timelineRes, leaderRes, remindersRes] = await Promise.all([
                    smartApi.getUserProfile(),
                    smartApi.getTimeline(),
                    smartApi.getLeaderboard(),
                    smartApi.getReminders()
                ]);

                setUser(userRes.data.user || userRes.data);
                setTimeline(timelineRes.data);
                setLeaderboard(leaderRes.data);
                setReminders(remindersRes.data);

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
                <header className="dashboard-header">
                    <h1 className="gradient-text">Smart Features Hub</h1>
                    <div className="user-stats">
                        <span className="badge badge-purple">Points: {profileData?.points || 0} XP</span>
                    </div>
                </header>

                <div className="smart-grid">
                    {/* 1. Smart Assistant */}
                    <section className="smart-card assistant-section">
                        <h3>Smart Assistant</h3>
                        <div className="assistant-box">
                            <div className="response-area">
                                {assistantResponse ? (
                                    <p className="response">{assistantResponse}</p>
                                ) : (
                                    <p className="placeholder">Ask me anything about your progress!</p>
                                )}
                            </div>
                            <form onSubmit={handleAssistantQuery}>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g. How to get points?"
                                    required
                                />
                                <button type="submit">Ask</button>
                            </form>
                        </div>
                    </section>

                    {/* 5. Leaderboard */}
                    <section className="smart-card leaderboard-section">
                        <h3>Leaderboard</h3>
                        <div className="leaderboard-list">
                            {leaderboard.map((item, index) => (
                                <div key={item._id} className="leader-item">
                                    <span className="rank">#{index + 1}</span>
                                    <span className="name">{item.name}</span>
                                    <span className="points">{item.points} XP</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Deadlines & Reminders */}
                    <section className="smart-card reminders-section">
                        <h3>Upcoming Reminders</h3>
                        {reminders.length > 0 ? (
                            <ul className="reminder-list">
                                {reminders.map((r, i) => (
                                    <li key={i} className="reminder-item">{r}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No immediate deadlines. Keep it up!</p>
                        )}
                    </section>

                    {/* 4. Activity Timeline */}
                    <section className="smart-card timeline-section">
                        <h3>Activity Timeline</h3>
                        <div className="timeline-list">
                            {timeline.map((log) => (
                                <div key={log._id} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="action">{log.action}</span>
                                        <p className="details">{log.details}</p>
                                        <span className="time">{new Date(log.createdAt).toLocaleDateString()}</span>
                                        {log.pointsEarned > 0 && (
                                            <span className="points-badge">+{log.pointsEarned} XP</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Predictive Progress (Admin Only) */}
                    {profileData?.role === 'Admin' && (
                        <section className="smart-card at-risk-section">
                            <h3>At-Risk Users (AI Prediction)</h3>
                            <div className="at-risk-list">
                                {atRiskUsers.length > 0 ? (
                                    atRiskUsers.map((item, i) => (
                                        <div key={i} className="at-risk-item">
                                            <span className="user-name">{item.user.name}</span>
                                            <span className="badge badge-red">{item.reason}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>All students are on track!</p>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </DiscoveryLayout>
    );
};

export default SmartDashboard;
