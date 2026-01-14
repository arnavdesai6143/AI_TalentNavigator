/**
 * Onboarding Knowledge Base for RAG-based AI Assistant
 * 
 * This implements a focused RAG (Retrieval-Augmented Generation) system that:
 * 1. Contains ONLY information about Day 1, Week 1, and Month 1 onboarding tasks
 * 2. Detects and politely declines out-of-scope questions
 * 3. Uses keyword matching and relevance scoring to find relevant documents
 * 4. Generates contextual responses based on retrieved information
 * 
 * SCOPE: The assistant is strictly limited to answering questions about
 * the onboarding tasks visible on the page (Daily, Weekly, Monthly tasks).
 */

// Out-of-scope topic keywords - questions containing these are politely redirected
const OUT_OF_SCOPE_KEYWORDS = [
    // General conversation
    'weather', 'joke', 'story', 'game', 'play', 'music', 'movie', 'sports', 'news',
    // Unrelated technical topics
    'machine learning', 'artificial intelligence', 'blockchain', 'crypto', 'cloud computing',
    // Personal HR topics not in onboarding
    'salary', 'raise', 'promotion', 'bonus', 'negotiate', 'quit', 'resign', 'fired',
    // Topics beyond onboarding scope
    'interview', 'hiring', 'recruit', 'stock', 'investment', 'market', 'politics',
    // General questions
    'meaning of life', 'who are you', 'what can you do', 'hello', 'hi there', 'how are you'
];

// Onboarding-related keywords that signal valid questions
const ONBOARDING_KEYWORDS = [
    'task', 'onboarding', 'setup', 'workstation', 'computer', 'laptop', 'account', 'email',
    'hr', 'human resources', 'handbook', 'policy', 'buddy', 'mentor', 'security', 'training',
    'standup', 'meeting', 'team', 'codebase', 'documentation', 'development', 'environment',
    'pr', 'pull request', 'code', 'git', 'colleague', 'manager', 'goal', 'career',
    'day 1', 'week 1', 'month 1', 'first day', 'first week', 'first month',
    'progress', 'complete', 'completed', 'pending', 'status', 'how do i', 'what is',
    'password', 'login', 'access', 'office', 'remote', 'slack', 'zoom'
];

// Minimum relevance score required to provide an answer
const MIN_RELEVANCE_SCORE = 5;

