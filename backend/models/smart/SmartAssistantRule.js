const mongoose = require('mongoose');

const SmartAssistantRuleSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        unique: true
    },
    response: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SmartAssistantRule', SmartAssistantRuleSchema);
