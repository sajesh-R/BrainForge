const ActivityLog = require('../../models/smart/ActivityLog');
const User = require('../../models/auth/User');
const SmartAssistantRule = require('../../models/smart/SmartAssistantRule');
const Document = require('../../models/document/Document');
const Assignment = require('../../models/assignment/Assignment');
const Submission = require('../../models/assignment/Submission');

class SmartFeaturesService {
    // 1. Smart Assistant (Rule-Based Responses)
    async getAssistantResponse(query, userId) {
        if (!query) return "Please enter a question!";
        
        let rules = await SmartAssistantRule.find();
        
        if (rules.length === 0) {
            rules = [
                { keyword: 'deadline', response: 'You can check your upcoming deadlines in the "Reminders" section of your dashboard.' },
                { keyword: 'points', response: 'You earn points by enrolling in courses (50pts), submitting assignments (100pts), and uploading documents (20pts).' },
                { keyword: 'course', response: 'To enroll in a new course, visit the Courses page and click on the "Enroll" button.' },
                { keyword: 'hello', response: 'Hello! I am your LMS Smart Assistant. How can I help you today?' },
                { keyword: 'help', response: 'I can help you with information about deadlines, points, and course enrollment.' }
            ];
        }

        const queryLower = query.toLowerCase();

        for (const rule of rules) {
            const keywordLower = rule.keyword.toLowerCase();
            if (queryLower.includes(keywordLower)) {
                let response = rule.response;

                // Dynamic Response for Points
                if (keywordLower === 'points' && userId) {
                    const user = await User.findById(userId);
                    if (user) {
                        response = `You currently have ${user.points || 0} XP. ` + response;
                    }
                }
                
                return response;
            }
        }

        return "I'm not sure about that. Try asking about 'deadline', 'course', 'points', or 'help'.";
    }

    // 2. Predictive Progress (At-Risk Users)
    async identifyAtRiskUsers() {
        const students = await User.find({ role: 'Student' });
        const atRiskUsers = [];

        for (const student of students) {
            // Check recent activity logs
            const logsCount = await ActivityLog.countDocuments({
                userId: student._id,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            // Check for missing submissions (assignments due in past 7 days that weren't submitted)
            const pastAssignments = await Assignment.find({
                dueDate: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    $lte: new Date()
                }
            });

            let missingCount = 0;
            for (const assignment of pastAssignments) {
                const submission = await Submission.findOne({
                    assignmentId: assignment._id,
                    studentId: student._id
                });
                if (!submission) missingCount++;
            }

            if (logsCount < 2 || missingCount > 0) {
                atRiskUsers.push({
                    user: student,
                    reason: logsCount < 2 ? 'Low Recent Activity' : 'Missing Submissions',
                    riskLevel: missingCount > 1 ? 'HIGH' : 'MEDIUM'
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
    async checkDeadlines(userId) {
        if (!userId) return [];

        // Get user enrollments to only show relevant deadlines
        const Enrollment = require('../../models/course/Enrollment');
        const Notification = require('../../models/notification/Notification');
        const enrollments = await Enrollment.find({ user: userId });
        const courseIds = enrollments.map(e => e.course);

        const upcomingAssignments = await Assignment.find({
            course: { $in: courseIds },
            dueDate: {
                $gte: new Date(),
                $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Next 48 hours
            }
        });

        const reminders = upcomingAssignments.map(a => ({
            id: a._id,
            title: a.title,
            dueDate: a.dueDate,
            daysLeft: Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        }));

        // Trigger system notifications for these reminders if they don't exist yet
        for (const r of reminders) {
            const notifTitle = `Deadline Reminder: ${r.title}`;
            const existingNotif = await Notification.findOne({
                user: userId,
                title: notifTitle,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Check last 24h
            });

            if (!existingNotif) {
                const notificationController = require('../../controllers/notification/notificationController');
                await notificationController.createNotification(
                    userId,
                    notifTitle,
                    `Your assignment "${r.title}" is due in ${r.daysLeft === 0 ? 'less than 24 hours' : r.daysLeft + ' days'}.`,
                    'WARNING'
                );
            }
        }

        return reminders;
    }

    // 7. Global Tagged Documents View
    async getRecentTaggedDocuments() {
        return await Document.find()
            .sort({ uploadedAt: -1 })
            .limit(5)
            .populate('courseId', 'title')
            .populate('userId', 'name');
    }
}

module.exports = new SmartFeaturesService();
