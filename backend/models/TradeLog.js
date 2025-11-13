// backend/models/TradeLog.js

const mongoose = require('mongoose');

const TradeLogSchema = new mongoose.Schema({
    // ربط عملية الشراء ببوت معين (لتتبع أداء كل روبوت)
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bot',
        required: true,
    },
    // ربط عملية الشراء بمستخدم معين
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    buyPrice: {
        type: Number, // السعر الذي تم عنده تنفيذ أمر الشراء
        required: true,
    },
    volume: {
        type: Number, // كمية العملة التي تم شراؤها
        required: true,
    },
    status: {
        type: String,
        enum: ['Base Order', 'Safety Order', 'Take Profit'], // لتصنيف نوع العملية
        default: 'Base Order',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('TradeLog', TradeLogSchema);