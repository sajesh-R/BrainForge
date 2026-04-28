import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessagesByCourse, sendMessage } from '../../api/chat/chat';
import { useAuth } from '../../context/AuthContext';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import '../../assets/styles/chat/ChatWindow.css';

const ChatWindow = ({ courseId: propCourseId }) => {
    const { id: paramId } = useParams();
    const courseId = propCourseId || paramId;
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [courseId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const data = await getMessagesByCourse(courseId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content && !file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('content', content);
        formData.append('courseId', courseId);
        formData.append('userId', user?._id || user?.id);
        if (file) {
            formData.append('file', file);
        }

        try {
            await sendMessage(formData);
            setContent('');
            setFile(null);
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DiscoveryLayout>
            <div style={{
                padding: '40px 20px',
                minHeight: 'calc(100vh - 80px)',
                background: 'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.03) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.03) 0%, transparent 40%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="chat-header-left">
                            <button
                                onClick={() => navigate(-1)}
                                className="btn-secondary"
                                style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }}
                            >
                                &larr; Back
                            </button>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Course Discussion</h3>
                        </div>
                        <div className="live-indicator">
                            <div className="pulsate"></div>
                            Live
                        </div>
                    </div>

                    <div className="messages-list">
                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '4rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                <p style={{ fontWeight: 600 }}>Start a modern conversation...</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isSent = msg.user?._id === (user?._id || user?.id);
                                return (
                                    <div key={msg._id} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                                        <div className="chat-avatar">
                                            {msg.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="message-content-box">
                                            <span className="sender-name">{isSent ? 'You' : msg.user?.name}</span>
                                            <div className="message-item">
                                                <div className="message-content">{msg.content}</div>
                                                {msg.filePath && (
                                                    <div className="message-file">
                                                        <a
                                                            href={`http://localhost:5001${msg.filePath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: isSent ? '#fff' : '#A855F7', fontWeight: 700 }}
                                                        >
                                                            📎 Download File
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="message-time-stamp">{formatTime(msg.createdAt)}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <form onSubmit={handleSend}>
                            <div className="chat-input-row">
                                <label htmlFor="chat-file" className="file-attach-btn">
                                    📎
                                </label>
                                <input
                                    type="file"
                                    id="chat-file"
                                    className="file-input"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Type your message..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                <button type="submit" className="send-msg-btn" disabled={loading || (!content && !file)}>
                                    {loading ? '...' : '➤'}
                                </button>
                            </div>
                            {file && (
                                <div className="attachment-preview">
                                    <span>📄 {file.name}</span>
                                    <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '8px' }}>✕</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </DiscoveryLayout>
    );
};

export default ChatWindow;
