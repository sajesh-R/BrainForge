const SmartFeaturesService = require('../../services/smart/smartFeaturesService');
const SmartAssistantRule = require('../../models/smart/SmartAssistantRule');

exports.getAssistantResponse = async (req, res) => {
    try {
        const { query } = req.body;
        const response = await SmartFeaturesService.getAssistantResponse(query);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAtRiskUsers = async (req, res) => {
    try {
        const atRiskUsers = await SmartFeaturesService.identifyAtRiskUsers();
        res.status(200).json(atRiskUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTimeline = async (req, res) => {
    try {
        const timeline = await SmartFeaturesService.getTimeline(req.user._id);
        res.status(200).json(timeline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await SmartFeaturesService.getLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkDeadlines = async (req, res) => {
    try {
        const reminders = await SmartFeaturesService.checkDeadlines();
        res.status(200).json(reminders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addAssistantRule = async (req, res) => {
    try {
        const { keyword, response } = req.body;
        const rule = new SmartAssistantRule({ keyword, response });
        await rule.save();
        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
