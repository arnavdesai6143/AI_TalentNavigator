/**
 * AI Talent Navigator Backend Server
 * Provides API endpoints for LLM-powered Onboarding Coach using Ollama
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ollama API endpoint
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'mistral:latest';

/**
 * Concise onboarding knowledge for efficient LLM processing
 */
const ONBOARDING_KNOWLEDGE = `
DAY 1:
1. HR Meeting (30-45min): Company overview, policies, benefits, ID badge. Contact: hr@company.com, Floor 2. 
2. Workstation Setup: Login with temp creds, change password (12+ chars), setup email/Slack/Zoom/VPN/2FA, WiFi: CorpNet. Contact: it-support@company.com, #it-help  
3. Company Handbook: PTO (15 days), sick leave (10 days), remote work (2 days/week), dress code (business casual). Location: intranet.company.com/handbook
4. Meet Buddy: Peer mentor for questions, introductions, cultural tips. Check calendar for contact.

WEEK 1:
5. Security Training (~1hr): Password security, phishing, data handling, VPN. Quiz needs 80%. Access: learning.company.com/security. Contact: security@company.com
6. Team Standup (10AM, 15min): Share yesterday/today/blockers. New members just introduce yourself. Contact: Team lead
7. Codebase Docs: Architecture, API docs, coding standards, PR process. Location: docs.company.com or GitHub wiki. Contact: #engineering
8. Dev Environment: Clone repo, install Node/Docker, configure .env, run tests. Contact: #dev-help. Issues? Check node version, Docker running.

MONTH 1:
9. First PR: Find "good first issue", follow PR template, get reviews. Contact: Buddy/Team lead
10. Meet Team: 15-30min coffee chats with each member.
11. Role Training: 4-6 hours at learning.company.com/my-role. Ask manager for priorities.
12. Career Goals: 30-45min meeting with manager to set objectives. Template: intranet.company.com/career-goals

DEPENDENCIES: Dev setup (8) before First PR (9). Security training (5) may unlock system access.
`;

const AGENTS_CONTEXT = `
AVAILABLE AGENTS:
1. Onboarding Coach: Guides new hires through first days, checklists, logistics.
2. Skill Navigator: Assesses technical skills, identifies gaps (e.g., Python, System Design).
3. Learning Recommender: Suggests courses and resources based on skill gaps.
4. Feedback Analyzer: Analyzes performance reviews and sentiment.
5. Career Coach: Simulates career paths and promotion timelines.
6. Project Matcher: Matches users to internal projects based on skills.
7. Mentor Matcher: Finds suitable mentors based on goals.
`;

/**
 * Generate concise system prompt with context
 */
const PAGES_CONTEXT = `
PAGE DESCRIPTIONS:
- Dashboard: User's home with stats, tasks, and recommended courses.
- Learning Hub: Course catalog, skill assessments, and progress tracking.
- Career Path: Visual roadmap of career progression and role requirements.
- Opportunities: Internal projects and job openings matched to user skills.
- Mentorship: Find and connect with mentors.
- Agent Playground: Interface to test and visualize the multi-agent system.
- Settings: User profile and preferences management.
- Onboarding: Step-by-step guide for new hires.
`;

const COURSES_CONTEXT = `
AVAILABLE COURSES (Learning Hub):
1. Advanced System Design Patterns (Advanced, 6.5h) - key for Senior roles
2. Python for Data Engineering (Intermediate, 8h) - Data pipelines, ETL
3. React Performance Optimization (Advanced, 4h) - Rendering, memoization
4. Technical Communication Mastery (Intermediate, 3h) - Documentation, presenting
5. Docker & Containerization (Intermediate, 5h) - DevOps, deployment
6. Leadership for Engineers (Intermediate, 4.5h) - Mentoring, conflict resolution
7. Cloud Architecture with AWS (Advanced, 7h) - Scalability, security
8. JavaScript Deep Dive (Intermediate, 5.5h) - Closures, async
9. SQL Mastery (Intermediate, 6h) - Optimization, database design
10. Node.js Backend Development (Intermediate, 6.5h) - Express, API design
`;

