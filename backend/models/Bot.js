// backend/models/Bot.js

const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
    // ربط البوت بمستخدم معين (مهم للمصادقة لاحقاً)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // يمكننا الإشارة إلى نموذج المستخدم لربط البيانات
        // ref: 'User' 
    },
    pair: {
        type: String,
        required: true,
        trim: true,
        default: 'BTC/USDT'
    },
    amount: {
        type: Number,
        required: true,
        min: 10 // الحد الأدنى للاستثمار
    },
    strategy: {
        type: String,
        enum: ['DCA', 'Grid Trading', 'Scalping', 'Arbitrage'],
        required: true
    },
    isActive: {
        type: Boolean,
        default: false // البوت غير نشط عند الإنشاء
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bot', BotSchema);