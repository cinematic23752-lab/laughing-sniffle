// backend/server.js - خادم Express يعمل كوسيط آمن لـ Gemini API وقاعدة البيانات

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const ccxt = require('ccxt'); // لإعداد الاتصال بالمنصة وجلب الرصيد

// استيراد ملفات الاتصال ونماذج البيانات
const connectDB = require('./db'); 
const User = require('./models/User'); 
const Bot = require('./models/Bot'); 
const TradeLog = require('./models/TradeLog'); 
const { startAllActiveBots } = require('./services/botController'); // مُحرك البوت

// تحميل متغيرات البيئة من ملف .env
dotenv.config(); 

// **********************************************
// 🔑 دالة إنشاء JWT (لتجاوز خطأ TypeError)
// **********************************************
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// **********************************************
// 💰 دالة جلب الرصيد من المنصة (Exchange Balance Helper)
// **********************************************
const fetchExchangeBalance = async (exchangeId, apiKey, secret) => {
    try {
        const exchange = new ccxt[exchangeId]({
            apiKey: apiKey,
            secret: secret,
        });
        
        const balance = await exchange.fetchBalance();
        return balance.free; 

    } catch (e) {
        console.error("Error fetching balance:", e.message);
        throw new Error("Failed to connect to exchange or invalid credentials.");
    }
};
// **********************************************

// ** 1. استدعاء دالة الاتصال بقاعدة البيانات **
connectDB(); 

// 🚨 Bot Startup: بدء تشغيل جميع البوتات النشطة بعد الاتصال بقاعدة البيانات
startAllActiveBots(); 

const app = express();
const PORT = 3000; 

// استخدام Middleware:
app.use(cors());
app.use(express.json()); 

// **********************************************
// مسار تسجيل مستخدم جديد (Register)
// **********************************************
app.post('/api/v1/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists.' });
        }
        
        const newUser = new User({ username, email, password });
        await newUser.save();
        
        console.log(`[DEBUG] New User Registered: ${newUser.email}, Hashed Password: ${newUser.password}`); 
        
        res.status(201).json({ 
            message: 'User registered successfully!',
            userId: newUser._id 
        });

    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === 11000) { 
            return res.status(400).json({ error: 'Username or email already exists.' });
        }
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

// **********************************************
// ** مسار تسجيل دخول المستخدم (Login) **
// **********************************************
app.post('/api/v1/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        
        let passwordsMatch = false;
        
        if (user) {
            passwordsMatch = await bcrypt.compare(password, user.password);
        }

        if (user && passwordsMatch) {
            
            const token = generateToken(user._id); 

            res.json({
                message: 'Login successful!',
                userId: user._id,
                email: user.email,
                token: token // <--- إرسال الـ Token للواجهة الأمامية
            });
            return; 
        } 
        
        console.log(`[AUTH ERROR] Login failed for email: ${email}. User found: ${!!user}, Password matched: ${passwordsMatch}`);
        res.status(401).json({ error: 'Invalid email or password.' });
        
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Login process failed.' });
    }
});
// **********************************************

// **********************************************
// ** مسار جديد: حفظ مفاتيح API الخاصة بالمستخدم **
// **********************************************
app.post('/api/v1/user/exchange-keys', async (req, res) => {
    // ⚠️ ملاحظة: يجب إضافة Middleware للتحقق من الـ JWT هنا! (الخطوة التالية في التطوير)
    
    const { apiKey, secretKey, exchangeName, userId } = req.body; // userId يتم إرساله مؤقتاً من Frontend
    
    try {
        const user = await User.findById(userId); // في التطبيق الحقيقي، يجب جلب userId من الـ JWT
        
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        // 🔑 نقوم بتخزين المفاتيح في قاعدة البيانات
        user.exchangeApiKey = apiKey;
        user.exchangeSecretKey = secretKey;
        user.exchangeName = exchangeName;
        
        await user.save();
        
        res.json({ message: 'Exchange keys updated successfully.' });

    } catch (err) {
        console.error('Keys Update Error:', err);
        res.status(500).json({ error: 'Failed to update exchange keys.' });
    }
});
// **********************************************

// **********************************************
// ** مسار جلب أرصدة المستخدم من المنصة **
// **********************************************
app.get('/api/v1/user/balance', async (req, res) => {
    // ⚠️ ملاحظة: يجب إضافة Middleware للتحقق من الـ JWT Token هنا!
    
    try {
        // مفاتيح المنصة حالياً يجب أن تكون مخزنة في .env لتشغيل الـ Bot Controller
        const exchangeId = process.env.EXCHANGE_NAME;
        const apiKey = process.env.BINANCE_API_KEY; 
        const secret = process.env.BINANCE_SECRET_KEY;
        
        // في التطبيق الحقيقي، يجب جلب المفاتيح من MongoDB للمستخدم المسجل دخوله
        
        if (!exchangeId || !apiKey || !secret) {
            return res.status(401).json({ error: "API keys are required to fetch balance. Set them in .env (for testing)." });
        }

        const balanceData = await fetchExchangeBalance(exchangeId, apiKey, secret);
        
        const formattedBalance = Object.keys(balanceData)
            .filter(currency => balanceData[currency] > 0.001) 
            .map(currency => ({
                currency: currency,
                amount: balanceData[currency]
            }));

        res.json(formattedBalance);

    } catch (error) {
        console.error('Balance API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});
// **********************************************


// **********************************************
// المسار الآمن للـ Proxy (لاستدعاء Gemini API)
// **********************************************
app.post('/api/v1/gemini-query', async (req, res) => {
    // ... (منطق Gemini API) ...
    const userPrompt = req.body.userPrompt;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!userPrompt || !GEMINI_API_KEY) {
        return res.status(400).json({ error: 'Missing prompt or API key.' });
    }

    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            {
                contents: [{ role: "user", parts: [{ text: userPrompt }] }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY 
                }
            }
        );

        const aiResult = response.data.candidates[0].content.parts[0].text;
        res.json({ aiResult: aiResult });

    } catch (error) {
        console.error('Gemini API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to communicate with the AI service. Check API key and model name.' });
    }
});
// **********************************************

// **********************************************
// مسار حفظ إعدادات روبوت التداول (MongoDB)
// **********************************************
app.post('/api/v1/bots/settings', async (req, res) => {
    const dummyUserId = '66b03957242c1626f22e847c'; 

    try {
        const { pair, amount, strategy } = req.body;
        
        const newBot = new Bot({
            userId: dummyUserId,
            pair, 
            amount, 
            strategy,
            isActive: true, 
        });
        await newBot.save();
        
        res.status(201).json({ 
            message: 'Bot settings saved successfully and started!',
            botId: newBot._id 
        });

    } catch (err) {
        console.error('Bot Save Error:', err);
        res.status(500).json({ error: 'Failed to save bot settings.' });
    }
});
// **********************************************

// **********************************************
// المسار الأساسي (GET /)
// **********************************************
app.get('/', (req, res) => {
    res.send('Backend Server is running and ready to serve API requests.');
});
// **********************************************

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
    console.log(`API endpoint is ready.`);
});