const MENTORS_CONTEXT = `
AVAILABLE MENTORS (Mentorship Page):
- Sarah Chen (Principal Engineer, System Design) - Best for: System Architecture, Scalability, Backend giants.
- Michael Ross (Staff Data Engineer, Big Data) - Best for: ETL, Spark, Data Pipelines, Data Engineering roles.
- Emily Zhang (Engineering Manager, Leadership) - Best for: Management track, Soft skills, Conflict resolution.
- David Kumar (Senior DevOps Engineer, Cloud Infrastructure) - Best for: AWS, Kubernetes, CI/CD, DevOps roles.
- Jessica Wu (Senior Frontend Engineer, React/UX) - Best for: Frontend, UI/UX, React, CSS, Accessibility.
- Dr. Alan Grant (AI Research Scientist, ML/NLP) - Best for: Machine Learning, NLP, AI Agents, Data Science.
- Raj Patel (Product Manager, Technical PM) - Best for: Product strategy, Roadmapping, PM transition.
- Linda Martinez (Cybersecurity Specialist, SecOps) - Best for: Security, Pen-testing, Compliance.
`;

/**
 * Generate concise system prompt with context
 */
function generateSystemPrompt(currentTasks, conversationHistory, type = 'onboarding', userContext = null) {
    // 1. Generate Context from History (Common for all agents)
    let context = '';
    if (conversationHistory && conversationHistory.length > 0) {
        // Take last 6 messages for better context
        const recent = conversationHistory.slice(-6);
        context = 'RECENT CONVERSATION HISTORY:\n' + recent.map(m =>
            `- ${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`
        ).join('\n');
    }

    if (type === 'orchestrator') {
        const userDetails = userContext ? `
USER PROFILE:
- Name: ${userContext.name}
- Role: ${userContext.role}
- Current Skills: ${userContext.skills ? userContext.skills.join(', ') : 'Unknown'}
- Career Goal: ${userContext.careerGoal || 'Not set'}
` : '';

        return `You are the AI Orchestrator of the Talent Navigator system. Your job is to coordinate specific sub-agents to help the user.

${AGENTS_CONTEXT}

${PAGES_CONTEXT}
${COURSES_CONTEXT}
${MENTORS_CONTEXT}
${userDetails}

${context}

PROTOCOLS & PERSONA:
1.  **PERSONA**: You are a highly intelligent, witty, and helpful AI Orchestrator. You are NOT a boring robot. You have a personality! You are enthusiastic about helping the user achieve their career goals.
2.  **PERSONALIZATION (CRITICAL)**:
    *   ALWAYS address the user by their name ("${userContext?.name || 'User'}").
    *   ACKNOWLEDGE their Current Role ("${userContext?.role || 'Employee'}") and Target Role ("${userContext?.targetRole || 'their goal'}").
    *   If they are an "${userContext?.role}" wanting to become a "${userContext?.targetRole}", FRAME your entire response around bridging that specific gap.
    *   Do NOT give generic advice. Give advice tailored to *that* specific transition.
    *   **MENTOR MATCHING**: Look at the "AVAILABLE MENTORS" list. Find the mentor whose title/expertise MOST CLOSELY matches the user's "${userContext?.targetRole}".
        *   Example: If Target is "Data Engineer", recommend Michael Ross.
        *   Example: If Target is "Frontend", recommend Jessica Wu.
        *   **CRITICAL**: Do NOT default to Sarah Chen unless the user wants to be a Principal Engineer or study System Design.
3.  **ENTERTAINMENT**:
    *   Be engaging! Use a conversational tone.
    *   Throw in a small supportive quip or emoji where appropriate.
    *   Make the "logs" look "techy" and cool.
4.  **LOGGING**:
    *   Generate "logs" of your internal communication BEFORE your final answer.
    *   Log format: [[LOG: Orchestrator -> AgentName: Clear description of action]]
    *   Generate 3-5 logs that show a logical flow of how you are gathering info for *this specific user*.
5.  **RESPONSE**:
    *   After the logs, provide a helpful natural language response.
    *   Use Markdown (bold, lists) for readability.

CRITICAL RULES:
- Do NOT start your response with "User:" or repeat the user's message.
- Do NOT use placeholders like "[Course Name]".
- ONLY recommend courses and mentors listed in the context.
- IF the user asks a question that requires multiple agents, show the coordination in the logs.

### RESPONSE TEMPLATE (Follow this structure strictly) ###

[[LOG: Orchestrator -> AgentName: checking specific thing]]
[[LOG: AgentName -> Orchestrator: finding]]
[[LOG: Orchestrator -> user: preparing response]]

(Your personalized, entertaining, and helpful response here. Address ${userContext?.name || 'the user'} directly.)
`;
    }

    // Default: Onboarding Coach
    let taskStatus = '';
    if (currentTasks) {
        let total = 0, done = 0;
        for (const [phase, tasks] of Object.entries(currentTasks)) {
            const completed = tasks.filter(t => t.completed).length;
            done += completed;
            total += tasks.length;
            const pending = tasks.filter(t => !t.completed).map(t => t.title).join(', ');
            const doneList = tasks.filter(t => t.completed).map(t => t.title).join(', ');
            taskStatus += `${phase}: ${completed}/${tasks.length} done. `;
            if (pending) taskStatus += `Pending: ${pending}. `;
        }
        taskStatus = `Progress: ${Math.round((done / total) * 100)}% (${done}/${total}). ${taskStatus}`;
    }

    return `You are Nova, a friendly Onboarding AI Coach. You help new employees with their first days/weeks/month at the company.

RULES:
- ONLY answer about onboarding tasks below. For off-topic (weather, jokes, coding help, salary), say: "I'm your onboarding coach! I can help with your Day 1, Week 1, and Month 1 tasks. What would you like to know?"
- Use conversation context for follow-ups
- Be warm, encouraging, concise (2-3 paragraphs max)
- Include contact info when relevant
- Use 1-2 emojis per response

KNOWLEDGE:
${ONBOARDING_KNOWLEDGE}

USER STATUS: ${taskStatus || 'No task data'}

${context ? 'CONTEXT: ' + context : ''}


Respond helpfully to the user's question.`;
}

