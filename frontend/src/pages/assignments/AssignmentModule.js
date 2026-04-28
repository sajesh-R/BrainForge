import React, { useState, useEffect } from 'react';
import {
    createAssignment,
    getAssignmentsByCourse,
    submitAssignment,
    getSubmissionsForAssignment,
    downloadSubmission
} from '../../api/assignment/assignment';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/assignment/AssignmentModule.css';

const AssignmentModule = ({ courseId }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New assignment form state
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueDate: ''
    });

    // Submission states
    const [submissionFiles, setSubmissionFiles] = useState({});
    const [submittingId, setSubmittingId] = useState(null);
    const [showingSubmissionsFor, setShowingSubmissionsFor] = useState(null);
    const [currentSubmissions, setCurrentSubmissions] = useState([]);

    useEffect(() => {
        if (courseId) {
            fetchAssignments();
        }
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const data = await getAssignmentsByCourse(courseId);
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await createAssignment({
                ...newAssignment,
                courseId
            });
            setMessage('Assignment created successfully!');
            setNewAssignment({ title: '', description: '', dueDate: '' });
            fetchAssignments();
            setTimeout(() => {
                setIsModalOpen(false);
                setMessage('');
            }, 1500);
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Failed to create assignment';
            setMessage(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, assignmentId) => {
        setSubmissionFiles({
            ...submissionFiles,
            [assignmentId]: e.target.files[0]
        });
    };

    const handleSubmitAssignment = async (e, assignmentId) => {
        e.preventDefault();
        const file = submissionFiles[assignmentId];
        if (!file) {
            alert('Please select a file to submit');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', assignmentId);
        formData.append('userId', user?.id || user?._id);

        setSubmittingId(assignmentId);
        try {
            await submitAssignment(formData);
            alert('Assignment submitted successfully!');
            const newFiles = { ...submissionFiles };
            delete newFiles[assignmentId];
            setSubmissionFiles(newFiles);
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="assignment-module">
            <div className="assignment-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0 }}>Assignments</h3>
                {user && user.role === 'Admin' && (
                    <button className="btn-primary-action" onClick={() => setIsModalOpen(true)}>
                        + Create Assignment
                    </button>
                )}
            </div>

            <div className="assignment-list">
                {assignments.length === 0 ? (
                    <p className="no-docs">No assignments posted for this course yet.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment._id} className="assignment-card">
                            <div className="assignment-header">
                                <h4>{assignment.title}</h4>
                                <span className="due-date">Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                            </div>
                            <p className="assignment-desc">{assignment.description}</p>

                            {user && user.role === 'Student' && (
                                <div className="submission-section">
                                    <form className="submission-form" onSubmit={(e) => handleSubmitAssignment(e, assignment._id)}>
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id={`file-${assignment._id}`}
                                                className="file-input"
                                                onChange={(e) => handleFileChange(e, assignment._id)}
                                            />
                                            <label htmlFor={`file-${assignment._id}`} className="file-label">
                                                {submissionFiles[assignment._id] ? submissionFiles[assignment._id].name : 'Select submission file...'}
                                            </label>
                                        </div>
                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            disabled={submittingId === assignment._id}
                                        >
                                            {submittingId === assignment._id ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {user && user.role === 'Admin' && (
                                <div className="admin-actions" style={{ marginTop: '1rem' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                                        onClick={async () => {
                                            try {
                                                const subs = await getSubmissionsForAssignment(assignment._id);
                                                setCurrentSubmissions(subs);
                                                setShowingSubmissionsFor(assignment);
                                            } catch (err) {
                                                alert('Failed to fetch submissions');
                                            }
                                        }}
                                    >
                                        View Submissions
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Assignment Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>New Assignment</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            {message && (
                                <p className={`msg ${message.toLowerCase().includes('success') ? 'success' : 'error'}`} style={{ marginBottom: '16px' }}>
                                    {message}
                                </p>
                            )}

                            <form id="create-assignment-form" onSubmit={handleCreateAssignment}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.8rem' }}>TITLE</label>
                                    <input
                                        type="text"
                                        placeholder="Enter assignment title"
                                        value={newAssignment.title}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                        className="modal-input"
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.8rem' }}>DUE DATE</label>
                                    <input
                                        type="datetime-local"
                                        value={newAssignment.dueDate}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                        className="modal-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '0.8rem' }}>DESCRIPTION</label>
                                    <textarea
                                        placeholder="Detail instructions for students..."
                                        rows="4"
                                        value={newAssignment.description}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                        className="modal-textarea"
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="submit"
                                form="create-assignment-form"
                                className="btn-modal-submit"
                                disabled={loading}
                            >
                                {loading ? 'CREATING...' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Submissions Modal */}
            {showingSubmissionsFor && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowingSubmissionsFor(null); }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Submissions: {showingSubmissionsFor.title}</h2>
                            <button className="modal-close" onClick={() => setShowingSubmissionsFor(null)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '20px' }}>
                            {currentSubmissions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                                    <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '16px', color: '#e5e7eb' }}></i>
                                    <p>No submissions have been made yet.</p>
                                </div>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {currentSubmissions.map((sub, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '1rem' }}>{sub.user?.name || 'Unknown Student'}</h4>
                                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Submitted: {new Date(sub.createdAt).toLocaleString()}</p>
                                                <p style={{ margin: '4px 0 0 0', color: '#A855F7', fontSize: '0.85rem', fontWeight: '500' }}>File: {sub.originalName}</p>
                                            </div>
                                            <button
                                                className="btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                                onClick={async () => {
                                                    try {
                                                        const res = await downloadSubmission(sub._id);
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', sub.originalName);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        console.error("Download failed:", err);
                                                        alert("Failed to download file.");
                                                    }
                                                }}
                                            >
                                                Download
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentModule;
