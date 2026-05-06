import React, { useState, useEffect, useRef } from 'react';
import { getUsers, startChat, getUserChats, getDirectMessages, sendMessage, createGroup, getUserGroups, getGroupMessages, removeGroupMember, deleteGroup, addGroupMember, markAsRead } from '../../api/chat/chat';
import { useAuth } from '../../context/AuthContext';
import DiscoveryLayout from '../../components/layout/DiscoveryLayout';
import '../../assets/styles/chat/DirectChat.css'; // Chat layout and message styles

const DoubleCheckIcon = ({ isRead }) => (
    <svg 
        viewBox="0 0 24 24" 
        width="17" 
        height="17" 
        style={{ marginRight: '4px', verticalAlign: 'middle', marginTop: '-2px' }}
        fill="none" 
        stroke={isRead ? '#3b82f6' : '#94a3b8'} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M2 13l4 4L16 7" />
        <path d="M8 13l4 4L22 7" />
    </svg>
);

const DirectChat = () => {
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatType, setActiveChatType] = useState(null); // 'direct' or 'group'
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Group creation states
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Add Member states
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [addSelectedMembers, setAddSelectedMembers] = useState([]);

    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchAll = () => {
            fetchUsers();
            fetchSessions();
            fetchGroups();
        };
        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat._id, activeChatType);
            const interval = setInterval(() => fetchMessages(activeChat._id, activeChatType), 5000);
            return () => clearInterval(interval);
        }
    }, [activeChat, activeChatType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            if (data) setUsers(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const data = await getUserChats();
            if (data) setSessions(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const data = await getUserGroups();
            if (data) setGroups(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        }
    };

    const fetchMessages = async (chatId, type) => {
        try {
            let data;
            if (type === 'direct') {
                data = await getDirectMessages(chatId);
                await markAsRead(chatId, null);
            } else if (type === 'group') {
                data = await getGroupMessages(chatId);
                await markAsRead(null, chatId);
            }
            if (data) {
                setMessages(prev => JSON.stringify(prev) === JSON.stringify(data) ? prev : data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleStartDirectChat = async (receiverId) => {
        try {
            const session = await startChat(receiverId);
            setActiveChat(session);
            setActiveChatType('direct');
            fetchSessions(); 
        } catch (error) {
            console.error('Failed to start chat', error);
        }
    };

    const handleSelectChat = (chat, type) => {
        setActiveChat(chat);
        setActiveChatType(type);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!content && !file) || !activeChat) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('content', content);
        
        if (activeChatType === 'direct') {
            const currentUserId = String(user?._id || user?.id);
            const user1Id = String(activeChat.user1?._id || activeChat.user1?.id || activeChat.user1);
            const receiverId = (user1Id === currentUserId) ? (activeChat.user2?._id || activeChat.user2?.id || activeChat.user2) : (activeChat.user1?._id || activeChat.user1?.id || activeChat.user1);
            formData.append('chatId', activeChat._id);
            formData.append('receiverId', receiverId);
        } else if (activeChatType === 'group') {
            formData.append('groupId', activeChat._id);
        }

        if (file) {
            formData.append('file', file);
        }

        try {
            await sendMessage(formData);
            setContent('');
            setFile(null);
            fetchMessages(activeChat._id, activeChatType);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName || selectedMembers.length === 0) return;
        try {
            await createGroup({ name: newGroupName, memberIds: selectedMembers });
            setIsGroupModalOpen(false);
            setNewGroupName('');
            setSelectedMembers([]);
            fetchGroups();
        } catch (error) {
            console.error('Failed to create group', error);
        }
    };

    const toggleMemberSelection = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const toggleAddMemberSelection = (userId) => {
        if (addSelectedMembers.includes(userId)) {
            setAddSelectedMembers(addSelectedMembers.filter(id => id !== userId));
        } else {
            setAddSelectedMembers([...addSelectedMembers, userId]);
        }
    };

    const handleAddMembersToGroup = async (e) => {
        e.preventDefault();
        if (addSelectedMembers.length === 0 || !activeChat) return;
        try {
            await addGroupMember(activeChat._id, addSelectedMembers);
            setIsAddMemberModalOpen(false);
            setAddSelectedMembers([]);
            const updatedGroups = await getUserGroups();
            setGroups(updatedGroups);
            setActiveChat(updatedGroups.find(g => g._id === activeChat._id));
        } catch (error) {
            console.error('Failed to add members', error);
            alert('Failed to add members.');
        }
    };

    const handleRemoveMember = async (groupId, memberId) => {
        try {
            await removeGroupMember(groupId, memberId);
            const updatedGroups = await getUserGroups();
            setGroups(updatedGroups);
            if (activeChat && activeChat._id === groupId) {
                setActiveChat(updatedGroups.find(g => g._id === groupId));
            }
        } catch (error) {
            alert('Failed to remove member. Only admins can perform this action.');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            await deleteGroup(groupId);
            fetchGroups();
            if (activeChat && activeChat._id === groupId) {
                setActiveChat(null);
                setActiveChatType(null);
            }
        } catch (error) {
            alert('Failed to delete group. Only admins can perform this action.');
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
        }
    };

    const getChatPartner = (session) => {
        if (!session.user1 || !session.user2) return { name: 'Unknown' };
        const currentUserId = String(user?._id || user?.id);
        const user1Id = String(session.user1?._id || session.user1?.id || session.user1);
        return user1Id === currentUserId ? session.user2 : session.user1;
    };

    return (
        <DiscoveryLayout>
            <div className="direct-chat-wrapper">
                <div className="chat-sidebar">
                    <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Messages</h2>
                        <button 
                            onClick={() => setIsGroupModalOpen(true)} 
                            style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Group
                        </button>
                    </div>
                    
                    <div className="sidebar-section">
                        <h4>Recent Chats</h4>
                        <div className="user-list">
                            {sessions.map(session => {
                                const partner = getChatPartner(session);
                                return (
                                    <div 
                                        key={session._id} 
                                        className={`user-card ${activeChat?._id === session._id && activeChatType === 'direct' ? 'active' : ''}`}
                                        onClick={() => handleSelectChat(session, 'direct')}
                                    >
                                        <div className="avatar">{partner.name?.charAt(0) || '?'}</div>
                                        <div className="user-info" style={{ width: '100%', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="name">{partner.name}</span>
                                                {session.updatedAt && <span style={{ fontSize: '0.75rem', color: session.unreadCount > 0 ? '#A855F7' : '#94a3b8', fontWeight: session.unreadCount > 0 ? '600' : 'normal' }}>{formatTime(session.updatedAt)}</span>}
                                            </div>
                                            {session.lastMessage && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '0.85rem', color: session.unreadCount > 0 ? '#111827' : '#64748b', fontWeight: session.unreadCount > 0 ? '600' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: session.unreadCount > 0 ? '85%' : '100%' }}>
                                                        <><DoubleCheckIcon isRead={false} />{session.lastMessage}</>
                                                    </span>
                                                    {session.unreadCount > 0 && (
                                                        <span style={{ background: '#A855F7', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', minWidth: '20px', textAlign: 'center' }}>
                                                            {session.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4>All Users</h4>
                        <div className="user-list">
                            {users.map(u => (
                                <div key={u._id} className="user-card" onClick={() => handleStartDirectChat(u._id)}>
                                    <div className="avatar">{u.name?.charAt(0) || '?'}</div>
                                    <div className="user-info">
                                        <span className="name">{u.name}</span>
                                        <span className="role">{u.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {groups.length > 0 && (
                        <div className="sidebar-section">
                            <h4>Your Groups</h4>
                            <div className="user-list">
                                {groups.map(group => (
                                    <div 
                                        key={group._id} 
                                        className={`user-card ${activeChat?._id === group._id && activeChatType === 'group' ? 'active' : ''}`}
                                        onClick={() => handleSelectChat(group, 'group')}
                                    >
                                        <div className="avatar" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{group.name?.charAt(0) || 'G'}</div>
                                        <div className="user-info" style={{ width: '100%', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="name">{group.name}</span>
                                                {group.updatedAt && <span style={{ fontSize: '0.75rem', color: group.unreadCount > 0 ? '#A855F7' : '#94a3b8', fontWeight: group.unreadCount > 0 ? '600' : 'normal' }}>{formatTime(group.updatedAt)}</span>}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', color: group.unreadCount > 0 ? '#111827' : '#64748b', fontWeight: group.unreadCount > 0 ? '600' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: group.unreadCount > 0 ? '85%' : '100%' }}>
                                                    {group.lastMessage ? <><DoubleCheckIcon isRead={false} />{group.lastMessage}</> : `${group.members?.length} members`}
                                                </span>
                                                {group.unreadCount > 0 && (
                                                    <span style={{ background: '#A855F7', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', minWidth: '20px', textAlign: 'center' }}>
                                                        {group.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-main-area">
                    {activeChat ? (
                        <>
                            <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <h3>{activeChatType === 'group' ? activeChat.name : getChatPartner(activeChat).name}</h3>
                                    <div className="live-indicator"><div className="pulsate"></div>Live</div>
                                </div>
                                {activeChatType === 'group' && (activeChat.admin?._id === user?._id || activeChat.admin === user?._id || activeChat.admin?._id === user?.id || activeChat.admin === user?.id) && (
                                    <button onClick={() => handleDeleteGroup(activeChat._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                        Delete Group
                                    </button>
                                )}
                            </div>
                            
                            {activeChatType === 'group' && (
                                <div style={{ background: 'var(--surface)', padding: '10px 30px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', overflowX: 'auto', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Members:</span>
                                    <button onClick={() => setIsAddMemberModalOpen(true)} style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--primary)', border: 'none', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>+ Add</button>
                                    {activeChat.members.map(m => (
                                        <div key={m._id} style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text)' }}>
                                            {m.name} 
                                            {(activeChat.admin?._id === user?._id || activeChat.admin === user?._id || activeChat.admin?._id === user?.id || activeChat.admin === user?.id) && m._id !== user?._id && m._id !== user?.id && (
                                                <span onClick={() => handleRemoveMember(activeChat._id, m._id)} style={{ marginLeft: '6px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>×</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="messages-list" style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                                {messages.length === 0 ? (
                                    <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '4rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                                        <p style={{ fontWeight: 600 }}>Start a modern conversation...</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const msgUserId = String(msg.user?._id || msg.user?.id || msg.user);
                                        const currentUserId = String(user?._id || user?.id);
                                        const isSent = msgUserId === currentUserId;
                                        const isRead = isSent && msg.readBy && msg.readBy.length > 0;
                                        return (
                                            <div key={msg._id} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                                                <div className="chat-avatar">{msg.user?.name?.charAt(0) || '?'}</div>
                                                <div className="message-content-box">
                                                    <span className="sender-name">{isSent ? 'You' : msg.user?.name}</span>
                                                    <div className="message-item">
                                                        <div className="message-content">{msg.content}</div>
                                                        {msg.filePath && (
                                                            <div className="message-file">
                                                                <a 
                                                                    href={msg.filePath.startsWith('http') ? msg.filePath : `${(process.env.REACT_APP_API_URL || 'http://localhost:5001/api').replace('/api', '')}${msg.filePath}`}
                                                                    target="_blank" rel="noopener noreferrer"
                                                                >📎 Download File</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="message-time-stamp">
                                                        {formatTime(msg.createdAt)}
                                                        {isSent && (
                                                            <span style={{ marginLeft: '6px' }}><DoubleCheckIcon isRead={isRead} /></span>
                                                        )}
                                                    </div>
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
                                        <label htmlFor="direct-chat-file" className="file-attach-btn">📎</label>
                                        <input 
                                            type="file" id="direct-chat-file" style={{ display: 'none' }}
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                        <input 
                                            type="text" className="chat-input" placeholder="Type a message..."
                                            value={content} onChange={(e) => setContent(e.target.value)}
                                        />
                                        <button type="submit" className="send-msg-btn" disabled={loading || (!content && !file)}>
                                            {loading ? '...' : '➤'}
                                        </button>
                                    </div>
                                    {file && (
                                        <div className="attachment-preview">
                                            <span>📄 {file.name}</span>
                                            <button type="button" onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '8px' }}>✕</button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                                <div style={{
                                    width: '130px', height: '130px', borderRadius: '50%',
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'inset 0 4px 10px rgba(255,255,255,1), 0 20px 40px rgba(15, 23, 42, 0.08)'
                                }}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-15deg) translateX(-4px) translateY(4px)', filter: 'drop-shadow(8px 16px 20px rgba(15, 23, 42, 0.15))' }}>
                                        <path d="M22 2L15 22L11 13L22 2Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round"/>
                                        <path d="M22 2L11 13L2 9L22 2Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round"/>
                                        <path d="M22 2L11 13" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <h2>Engage with your Learning Community</h2>
                            <p>Choose a peer or instructor to share insights, ask questions, and grow together.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {isGroupModalOpen && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsGroupModalOpen(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create New Group</h2>
                            <button className="modal-close" onClick={() => setIsGroupModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form id="create-group-form" onSubmit={handleCreateGroup}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111827' }}>Group Name</label>
                                    <input 
                                        type="text" required placeholder="Enter group name..."
                                        className="modal-input" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111827' }}>Select Members</label>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                                        {users.map(u => (
                                            <div key={u._id || u.id} 
                                                 onClick={() => toggleMemberSelection(u._id || u.id)}
                                                 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', padding: '8px', background: selectedMembers.includes(u._id || u.id) ? 'rgba(168, 85, 247, 0.1)' : 'transparent', borderRadius: '8px' }}>
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                                                    border: selectedMembers.includes(u._id || u.id) ? 'none' : '2px solid #e5e7eb',
                                                    background: selectedMembers.includes(u._id || u.id) ? 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)' : '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                                    boxShadow: selectedMembers.includes(u._id || u.id) ? '0 4px 10px rgba(168, 85, 247, 0.3)' : 'none'
                                                }}>
                                                    {selectedMembers.includes(u._id || u.id) && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                                <label style={{ cursor: 'pointer', color: '#374151', margin: 0 }}>{u.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" form="create-group-form" className="btn-modal-submit">
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {isAddMemberModalOpen && activeChat && (
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsAddMemberModalOpen(false); }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Members to {activeChat.name}</h2>
                            <button className="modal-close" onClick={() => setIsAddMemberModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form id="add-member-form" onSubmit={handleAddMembersToGroup}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111827' }}>Select Users to Add</label>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }}>
                                        {users.filter(u => !activeChat.members.some(m => (m._id || m.id) === (u._id || u.id))).map(u => (
                                            <div key={u._id || u.id} 
                                                 onClick={() => toggleAddMemberSelection(u._id || u.id)}
                                                 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', padding: '8px', background: addSelectedMembers.includes(u._id || u.id) ? 'rgba(168, 85, 247, 0.1)' : 'transparent', borderRadius: '8px' }}>
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                                                    border: addSelectedMembers.includes(u._id || u.id) ? 'none' : '2px solid #e5e7eb',
                                                    background: addSelectedMembers.includes(u._id || u.id) ? 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)' : '#fff',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                                    boxShadow: addSelectedMembers.includes(u._id || u.id) ? '0 4px 10px rgba(168, 85, 247, 0.3)' : 'none'
                                                }}>
                                                    {addSelectedMembers.includes(u._id || u.id) && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                                <label style={{ cursor: 'pointer', color: '#374151', margin: 0 }}>{u.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" form="add-member-form" className="btn-modal-submit">
                                Add Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DiscoveryLayout>
    );
};

export default DirectChat;