// Knowledge base with detailed information for each onboarding task ONLY
const knowledgeBase = [
    // Day 1 Tasks
    {
        id: 'welcome-hr',
        taskId: 1,
        phase: 'Day 1',
        title: 'Welcome meeting with HR',
        keywords: ['hr', 'welcome', 'human resources', 'first day', 'introduction', 'orientation', 'day 1'],
        content: `The Welcome Meeting with HR typically takes 30-45 minutes and covers:
        - Company overview and mission
        - Organizational structure
        - Key policies (attendance, leave, code of conduct)
        - Benefits enrollment overview
        - Emergency contacts and procedures
        - ID badge and access cards
        Contact HR at hr@company.com or visit the HR office on Floor 2.`,
        tips: 'Bring a notebook to take notes. HR will provide you with important documents to sign.',
        contact: 'hr@company.com'
    },
    {
        id: 'workstation-setup',
        taskId: 2,
        phase: 'Day 1',
        title: 'Set up workstation and accounts',
        keywords: ['workstation', 'computer', 'laptop', 'accounts', 'email', 'setup', 'password', 'login', 'it', 'day 1'],
        content: `Setting up your workstation involves:
        - Logging into your laptop with temporary credentials from IT
        - Changing your password (must be 12+ characters with special chars)
        - Setting up your company email in Outlook/Gmail
        - Installing required software (Slack, Zoom, VPN client)
        - Configuring two-factor authentication (2FA)
        - Connecting to the office WiFi (network: CorpNet, password provided by IT)`,
        tips: 'IT help desk is available 24/7 at it-support@company.com or Slack #it-help channel.',
        contact: 'it-support@company.com'
    },
    {
        id: 'company-handbook',
        taskId: 3,
        phase: 'Day 1',
        title: 'Review company handbook',
        keywords: ['handbook', 'policies', 'rules', 'guidelines', 'code of conduct', 'dress code', 'remote work', 'pto', 'vacation', 'sick leave', 'day 1'],
        content: `The Company Handbook covers important policies including:
        - Work hours and flexible scheduling
        - Remote work policy (up to 2 days/week)
        - Dress code (business casual)
        - PTO and vacation policy (15 days/year to start)
        - Sick leave (10 days/year)
        - Expense reimbursement process
        - Travel policies
        - Code of conduct and ethics
        The handbook is available on the company intranet at intranet.company.com/handbook`,
        tips: 'Focus on the sections relevant to your role. You can always reference it later.',
        contact: 'hr@company.com'
    },
    {
        id: 'meet-buddy',
        taskId: 4,
        phase: 'Day 1',
        title: 'Meet your buddy',
        keywords: ['buddy', 'mentor', 'onboarding buddy', 'help', 'questions', 'guide', 'day 1'],
        content: `Your onboarding buddy is an experienced team member assigned to help you:
        - Answer day-to-day questions
        - Show you around the office
        - Introduce you to team members
        - Explain team culture and norms
        - Help with any blockers or confusion
        Your buddy will reach out to schedule a 30-minute coffee chat on your first day.`,
        tips: 'Prepare a list of questions! Your buddy is there to help with anything, no question is too small.',
        contact: 'Check your calendar invite for your buddy\'s contact info'
    },

    // Week 1 Tasks
    {
        id: 'security-training',
        taskId: 5,
        phase: 'Week 1',
        title: 'Complete security training',
        keywords: ['security', 'training', 'phishing', 'password', 'data protection', 'privacy', 'compliance', 'gdpr', 'week 1'],
        content: `Security training is mandatory and covers:
        - Password security best practices
        - Phishing and social engineering awareness
        - Data classification and handling
        - Clean desk policy
        - Reporting security incidents
        - VPN usage requirements
        - GDPR and data privacy compliance
        The training takes approximately 1 hour and includes a quiz at the end. You need 80% to pass.`,
        tips: 'Complete this training early in the week. Access it at learning.company.com/security',
        contact: 'security@company.com'
    },
    {
        id: 'team-standup',
        taskId: 6,
        phase: 'Week 1',
        title: 'Attend team standup',
        keywords: ['standup', 'meeting', 'daily', 'scrum', 'agile', 'team meeting', 'week 1'],
        content: `Daily standups are 15-minute meetings where the team shares:
        - What they worked on yesterday
        - What they're working on today
        - Any blockers or help needed
        Standups are held at 10:00 AM in the team area or via Zoom for remote days.
        As a new member, just introduce yourself briefly - no pressure to have updates yet!`,
        tips: 'Just listen and observe for the first few days. Say hi and mention you\'re new!',
        contact: 'Your team lead'
    },
    {
        id: 'codebase-docs',
        taskId: 7,
        phase: 'Week 1',
        title: 'Review codebase documentation',
        keywords: ['codebase', 'documentation', 'wiki', 'architecture', 'code', 'github', 'repository', 'readme', 'week 1'],
        content: `Codebase documentation is available at:
        - GitHub Wiki: github.com/company/main-repo/wiki
        - Architecture docs: docs.company.com/architecture
        - API documentation: api.company.com/docs
        Key areas to review:
        - System architecture overview
        - Getting started guide
        - Coding standards and conventions
        - PR review process
        - Testing guidelines`,
        tips: 'Don\'t try to understand everything at once. Focus on the high-level architecture first.',
        contact: 'Ask your buddy or post in #engineering Slack channel'
    },
    {
        id: 'dev-environment',
        taskId: 8,
        phase: 'Week 1',
        title: 'Set up development environment',
        keywords: ['development', 'environment', 'dev', 'ide', 'vscode', 'docker', 'node', 'npm', 'git', 'clone', 'local', 'week 1'],
        content: `Setting up your development environment:
        1. Install required tools: Node.js (v18+), Git, Docker, VS Code
        2. Clone the main repository: git clone git@github.com:company/main-repo.git
        3. Install dependencies: npm install
        4. Copy environment variables: cp .env.example .env
        5. Start local services: docker-compose up -d
        6. Run the app: npm run dev
        Detailed setup instructions are in the repository README.md file.`,
        tips: 'If you hit any issues, check the #dev-help Slack channel - someone else probably had the same problem!',
        contact: 'Post in #dev-help Slack channel'
    },

    // Month 1 Tasks
    {
        id: 'first-pr',
        taskId: 9,
        phase: 'Month 1',
        title: 'Complete first PR',
        keywords: ['pr', 'pull request', 'code review', 'git', 'commit', 'first contribution', 'merge', 'month 1'],
        content: `Your first Pull Request is a milestone! Typically:
        - Start with a small bug fix or documentation improvement
        - Check the "good first issue" label in GitHub issues
        - Follow the PR template when creating your PR
        - Request review from your buddy or team lead
        - Address feedback and iterate
        PR process: Create branch → Make changes → Push → Create PR → Get reviews → Merge`,
        tips: 'Don\'t aim for perfection - your first PR is about learning the process. Ask for a "good first issue" from your buddy.',
        contact: 'Your buddy or team lead'
    },
    {
        id: 'meet-team',
        taskId: 10,
        phase: 'Month 1',
        title: 'Meet all team members',
        keywords: ['team', 'colleagues', 'coworkers', 'introduction', 'networking', '1on1', 'one on one', 'month 1'],
        content: `Getting to know your team members:
        - Schedule 15-30 minute coffee chats with each team member
        - Learn about their role and what they work on
        - Understand how you'll collaborate with them
        - Build relationships early!
        Your team includes frontend, backend, QA, and product members. 
        Ask your buddy for a team roster with everyone's roles.`,
        tips: 'Use the company directory or ask your buddy for team member contacts. People love talking about themselves!',
        contact: 'Check the team Slack channel for team members'
    },
    {
        id: 'role-training',
        taskId: 11,
        phase: 'Month 1',
        title: 'Complete role-specific training',
        keywords: ['training', 'role', 'job', 'skills', 'learning', 'certification', 'course', 'month 1'],
        content: `Role-specific training is tailored to your position:
        - Engineering: System design, code review practices, deployment process
        - Product: Product lifecycle, user research, roadmap planning
        - Design: Design system, prototyping tools, accessibility standards
        Access training modules at learning.company.com/my-role
        Training typically takes 4-6 hours spread across the month.`,
        tips: 'Ask your manager which training modules are highest priority for your specific role.',
        contact: 'Your manager or learning@company.com'
    },
    {
        id: 'career-goals',
        taskId: 12,
        phase: 'Month 1',
        title: 'Set career goals with manager',
        keywords: ['career', 'goals', 'manager', '1on1', 'objectives', 'okr', 'growth', 'development', 'month 1'],
        content: `Setting career goals with your manager:
        - Schedule a dedicated 30-45 minute meeting
        - Discuss your short-term goals (3-6 months)
        - Discuss long-term career aspirations
        - Set 2-3 measurable objectives for your first quarter
        - Identify skills you want to develop
        - Agree on how success will be measured
        Use the goal-setting template at intranet.company.com/career-goals`,
        tips: 'Come prepared with ideas about where you want to be in 1-2 years. Your manager will help refine them.',
        contact: 'Schedule directly with your manager'
    }
];

