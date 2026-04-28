const ActivityLog = require('../../models/smart/ActivityLog');
const User = require('../../models/auth/User');
const SmartAssistantRule = require('../../models/smart/SmartAssistantRule');
const Document = require('../../models/document/Document');
const Assignment = require('../../models/assignment/Assignment');
const Submission = require('../../models/assignment/Submission');

class SmartFeaturesService {
    // 1. Smart Assistant (Rule-Based Responses)
    async getAssistantResponse(query) {
        if (!query) return "Please enter a question!";
        const rules = await SmartAssistantRule.find();
        const queryLower = query.toLowerCase();

        for (const rule of rules) {
            if (queryLower.includes(rule.keyword.toLowerCase())) {
                return rule.response;
            }
        }

        return "I'm not sure about that. Try asking about 'deadline', 'course', or 'points'.";
    }

    // 2. Predictive Progress (At-Risk Users)
    async identifyAtRiskUsers() {
        const students = await User.find({ role: 'Student' });
        const atRiskUsers = [];

        for (const student of students) {
            // Logic: No activity in last 7 days OR low submission rate
            const logsCount = await ActivityLog.countDocuments({
                userId: student._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            if (logsCount < 2) { // Arbitrary threshold
                atRiskUsers.push({
                    user: student,
                    reason: 'Low Recent Activity'
                });
            }
        }
        return atRiskUsers;
    }

    // 4. Activity Timeline Feed
    async logActivity(userId, action, details, points = 0) {
        const log = new ActivityLog({ userId, action, details, pointsEarned: points });
        await log.save();

        if (points > 0) {
            await User.findByIdAndUpdate(userId, { $inc: { points: points } });
        }
    }

    async getTimeline(userId) {
        return await ActivityLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);
    }

    // 5. Gamification (Leaderboard)
    async getLeaderboard() {
        return await User.find({ role: 'Student' })
            .sort({ points: -1 })
            .limit(10)
            .select('name points');
    }

    // 6. Intelligent Document Tagging
    async tagDocument(documentId) {
        const doc = await Document.findById(documentId);
        if (!doc) return;

        const tags = [];
        const fileName = doc.fileName.toLowerCase();

        if (fileName.includes('exam') || fileName.includes('test')) tags.push('Assessment');
        if (fileName.includes('lecture') || fileName.includes('notes')) tags.push('Study Material');
        if (fileName.includes('assignment') || fileName.includes('project')) tags.push('Task');
        if (fileName.endsWith('.pdf')) tags.push('PDF');
        if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) tags.push('Word');

        doc.tags = tags;
        await doc.save();
    }

    // 3. Deadline Reminders
    async checkDeadlines() {
        const upcomingAssignments = await Assignment.find({
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
            }
        });

        // In a real app, this would trigger emails/push notifications
        return upcomingAssignments.map(a => `Reminder: ${a.title} is due soon!`);
    }
}

module.exports = new SmartFeaturesService();
