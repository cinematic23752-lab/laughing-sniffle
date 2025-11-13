// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); // <--- 1. استيراد JWT لإنشاء الـ Token

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
        type: String, 
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// ********************************************************
// 2. Hook التشفير: يتم تنفيذه تلقائياً قبل حفظ أي مستخدم جديد
// ********************************************************
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ********************************************************
// 3. دالة JWT: إنشاء الرمز المميز عند تسجيل الدخول (Instance Method)
// ********************************************************
UserSchema.methods.getSignedToken = function () {
    // يجب أن تكون هذه الدالة موجودة على methods لكي تعمل
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};


module.exports = mongoose.model('User', UserSchema);