/**
 * Common stopwords to filter out from queries
 * These words shouldn't affect relevance scoring
 */
const STOPWORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
    'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'tell', 'about', 'know', 'want', 'please', 'help', 'get', 'give'
]);

/**
 * Filter query words to remove stopwords and short words
 * @param {string[]} words - Array of words
 * @returns {string[]} - Filtered meaningful words
 */
function filterQueryWords(words) {
    return words.filter(word =>
        word.length >= 3 && !STOPWORDS.has(word)
    );
}

/**
 * Simple text similarity scoring (simulates vector similarity)
 * Counts keyword matches and word overlaps
 */
function calculateRelevance(query, document) {
    const queryLower = query.toLowerCase();
    const allQueryWords = queryLower.split(/\s+/);
    const queryWords = filterQueryWords(allQueryWords);

    let score = 0;

    // Check keyword matches (highest weight) - exact/substring match of full keyword in query
    document.keywords.forEach(keyword => {
        // Exact keyword match in query (e.g., query contains "handbook")
        if (queryLower.includes(keyword)) {
            score += 15;
        }
    });

    // Check if meaningful query words match keywords (but only for longer words)
    queryWords.forEach(word => {
        if (word.length >= 4) {
            document.keywords.forEach(keyword => {
                // Word matches keyword exactly
                if (keyword === word) {
                    score += 10;
                }
                // Word is contained in a multi-word keyword (e.g., "security" in "security training")
                else if (keyword.includes(word) && keyword.split(' ').some(kw => kw === word)) {
                    score += 8;
                }
            });
        }
    });

    // Check title match - title words in query
    const titleLower = document.title.toLowerCase();
    const titleWords = filterQueryWords(titleLower.split(/\s+/));

    titleWords.forEach(titleWord => {
        if (titleWord.length >= 4 && queryWords.some(qw => qw === titleWord || qw.includes(titleWord) || titleWord.includes(qw))) {
            score += 8;
        }
    });

    // Check content match (lower weight) - only for specific meaningful words
    const contentLower = document.content.toLowerCase();
    queryWords.forEach(word => {
        if (word.length >= 5 && contentLower.includes(word)) {
            score += 2;
        }
    });

    return score;
}

