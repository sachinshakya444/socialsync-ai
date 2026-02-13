import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';

const app = express();

// --- MIDDLEWARES ---
// Sabhi origins ko allow karne ke liye (Vercel connection fix)
app.use(cors()); 
app.use(express.json()); 

const API_KEY=process.env.GEMINI_KEY;

// --- 1. HOME ROUTE ---
// Browser mein verify karne ke liye ki backend live hai ya nahi
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #4F46E5;">SocialSync AI Backend is LIVE! 🚀</h1>
            <p>Backend Render par successfully chal raha hai.</p>
            <p style="background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 5px;">
                Frontend Endpoint: <code>POST /generate</code>
            </p>
        </div>
    `);
});

// --- 2. AI CONTENT GENERATION ROUTE ---
app.post('/generate', async (req, res) => {
    try {
        const { topic, platform } = req.body;

        if (!topic || !platform) {
            return res.status(400).json({ 
                success: false, 
                message: "Topic and Platform are required!" 
            });
        }

        // Fix: Model name gemini-1.5-flash use karein (2.5 exist nahi karta)
        const modelName = "gemini-1.5-flash";
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

        // Google API Errors Handle karein
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

// --- 3. SERVER STARTUP ---
// Fix: Render ke liye process.env.PORT use karna compulsory hai
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 SocialSync Backend running on port ${PORT}`);
    // Note: 'open' package ko hata diya hai kyunki server par browser nahi hota
});