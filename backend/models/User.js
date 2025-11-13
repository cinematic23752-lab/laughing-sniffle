// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); // لاستخدامه في دالة getSignedToken

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // سيتم تخزين الـ HASH هنا
        required: true
    },
    // **********************************************
    // 🔑 حقول جديدة لتخزين مفاتيح API لكل مستخدم (لتشغيل البوت)
    // **********************************************
    exchangeApiKey: {
        type: String,
        required: false,
    },
    exchangeSecretKey: {
        type: String,
        required: false,
    },
    exchangeName: { 
        type: String,
        required: false,
    },
    // **********************************************
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// ********************************************************
// 1. Hook التشفير: يتم تنفيذه تلقائياً قبل حفظ أي مستخدم جديد
// ********************************************************
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ********************************************************
// 2. دالة JWT: إنشاء الرمز المميز عند تسجيل الدخول
// ********************************************************
UserSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};


module.exports = mongoose.model('User', UserSchema);