/**
 * Check if a query contains out-of-scope keywords
 * @param {string} query - User's question
 * @returns {boolean} - True if query is out of scope
 */
function isOutOfScope(query) {
    const queryLower = query.toLowerCase();
    return OUT_OF_SCOPE_KEYWORDS.some(keyword => queryLower.includes(keyword));
}

/**
 * Check if a query has onboarding-related intent
 * @param {string} query - User's question
 * @returns {boolean} - True if query appears onboarding-related
 */
function hasOnboardingIntent(query) {
    const queryLower = query.toLowerCase();
    return ONBOARDING_KEYWORDS.some(keyword => queryLower.includes(keyword));
}

/**
 * Generate the out-of-scope response message
 * @returns {string} - Polite redirect message
 */
function getOutOfScopeResponse() {
    return `I appreciate you reaching out! However, I'm specifically designed to help with your onboarding tasks on this page.

🎯 I can help you with:

📅 Day 1 — HR meeting, workstation setup, company handbook, meeting your buddy
📅 Week 1 — Security training, team standups, codebase docs, dev environment  
📅 Month 1 — Your first PR, meeting the team, role training, career goals

Please ask me something related to these onboarding tasks, and I'll be happy to help!

💡 Try asking: "How do I set up my workstation?" or "What's in the security training?"`;
}

/**
 * Retrieves the most relevant documents for a query
 * @param {string} query - User's question
 * @param {number} topK - Number of documents to retrieve
 * @returns {Array} - Top K relevant documents
 */
export function retrieveDocuments(query, topK = 3) {
    const scoredDocs = knowledgeBase.map(doc => ({
        ...doc,
        relevanceScore: calculateRelevance(query, doc)
    }));

    // Sort by relevance score descending
    scoredDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return top K documents with score above minimum threshold
    return scoredDocs
        .filter(doc => doc.relevanceScore >= MIN_RELEVANCE_SCORE)
        .slice(0, topK);
}

/**
 * Generates a contextual response based on retrieved documents
 * @param {string} query - User's question
 * @param {Array} retrievedDocs - Retrieved relevant documents
 * @param {Object} currentTasks - Current user's task state
 * @returns {string} - Generated response
 */
export function generateResponse(query, retrievedDocs, currentTasks) {
    const queryLower = query.toLowerCase();

    // STEP 1: Check for explicit out-of-scope topics first
    if (isOutOfScope(query)) {
        return getOutOfScopeResponse();
    }

    // STEP 2: Check if asking about task status/progress (always allowed)
    if (queryLower.includes('progress') || queryLower.includes('status') || queryLower.includes('how am i doing')) {
        if (currentTasks) {
            const allTasks = Object.values(currentTasks).flat();
            const completed = allTasks.filter(t => t.completed).length;
            const total = allTasks.length;
            const percentage = Math.round((completed / total) * 100);

            let phaseStatus = Object.entries(currentTasks).map(([phase, tasks]) => {
                const done = tasks.filter(t => t.completed).length;
                return `• ${phase}: ${done}/${tasks.length} completed`;
            }).join('\n');

            return `Great question! Here's your onboarding progress:

📊 Overall: ${percentage}% complete (${completed}/${total} tasks)

${phaseStatus}

${percentage < 30 ? "🚀 You're just getting started - focus on Day 1 tasks first!" :
                    percentage < 70 ? "👍 Good progress! Keep working through your tasks." :
                        "🎉 Excellent progress! You're almost done with onboarding!"}`;
        }
    }

    // STEP 3: No relevant documents found OR score too low
    if (retrievedDocs.length === 0) {
        // If query has onboarding intent but no matches, give helpful response
        if (hasOnboardingIntent(query)) {
            return `I couldn't find specific information about that in my knowledge base.

Here are the onboarding tasks I can help you with:

📅 Day 1:
  • Welcome meeting with HR
  • Setting up your workstation and accounts
  • Reviewing the company handbook
  • Meeting your onboarding buddy

📅 Week 1:
  • Completing security training
  • Attending team standups
  • Reviewing codebase documentation
  • Setting up your development environment

📅 Month 1:
  • Completing your first PR
  • Meeting all team members
  • Role-specific training
  • Setting career goals with your manager

Which of these would you like to know more about?`;
        }

        // Otherwise, redirect to onboarding topics
        return getOutOfScopeResponse();
    }

    const topDoc = retrievedDocs[0];

    // STEP 4: Build response from top document
    let response = topDoc.content;

    // Add phase context
    if (topDoc.phase) {
        response = `📅 ${topDoc.phase} Task: ${topDoc.title}\n\n${response}`;
    }

    // Add tips if available
    if (topDoc.tips) {
        response += `\n\n💡 Tip: ${topDoc.tips}`;
    }

    // Add contact info if available
    if (topDoc.contact) {
        response += `\n\n📧 Contact: ${topDoc.contact}`;
    }

    // If there's a related task, check its status
    if (topDoc.taskId && currentTasks) {
        const allTasks = Object.values(currentTasks).flat();
        const relatedTask = allTasks.find(t => t.id === topDoc.taskId);
        if (relatedTask) {
            response += `\n\n📋 Your Task Status: "${relatedTask.title}" is ${relatedTask.completed ? '✅ completed!' : '⏳ pending - mark it complete when done!'}`;
        }
    }

    return response;
}

