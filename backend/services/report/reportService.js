const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Report = require('../../models/report/Report');
const User = require('../../models/auth/User');

class ReportService {
    async createActivityReport(userId, title) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const reportId = new Date().getTime();
            const reportData = {
                studentName: user.name,
                studentEmail: user.email,
                dateGenerated: new Date().toLocaleString(),
                referenceId: reportId,
                activityType: title,
                status: 'Verified & Processed',
                message: 'This document serves as an official confirmation of localized activity within the BrainForge Learning Management System.'
            };

            // 2. Save to Database
            const report = await Report.create({
                title: `${title}`,
                data: reportData,
                userId: userId
            });

            console.log(`[REPORT DATA] Report generated: ${report.title}`);
            return report;
        } catch (error) {
            console.error('Error generating report data:', error);

        }
    }
}

module.exports = new ReportService();
