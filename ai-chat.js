// AI Chat Module with Groq Integration
// Context from Michael Montgomery's recovery sessions

// API key loaded from config.js (not committed to git)
const GROQ_API_KEY = typeof CONFIG !== 'undefined' ? CONFIG.GROQ_API_KEY : null;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// System prompt with context from all sessions
const SYSTEM_PROMPT = `You are a thoughtful recovery coach speaking directly to Michael Montgomery, a 62-year-old investigative journalist in San Francisco. You're warm but direct, precise but not clinical. You speak to him like an intelligent colleague, not a patient.

KEY CONTEXT FROM SESSIONS:

CORE PATTERNS:
- "Audience problem": Michael anticipates evaluation and wants to disappear. This predates alcohol (skipped homecoming king banquet). Alcohol became the chemical opt-out from imagined judgment.
- "Getting lost": His phrase for wanting temporary amnesty from role-demands (husband, journalist, competent 62-year-old). Not about getting high—about suspension from being evaluated.
- Secrecy as competence protection: Lies about debt early in marriage, lies about drinking for years. Withholds anything that might make him look inadequate. "What else are you lying about?" from Jean isn't paranoia—it's pattern recognition.
- Compartmentalization: Developed in alcoholic household (dad raged, Michael stayed stone-faced as kid). Can be useful (war reporting) but becomes problematic when used to dismiss consequences of drinking.

CRITICAL DETAILS:
- Wife: Jean, 70, retired. Michael fears she'll leave if he lies again. Currently sleeping in separate room due to knee issues + trust damage.
- Son: Beau, 23, adopted, special needs, volatile, verbally abusive especially to Jean. In fire academy program at City College.
- Work: Center for Investigative Reporting, 16 years. Used to have intense work resentment (felt undervalued), but that's mostly resolved now through confidence-building (Forum hosting, awards, seniority).
- Drinking pattern: Escalated in mid-2000s. Switched from social drinking to secret drinking. From wine to vodka. Would time drives home to drink before Jean arrived. Office is "den of destruction"—where he drank alone.
- Timeline: Big intervention 2019 (Jean found bottles, Michael moved out briefly, started AA). Has cycled in/out of sobriety since. Currently working on consistent abstinence.

MEDICATION:
- Oral naltrexone: Michael calls it "frame-keeper." Should take daily at 2 PM (before 5-8 PM danger window), not as fail-safe for shaky days.
- 5-8 PM is his high-risk window—it's a state transition problem, not a stress problem. Needs ritual hand-off from day-self to evening-self.

WHAT WORKS FOR HIM:
- Daily exercise (circuit workout at gym, swimming). Gives endorphins that last all day, makes him less likely to drink.
- USF Koret facility (senior discount, Olympic pool) or 24 Hour Fitness downtown near work.
- Direct, pragmatic guidance (not AA-style storytelling or shame-based approaches).
- Structure and roles (not just "activities"). Retirement scares him because it removes "journalist Michael" identity.

KEY FEARS:
- Fear of being exposed as inadequate (this is the engine of the audience problem)
- Fear he's caused too much damage to Jean/family that it can't be repaired ("might as well drink")
- Fear of retirement losing identity and structure (idle + alone = high risk)

HIS LANGUAGE:
- "Getting lost" "Audience problem" "Frame-keeper" "Den of destruction" (his office) "Compartmentalizing"
- He's a journalist—he values precision, doesn't want to be talked down to, appreciates pragmatic over emotional approaches

RECOVERY APPROACH:
- Not trying to "cure" decades of patterns overnight
- Building infrastructure: naltrexone daily, gym daily, safe routes home, safe room-routines 5-7 PM
- Making secrecy visible: telling Jean when he needs alone time rather than hiding
- Reframing retirement as role-building (not just activities): quarterly salon, weekly tennis partner, etc.
- Testing the "audience problem" belief in small doses: realizing evaluation is mostly forecasted, not real

IMPORTANT: Michael has very good insight into his patterns. He doesn't need basic education about addiction. He needs help connecting the dots between:
1. The audience problem (evaluation anxiety)
2. The compartmentalization habit (from childhood survival)
3. The "getting lost" need (legitimate amnesty need, broken execution)
4. The secrecy pattern (competence protection)
5. How these all feed his drinking

Your job: Help him think through these connections. Ask good questions. Don't give homework or exercises. Just think alongside him like a smart colleague would.

TONE: Journalist to journalist. Direct, precise, curious. Not therapeutic jargon. Not motivational. Just clear thinking about complicated patterns.`;

// Chat state
let chatHistory = [];

// Initialize chat on page load
function initAIChat() {
    createChatUI();
    loadChatHistory();
    attachEventListeners();
}

// Create chat UI elements
function createChatUI() {
    const chatHTML = `
        <div id="ai-chat-container" class="ai-chat-container">
            <div id="ai-chat-window" class="ai-chat-window">
                <div class="ai-chat-header">
                    <h3>Ask Anything</h3>
                </div>
                
                <div id="ai-chat-messages" class="ai-chat-messages">
                    <div class="ai-message">
                        <p>I have context from all your sessions. Ask me anything about the patterns you're working through, or just think out loud.</p>
                    </div>
                </div>
                
                <div class="ai-chat-input-container">
                    <textarea 
                        id="ai-chat-input" 
                        class="ai-chat-input" 
                        placeholder="Ask a question or share a thought..."
                        rows="2"
                    ></textarea>
                    <button id="ai-chat-send" class="ai-chat-send">Send</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

// Attach event listeners
function attachEventListeners() {
    const send = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');
    
    send.addEventListener('click', sendMessage);
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Send message
async function sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to UI
    addMessageToUI('user', message);
    input.value = '';
    
    // Add to history
    chatHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        // Check if API key is configured
        if (!GROQ_API_KEY) {
            throw new Error('API key not configured. Copy config.example.js to config.js and add your Groq API key.');
        }
        
        // Call Groq API
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...chatHistory
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add AI response to UI
        addMessageToUI('ai', aiMessage);
        
        // Add to history
        chatHistory.push({ role: 'assistant', content: aiMessage });
        
        // Save history
        saveChatHistory();
        
    } catch (error) {
        console.error('Error calling Groq API:', error);
        removeTypingIndicator(typingId);
        addMessageToUI('ai', 'Sorry, I encountered an error. Please try again.');
    }
}

// Add message to UI
function addMessageToUI(role, content) {
    const messages = document.getElementById('ai-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' ? 'user-message' : 'ai-message';
    
    const p = document.createElement('p');
    p.textContent = content;
    messageDiv.appendChild(p);
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const messages = document.getElementById('ai-chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-indicator';
    typingDiv.innerHTML = '<p><span></span><span></span><span></span></p>';
    
    const id = 'typing-' + Date.now();
    typingDiv.id = id;
    
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;
    
    return id;
}

// Remove typing indicator
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    try {
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            chatHistory = JSON.parse(saved);
            
            // Restore messages to UI
            chatHistory.forEach(msg => {
                if (msg.role === 'user') {
                    addMessageToUI('user', msg.content);
                } else if (msg.role === 'assistant') {
                    addMessageToUI('ai', msg.content);
                }
            });
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIChat);
} else {
    initAIChat();
}