/**
 * Extract context keywords from conversation history
 * @param {Array} conversationHistory - Previous messages
 * @returns {string} - Combined context from recent messages
 */
function extractConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length < 2) return '';

    // Get the last few messages for context (excluding the current question)
    const recentMessages = conversationHistory.slice(-4);
    const contextText = recentMessages
        .map(msg => msg.content)
        .join(' ')
        .toLowerCase();

    return contextText;
}

/**
 * Enhance query with conversation context for follow-up questions
 * @param {string} query - Current user query
 * @param {Array} conversationHistory - Previous messages
 * @returns {string} - Enhanced query with context
 */
function enhanceQueryWithContext(query, conversationHistory) {
    const queryLower = query.toLowerCase();

    // Don't enhance if query already contains specific task keywords
    const specificKeywords = [
        'handbook', 'workstation', 'buddy', 'hr', 'security', 'standup',
        'codebase', 'environment', 'pull request', 'pr', 'career', 'goals',
        'training', 'team', 'setup', 'password', 'email', 'laptop', 'computer'
    ];

    if (specificKeywords.some(kw => queryLower.includes(kw))) {
        // Query is already specific enough, don't add context
        return query;
    }

    // Detect follow-up question patterns (vague questions that need context)
    const followUpPatterns = [
        'why', 'what about', 'and then', 'also', 'more about', 'tell me more',
        'explain', 'what do you mean', 'can you clarify', 'how do i', 'when is',
        'where is', 'who is', 'which one', 'for what', 'reason'
    ];

    const isFollowUp = followUpPatterns.some(pattern => queryLower.includes(pattern));

    if (!isFollowUp || !conversationHistory || conversationHistory.length < 2) {
        return query;
    }

    // Get context from previous assistant response
    const previousResponses = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .slice(-1);

    if (previousResponses.length === 0) return query;

    const lastResponse = previousResponses[0].content.toLowerCase();

    // Extract key topics from the last response to understand context
    const topicKeywords = [];

    // Check what tasks/topics were discussed - only add if the topic was actually discussed
    if (lastResponse.includes('company handbook') || lastResponse.includes('handbook covers')) {
        topicKeywords.push('handbook');
    }
    if (lastResponse.includes('workstation') || lastResponse.includes('laptop') || lastResponse.includes('computer')) {
        topicKeywords.push('workstation setup');
    }
    if (lastResponse.includes('onboarding buddy') || lastResponse.includes('your buddy')) {
        topicKeywords.push('buddy');
    }
    if (lastResponse.includes('hr@company.com') || lastResponse.includes('human resources')) {
        topicKeywords.push('hr human resources');
    }
    if (lastResponse.includes('security training') || lastResponse.includes('security@company.com')) {
        topicKeywords.push('security training');
    }
    if (lastResponse.includes('daily standup') || lastResponse.includes('team standup')) {
        topicKeywords.push('standup meeting');
    }
    if (lastResponse.includes('codebase documentation') || lastResponse.includes('code documentation')) {
        topicKeywords.push('codebase documentation');
    }
    if (lastResponse.includes('development environment') || lastResponse.includes('dev environment')) {
        topicKeywords.push('development environment');
    }
    if (lastResponse.includes('first pr') || lastResponse.includes('pull request')) {
        topicKeywords.push('first pr');
    }
    if (lastResponse.includes('career goals') || lastResponse.includes('goals with manager')) {
        topicKeywords.push('career goals');
    }
    if (lastResponse.includes('role-specific training') || lastResponse.includes('role training')) {
        topicKeywords.push('training');
    }
    if (lastResponse.includes('meet all team') || lastResponse.includes('team members')) {
        topicKeywords.push('team members');
    }

    // Combine query with context
    if (topicKeywords.length > 0) {
        return `${query} ${topicKeywords.join(' ')}`;
    }

    return query;
}

