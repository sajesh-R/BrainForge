import React, { useState, useEffect } from 'react';
import { uploadDocument, getDocumentsByCourse, downloadDocument } from '../../api/document/document';
import { useAuth } from '../../context/AuthContext';
import '../../assets/styles/documents/DocumentModule.css';

const DocumentModule = ({ courseId }) => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [courseId]);

    const fetchDocuments = async () => {
        try {
            const data = await getDocumentsByCourse(courseId);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const filteredDocuments = documents.filter(doc => 
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);
        formData.append('userId', user?.id || user?._id);

        setLoading(true);
        setMessage('');
        try {
            await uploadDocument(formData);
            setMessage('Document uploaded successfully');
            setFile(null);
            fetchDocuments();
            // Reset file input
            document.getElementById('file-upload').value = '';
        } catch (error) {
            setMessage(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="document-module">
            <div className="doc-module-header">
                <h3>Course Documents</h3>
                <div className="doc-search-wrapper">
                    <input 
                        type="text" 
                        placeholder="Search by name or tag (e.g. PDF, Task)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="doc-search-input"
                    />
                </div>
            </div>

            {user && user.role === 'Admin' && (
                <form className="upload-form" onSubmit={handleUpload}>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <label htmlFor="file-upload" className="file-label">
                            <span style={{ marginRight: '8px' }}>📂</span>
                            {file ? file.name : 'Choose a file...'}
                        </label>
                    </div>
                    <button type="submit" disabled={loading} className="upload-btn">
                        {loading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </form>
            )}

            {message && <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}

            <div className="document-list">
                {filteredDocuments.length === 0 ? (
                    <p className="no-docs">No matching documents found.</p>
                ) : (
                    <ul>
                        {filteredDocuments.map((doc) => (
                            <li key={doc._id} className="document-item">
                                <div className="doc-info">
                                    <div className="doc-header">
                                        <span className="doc-name">{doc.fileName}</span>
                                        {doc.tags && doc.tags.map((tag, idx) => (
                                            <span key={idx} className="badge badge-purple" style={{ marginLeft: '8px', fontSize: '10px' }}>{tag}</span>
                                        ))}
                                    </div>
                                    <span className="doc-meta">
                                        Uploaded by: {doc.userId?.name || 'Unknown'} | {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => downloadDocument(doc._id, doc.fileName)}
                                    className="download-btn"
                                >
                                    Download / View
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DocumentModule;
