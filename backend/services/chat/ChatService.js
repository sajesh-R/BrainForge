const Message = require('../../models/chat/Message');
const ChatSession = require('../../models/chat/ChatSession');
const ChatGroup = require('../../models/chat/ChatGroup');

exports.sendMessage = async (messageData) => {
    const { content, userId, receiverId, chatId, groupId, filePath } = messageData;

    if (!chatId && !groupId) {
        throw new Error('Message must belong to a direct chat or a group chat');
    }

    const message = await Message.create({
        content,
        user: userId,
        receiver: receiverId,
        chatSession: chatId,
        group: groupId,
        filePath
    });

    const lastMessageText = filePath ? '📎 Attachment' : content;

    if (chatId) {
        await ChatSession.findByIdAndUpdate(chatId, { lastMessage: lastMessageText, updatedAt: new Date() });
    } else if (groupId) {
        await ChatGroup.findByIdAndUpdate(groupId, { lastMessage: lastMessageText, updatedAt: new Date() });
    }

    return await message.populate('user', 'name email');
};


exports.markMessagesAsRead = async (chatId, groupId, userId) => {
    const filter = {
        user: { $ne: userId },
        readBy: { $ne: userId }
    };
    if (chatId) filter.chatSession = chatId;
    else if (groupId) filter.group = groupId;
    else return;

    await Message.updateMany(filter, { $addToSet: { readBy: userId } });
};

exports.getDirectMessages = async (chatId) => {
    if (!chatId || chatId === 'undefined') return [];
    return await Message.find({ chatSession: chatId })
        .populate('user', 'name email')
        .sort({ createdAt: 1 });
};

exports.getOrCreateChatSession = async (user1Id, user2Id) => {
    let session = await ChatSession.findOne({
        $or: [
            { user1: user1Id, user2: user2Id },
            { user1: user2Id, user2: user1Id }
        ]
    }).populate('user1', 'name email').populate('user2', 'name email');
    if (!session) {
        session = await ChatSession.create({ user1: user1Id, user2: user2Id });
        session = await session.populate('user1', 'name email');
        session = await session.populate('user2', 'name email');
    }
    return session;
};

exports.getUserChats = async (userId) => {
    const sessions = await ChatSession.find({
        $or: [{ user1: userId }, { user2: userId }]
    }).populate('user1', 'name email').populate('user2', 'name email').sort({ updatedAt: -1 }).lean();
    
    for (let session of sessions) {
        session.unreadCount = await Message.countDocuments({
            chatSession: session._id,
            user: { $ne: userId },
            readBy: { $ne: userId }
        });
    }
    return sessions;
};

exports.createGroup = async (name, adminId, memberIds) => {
    const group = await ChatGroup.create({
        name,
        admin: adminId,
        members: [...memberIds, adminId]
    });
    return group;
};

exports.getUserGroups = async (userId) => {
    const groups = await ChatGroup.find({ members: userId })
        .populate('members', 'name email')
        .populate('admin', 'name email')
        .sort({ updatedAt: -1 }).lean();
        
    for (let group of groups) {
        group.unreadCount = await Message.countDocuments({
            group: group._id,
            user: { $ne: userId },
            readBy: { $ne: userId }
        });
    }
    return groups;
};

exports.getGroupMessages = async (groupId) => {
    return await Message.find({ group: groupId })
        .populate('user', 'name email')
        .sort({ createdAt: 1 });
};

exports.addGroupMembers = async (groupId, memberIds, requesterId) => {
    const group = await ChatGroup.findById(groupId);
    if (!group) throw new Error('Group not found');
    
    // Verify requester is a member of the group
    const isMember = group.members.some(id => id.toString() === requesterId.toString());
    if (!isMember) throw new Error('Only group members can add new members');

    // Add only new members to avoid duplicates
    const existingMembers = group.members.map(id => id.toString());
    const newMembers = memberIds.filter(id => !existingMembers.includes(id.toString()));
    
    group.members = [...group.members, ...newMembers];
    await group.save();
    return await group.populate([{ path: 'members', select: 'name email' }, { path: 'admin', select: 'name email' }]);
};

exports.removeUserFromGroup = async (groupId, userId, adminId) => {
    const group = await ChatGroup.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (group.admin.toString() !== adminId.toString()) throw new Error('Only admin can remove users');

    group.members = group.members.filter(id => id.toString() !== userId.toString());
    await group.save();
    return group;
};

exports.deleteGroup = async (groupId, adminId) => {
    const group = await ChatGroup.findById(groupId);
    if (!group) throw new Error('Group not found');
    if (group.admin.toString() !== adminId.toString()) throw new Error('Only admin can delete group');

    await ChatGroup.findByIdAndDelete(groupId);
    await Message.deleteMany({ group: groupId });
    return { message: 'Group deleted successfully' };
};
