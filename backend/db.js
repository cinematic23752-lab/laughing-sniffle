// backend/db.js

const mongoose = require('mongoose');

// دالة الاتصال بقاعدة البيانات
const connectDB = async () => {
    try {
        // يتم جلب رابط الاتصال من ملف .env
        await mongoose.connect(process.env.MONGO_URI); 
        console.log('✅ MongoDB connected successfully.');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        // إيقاف العملية في حالة فشل الاتصال
        process.exit(1); 
    }
};

module.exports = connectDB;