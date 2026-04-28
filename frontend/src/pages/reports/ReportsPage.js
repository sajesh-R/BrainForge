import React, { useState, useEffect } from 'react';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import * as reportApi from '../../api/report/report';
import '../../assets/styles/reports/Reports.css';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportApi.getAllReports();
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching reports:", error);
            setLoading(false);
        }
    };

    const handleViewDetails = async (report) => {
        try {
            setSelectedReport(report);
            setReportData(null); // clear old data

            if (report.type === 'Enrollment') {
                const response = await reportApi.getEnrollmentReportData();
                setReportData(response.data);
            } else if (report.type === 'Submission') {
                const response = await reportApi.getAssignmentReportData();
                setReportData(response.data);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
        }
    };

    const handleCloseDetails = () => {
        setSelectedReport(null);
        setReportData(null);
    };

    if (loading) return <div className="loading-screen">Loading System Reports...</div>;

    return (
        <DiscoveryLayout>
            <div className="reports-container">
                <header className="reports-header">
                    <h1 className="gradient-text">Reports</h1>
                    <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '1.1rem' }}>
                        View aggregated data related to course enrollments and assignment submissions.
                    </p>
                </header>

                <div className="reports-grid">
                    {reports.length > 0 ? (
                        reports.map(report => (
                            <div key={report._id} className="report-card" onClick={() => handleViewDetails(report)}>
                                <div className="report-icon-wrapper">
                                    <i className={`fas ${report.type === 'Enrollment' ? 'fa-users' : 'fa-upload'}`}></i>
                                </div>
                                <h3 className="report-title">{report.title}</h3>
                                <div className="report-actions" style={{ marginTop: '20px' }}>
                                    <button
                                        className="report-btn report-btn-download" style={{ width: '100%' }}
                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(report); }}
                                    >
                                        View Report Data
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: '#f9fafb', borderRadius: '32px', border: '1px dashed #e5e7eb' }}>
                            <i className="fas fa-folder-open" style={{ fontSize: '3.5rem', color: '#e5e7eb', marginBottom: '24px', display: 'block' }}></i>
                            <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>No reports generated yet.</p>
                        </div>
                    )}
                </div>

                {/* Report Details View (Modal for Admin Reports) */}
                {selectedReport && (
                    <div className="report-modal-overlay" onClick={handleCloseDetails}>
                        <div className="report-modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            <button className="close-modal" onClick={handleCloseDetails}>&times;</button>

                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '24px',
                                    background: '#F5F3FF',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '24px',
                                    border: '1px solid #ede9fe'
                                }}>
                                    <i className={`fas ${selectedReport.type === 'Enrollment' ? 'fa-users' : 'fa-upload'}`} style={{ color: '#A855F7', fontSize: '2rem' }}></i>
                                </div>
                                <h2 style={{ color: '#111827', marginBottom: '8px', fontSize: '1.75rem', fontWeight: '800' }}>{selectedReport.title}</h2>
                                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Data generated at: {new Date().toLocaleString()}</p>
                            </div>

                            <div className="report-detail-info" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                {!reportData ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <p style={{ color: '#6b7280' }}>Fetching report data...</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {/* ENROLLMENT REPORT RENDERING */}
                                        {selectedReport.type === 'Enrollment' && reportData.map((data, index) => (
                                            <div key={index} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
                                                <h3 style={{ color: '#374151', marginBottom: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Course: {data.course}</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {data.enrolledUsers.map((user, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                            <span style={{ fontWeight: '600', color: '#111827' }}>{user.name}</span>
                                                            <span style={{ color: '#6b7280' }}>{user.email}</span>
                                                        </div>
                                                    ))}
                                                    {data.enrolledUsers.length === 0 && <p style={{ color: '#9ca3af' }}>No users enrolled.</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {/* SUBMISSION REPORT RENDERING */}
                                        {selectedReport.type === 'Submission' && reportData.map((data, index) => (
                                            <div key={index} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px' }}>
                                                <h3 style={{ color: '#374151', marginBottom: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Assignment: {data.assignment}</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {data.submissions.map((sub, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: '600', color: '#111827' }}>{sub.user?.name || 'Unknown User'}</span>
                                                                <span style={{ color: '#A855F7', fontSize: '0.85rem', fontWeight: '500', marginTop: '4px' }}>File: {sub.originalName}</span>
                                                            </div>
                                                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(sub.submittedAt).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    {data.submissions.length === 0 && <p style={{ color: '#9ca3af' }}>No submissions yet.</p>}
                                                </div>
                                            </div>
                                        ))}

                                        {reportData.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '16px' }}>
                                                <p style={{ color: '#6b7280' }}>No data available for this report type.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DiscoveryLayout>
    );
};

export default ReportsPage;
