import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';

const app = express();

app.use(cors()); 
app.use(express.json());

const API_KEY = process.env.GEMINI_KEY;

app.get('/', (req, res) => {
    res.send("SocialSync AI Backend is LIVE! 🚀");
});

app.post('/generate', async (req, res) => {
    try {
        const { topic, platform } = req.body;
        if (!topic || !platform) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        const modelName = "gemini-1.5-flash"; // Fixed version
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Write a viral ${platform} post about ${topic}.` }] }]
            })
        });

        const data = await response.json();
        if (data.candidates) {
            res.json({ success: true, content: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ success: false, message: "AI Error", details: data });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Port configuration for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});