/**
 * Generate contextual follow-up response
 * @param {string} query - User's follow-up question
 * @param {Array} conversationHistory - Previous messages
 * @returns {string|null} - Contextual response or null if not a follow-up
 */
function handleFollowUpQuestion(query, conversationHistory) {
    if (!conversationHistory || conversationHistory.length < 2) return null;

    const queryLower = query.toLowerCase();

    // Get the last assistant response
    const assistantMessages = conversationHistory.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length === 0) return null;

    const lastResponse = assistantMessages[assistantMessages.length - 1].content.toLowerCase();

    // Handle "why" questions about contacts
    if ((queryLower.includes('why') && queryLower.includes('contact')) ||
        (queryLower.includes('why') && queryLower.includes('hr')) ||
        (queryLower.includes('for what') && queryLower.includes('contact'))) {

        if (lastResponse.includes('handbook') || lastResponse.includes('hr@company.com')) {
            return `Great follow-up question! 

📧 You would contact HR (hr@company.com) regarding the Company Handbook for:

• Questions about specific policies that aren't clear
• Requesting clarification on work hours or remote work arrangements
• Understanding benefits enrollment details
• Reporting any concerns about code of conduct
• Getting updates on policy changes
• Personal situations like leave requests or special accommodations

HR is also your go-to for any general onboarding questions that your buddy or manager can't answer!`;
        }

        if (lastResponse.includes('workstation') || lastResponse.includes('it-support')) {
            return `Good question! 

📧 You would contact IT Support (it-support@company.com) for:

• Issues logging into your laptop or accounts
• Password resets or 2FA setup problems
• Software installation requests
• VPN connection issues
• Hardware problems with your workstation
• Access permissions to internal systems

They're available 24/7 and usually respond within a few hours!`;
        }

        if (lastResponse.includes('security') || lastResponse.includes('security@company.com')) {
            return `Great question!

📧 You would contact the Security team (security@company.com) for:

• Questions about the security training content
• Reporting suspicious emails or potential phishing attempts
• Clarification on data handling policies
• Reporting a potential security incident
• Questions about VPN or secure access requirements

It's always better to report something and have it be nothing than to ignore a potential threat!`;
        }
    }

    // Handle "tell me more" or "explain more" questions
    if (queryLower.includes('more') || queryLower.includes('explain') || queryLower.includes('elaborate')) {
        // This will let the enhanced query handle it with context
        return null;
    }

    return null;
}

/**
 * Main function - calls backend LLM API for response
 * @param {string} query - User's question
 * @param {Object} currentTasks - Current user's task state
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
export async function askOnboardingCoach(query, currentTasks, conversationHistory = []) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: query,
                conversationHistory: conversationHistory,
                currentTasks: currentTasks
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Chat API error:', errorData);
            return errorData.response || "I'm having trouble connecting. Please try again!";
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error calling chat API:', error);

        // Fallback for connection errors
        if (error.message.includes('Failed to fetch')) {
            return `⚠️ I couldn't connect to my AI brain. 

Please make sure:
1. The backend server is running: cd backend && npm start
2. Ollama is running: ollama serve

Once they're running, try asking your question again!`;
        }

        return "I encountered an issue. Please try again in a moment!";
    }
}

/**
 * Get suggested questions based on incomplete tasks
 * @param {Object} currentTasks - Current user's task state
 * @returns {Array} - Suggested questions
 */
export function getSuggestedQuestions(currentTasks) {
    if (!currentTasks) return [];

    const incompleteTasks = Object.values(currentTasks)
        .flat()
        .filter(t => !t.completed)
        .slice(0, 3);

    const suggestions = incompleteTasks.map(task => {
        const doc = knowledgeBase.find(d => d.taskId === task.id);
        if (doc) {
            return {
                task: task.title,
                question: `How do I ${task.title.toLowerCase()}?`
            };
        }
        return null;
    }).filter(Boolean);

    return suggestions;
}
