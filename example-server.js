/**
 * Example AI Proxy Server (Node.js + Express)
 * 
 * This is a simple server that proxies AI requests to OpenAI/Anthropic.
 * Replace with your actual AI provider credentials and endpoints.
 * 
 * Setup:
 * 1. npm install express cors dotenv openai
 * 2. Create .env file with: OPENAI_API_KEY=your_key_here
 * 3. node example-server.js
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// System prompt for the AI
const SYSTEM_PROMPT = `You are a compassionate, succinct recovery coach writing for a 62-year-old investigative journalist in San Francisco named Michael who is several weeks into daily oral naltrexone. Evenings (5–8 pm) are his risk window. He tends to isolate when anticipating evaluation by others ('audience problem'), uses secrecy as competence protection, and historically drank alone to 'get lost' (amnesty from roles). He values exercise, walking/hiking, music/jazz, and wants more social/structured activities as he approaches retirement. Tone: non-judgmental, specific, pragmatic, never shaming. Output only 2–4 reflection questions plus 1–2 supportive context notes. Keep total under 180 words.`;

// AI endpoint
app.post('/ai/generate', async (req, res) => {
    try {
        const { chapterSummary, priorNotes, recentResonances, userContext } = req.body;
        
        // Build context message
        const contextMessage = `
Chapter: ${chapterSummary}

Recent notes from Michael:
${priorNotes.length > 0 ? priorNotes.map((n, i) => `${i + 1}. ${n}`).join('\n') : 'None yet'}

Recent resonant lines:
${recentResonances.length > 0 ? recentResonances.map((r, i) => `${i + 1}. ${r}`).join('\n') : 'None yet'}

Current context:
- Time: ${userContext.localTime}
- Companionship: ${userContext.companionship || 'unknown'}

Generate 2-4 tailored reflection questions and 1-2 supportive context notes (under 180 words total).
Format your response as JSON:
{
  "prompts": ["question 1", "question 2", ...],
  "supportiveNotes": ["note 1", "note 2"]
}
`;

        // OPTION 1: Use OpenAI API
        if (process.env.OPENAI_API_KEY) {
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: contextMessage }
                ],
                temperature: 0.7,
                max_tokens: 400
            });
            
            const responseText = completion.choices[0].message.content;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                res.json(parsed);
            } else {
                throw new Error('Invalid AI response format');
            }
        } 
        // OPTION 2: Use Anthropic Claude API
        else if (process.env.ANTHROPIC_API_KEY) {
            const Anthropic = require('@anthropic-ai/sdk');
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
            
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 400,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: 'user', content: contextMessage }
                ]
            });
            
            const responseText = message.content[0].text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                res.json(parsed);
            } else {
                throw new Error('Invalid AI response format');
            }
        }
        // FALLBACK: Return mock response
        else {
            console.log('No API key found. Returning mock response.');
            res.json({
                prompts: [
                    "What small action could you take today that aligns with this chapter's insight?",
                    "Which part of this resonates most with your experience right now?",
                    "If you could share one thing about this with Jean, what would it be?"
                ],
                supportiveNotes: [
                    "Small steps compound over time.",
                    "Your context suggests this might be a good moment for reflection."
                ]
            });
        }
        
    } catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({ 
            error: 'AI generation failed',
            message: error.message 
        });
    }
});

// Chat endpoint for AI chat feature
app.post('/ai/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array required' });
        }

        // If using Groq API with key from config
        if (process.env.GROQ_API_KEY) {
            const fetch = (await import('node-fetch')).default;
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Groq API error:', errorText);
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            res.json(data);
        }
        // Fallback to OpenAI if available
        else if (process.env.OPENAI_API_KEY) {
            const OpenAI = require('openai');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            });
            
            res.json({
                choices: [{
                    message: {
                        content: completion.choices[0].message.content
                    }
                }]
            });
        }
        // Mock response if no API keys
        else {
            res.json({
                choices: [{
                    message: {
                        content: "I'm currently running in demo mode without an API key. To enable AI chat, please add your GROQ_API_KEY or OPENAI_API_KEY to the .env file."
                    }
                }]
            });
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Chat request failed',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`\n✨ Recovery Reflections Server`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🤖 AI: ${process.env.GROQ_API_KEY ? 'Groq' : process.env.OPENAI_API_KEY ? 'OpenAI' : process.env.ANTHROPIC_API_KEY ? 'Anthropic' : 'Mock'}\n`);
});