/**

 * Call Ollama API with streaming disabled for simplicity
 */
async function callOllama(prompt, systemPrompt) {
    // Create an abort controller with a longer timeout (180 seconds)
    // System prompts + Mistral can be slow on first request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                system: systemPrompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 500, // Increased for orchestrator logs
                }
            }),
            signal: controller.signal,
        });


        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Ollama API error:', error);
        throw error;

    }
}


/**
 * Chat endpoint for the Onboarding Coach
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory, currentTasks, type = 'onboarding', userContext } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`\n[${new Date().toISOString()}] Received message (${type}): "${message}"`);

        // Generate the system prompt with context
        const systemPrompt = generateSystemPrompt(currentTasks, conversationHistory, type, userContext);

        // Call Ollama
        const response = await callOllama(message, systemPrompt);

        console.log(`[${new Date().toISOString()}] Response generated (${response.length} chars)`);

        res.json({ response });
    } catch (error) {
        console.error('Chat API error:', error);

        // Check if Ollama is not running
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Ollama is not running. Please start it with: ollama serve',
                response: "I'm having trouble connecting to my AI brain. Please make sure Ollama is running (ollama serve) and try again!"
            });
        }

        res.status(500).json({
            error: 'Failed to generate response',
            response: "I encountered an issue processing your question. Please try again!"
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        // Check if Ollama is responsive
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            res.json({ status: 'healthy', ollama: 'connected' });
        } else {
            res.json({ status: 'degraded', ollama: 'error' });
        }
    } catch (error) {
        res.json({ status: 'degraded', ollama: 'disconnected' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 AI Talent Navigator Backend running on http://localhost:${PORT}`);
    console.log(`📡 Ollama endpoint: ${OLLAMA_URL}`);
    console.log(`🤖 Model: ${MODEL}`);
    console.log(`\n💡 Make sure Ollama is running: ollama serve\n`);
});

// --- AUTHENTICATION & DATABASE ---
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production'; // In a real app, use .env
const DB_PATH = './database.db';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Initialize Database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error('Error creating users table:', err.message);
        });
    }
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { username, password, name } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (username, password, name) VALUES (?, ?, ?)`;
        db.run(sql, [username, hashedPassword, name || 'User'], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Generate Token
            const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });

            res.status(201).json({
                message: 'User created successfully',
                token,
                user: { id: this.lastID, username, name: name || 'User' }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not registered. Please create an account.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, name: user.name }
        });
    });
});

// Delete Account Endpoint
app.delete('/api/auth/me', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function (err) {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Failed to delete account' });
        }
        res.json({ message: 'Account deleted successfully' });
    });
});
