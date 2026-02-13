import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';
import open from 'open';

const app = express();

// Middlewares
app.use(cors()); // Frontend connection allow karne ke liye
app.use(express.json()); // JSON data read karne ke liye

const API_KEY = process.env.GEMINI_KEY;

// 1. Home Route (Browser mein check karne ke liye)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #4F46E5;">SocialSync AI Backend is LIVE! 🚀</h1>
            <p>Step 1 & 2 Completed successfully.</p>
            <p style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">
                API Endpoint: <code>POST /generate</code>
            </p>
        </div>
    `);
});

// 2. AI Content Generation Route
app.post('/generate', async (req, res) => {
    try {
        const { topic, platform } = req.body;

        if (!topic || !platform) {
            return res.status(400).json({ 
                success: false, 
                message: "Topic and Platform are required!" 
            });
        }

        // Correct Model Name: gemini-1.5-flash
        const modelName = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Write a viral ${platform} post about ${topic}. Include relevant emojis and hashtags.` }]
                }]
            })
        });

        const data = await response.json();

        // Error Handling for Google API
        if (data.error) {
            console.error("Google API Error:", data.error.message);
            return res.status(data.error.code || 500).json({ 
                success: false, 
                message: data.error.message 
            });
        }

        // Response formatting
        if (data.candidates && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            res.json({ success: true, content: aiText });
        } else {
            throw new Error("Invalid response from AI model");
        }

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Server Startup
const PORT = 5000;
app.listen(PORT, async () => {
    console.log(`\n🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📡 Testing API...`);
    
    // Browser automatically khul jayega
    await open(`http://localhost:${PORT}`);
});
