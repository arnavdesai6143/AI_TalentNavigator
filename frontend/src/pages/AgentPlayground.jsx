import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    Bot,
    Sparkles,
    MessageCircle,
    Send,
    BookOpen,
    Target,
    Users,
    Briefcase,
    TrendingUp,
    MessageSquare,
    Zap,
    Network,
    ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './AgentPlayground.css';

const agents = [
    {
        id: 'onboarding',
        name: 'Onboarding Coach',
        icon: Sparkles,
        description: 'Guides new hires through their first days with personalized checklists and RAG-powered Q&A.',
        status: 'active',
        color: '#818cf8'
    },
    {
        id: 'skill',
        name: 'Skill Navigator',
        icon: Target,
        description: 'Maintains your skills graph and identifies gaps between current abilities and career goals.',
        status: 'active',
        color: '#22d3ee'
    },
    {
        id: 'learning',
        name: 'Learning Recommender',
        icon: BookOpen,
        description: 'Uses ML to recommend courses based on your profile, goals, and similar users\' paths.',
        status: 'active',
        color: '#10b981'
    },
    {
        id: 'feedback',
        name: 'Feedback Analyzer',
        icon: MessageSquare,
        description: 'Extracts insights from reviews using NLP - sentiment analysis and skill mapping.',
        status: 'active',
        color: '#f59e0b'
    },
    {
        id: 'career',
        name: 'Career Coach',
        icon: TrendingUp,
        description: 'Simulates career paths using historical data and sequence models.',
        status: 'active',
        color: '#ec4899'
    },
    {
        id: 'project',
        name: 'Project Matcher',
        icon: Briefcase,
        description: 'Matches you to projects using embeddings and explains why they\'re recommended.',
        status: 'active',
        color: '#8b5cf6'
    },
    {
        id: 'mentor',
        name: 'Mentor Matcher',
        icon: Users,
        description: 'Finds mentors using similarity search over skills, experience, and interests.',
        status: 'active',
        color: '#06b6d4'
    },
    {
        id: 'orchestrator',
        name: 'Orchestrator',
        icon: Network,
        description: 'Coordinates all agents to handle complex requests that need multiple capabilities.',
        status: 'active',
        color: '#6366f1'
    }
];

function AgentPlayground() {
    const { user } = useAuth();
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState([]);

    // Helper to get full agent name
    const getAgentName = (id) => {
        const agent = agents.find(a => a.id === id);
        return agent ? agent.name : id;
    };

    const addLogEntry = (fromId, toId, message) => {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        setLogs(prev => [...prev, {
            time: timeString,
            from: getAgentName(fromId),
            to: getAgentName(toId),
            message
        }]);
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isLoading) return;

        const userMessage = chatInput;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setLogs([]); // Clear logs for new request
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    type: 'orchestrator',
                    userContext: user
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const fullText = data.response;

            // 1. Parse Logs: Extract lines starting with [[LOG:
            const logPattern = /\[\[LOG:\s*(.*?)\s*->\s*(.*?):\s*(.*?)\]\]/g;
            const newLogs = [];
            let match;

            // We use a loop to find all log matches
            while ((match = logPattern.exec(fullText)) !== null) {
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                newLogs.push({
                    time: timeString,
                    from: match[1].trim(),
                    to: match[2].trim(),
                    message: match[3].trim()
                });
            }

            // Animate logs appearing one by one for effect
            if (newLogs.length > 0) {
                newLogs.forEach((log, index) => {
                    setTimeout(() => {
                        setLogs(prev => [...prev, log]);
                    }, index * 800); // Stagger logs
                });
            }

            // 2. Clean Response: Remove log lines from the final message
            const cleanMessage = fullText.replace(/\[\[LOG:.*?\]\]/g, '').trim();

            // Show final message after logs are done
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage }]);
                setIsLoading(false);
            }, (newLogs.length * 800) + 500);

        } catch (error) {
            console.error('Orchestrator error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the agent network. Please ensure the backend is running." }]);
            setIsLoading(false);
        }
    };

    return (
        <div className="agents-page">
            <div className="agents-container">
                {/* Header */}
                <motion.div
                    className="agents-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>
                            <Bot className="header-icon" />
                            Agent Playground
                        </h1>
                        <p>Explore our multi-agent AI system and see how agents collaborate</p>
                    </div>
                </motion.div>

                <div className="agents-content">
                    {/* Agents Grid */}
                    <motion.div
                        className="agents-grid-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2>Active Agents</h2>
                        <div className="agents-grid">
                            {agents.map((agent, index) => (
                                <motion.div
                                    key={agent.id}
                                    className={`agent-card glass-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAgent(agent)}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div
                                        className="agent-icon"
                                        style={{ background: `${agent.color}20`, color: agent.color }}
                                    >
                                        <agent.icon size={24} />
                                    </div>
                                    <div className="agent-info">
                                        <h3>{agent.name}</h3>
                                        <p>{agent.description}</p>
                                    </div>
                                    <div className="agent-status">
                                        <span className="status-dot" />
                                        Active
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chat Interface */}
                    <motion.div
                        className="chat-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="chat-header">
                            <div className="chat-title">
                                <Zap size={20} />
                                <h2>Test the Orchestrator</h2>
                            </div>
                            <span className="chat-subtitle">Ask anything and see agents collaborate</span>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="empty-chat">
                                    <Bot size={48} />
                                    <p>Try asking: "What should I focus on to become a Senior Engineer?"</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="message-avatar">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {msg.role === 'assistant' ? (
                                            <div className="markdown-content">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.content.split('\n').map((line, i) => (
                                                <p key={i}>{line || <br />}</p>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message assistant">
                                    <div className="message-avatar">
                                        <Zap size={16} />
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form className="chat-input" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={isLoading ? "Orchestrating agents..." : "Ask the orchestrator..."}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                className="input"
                                disabled={isLoading}
                            />
                            <button type="submit" className="send-btn" disabled={isLoading}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>

                    {/* Agent Communication Log */}
                    <motion.div
                        className="comm-log glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="log-header">
                            <h2>
                                <Network size={20} />
                                Agent Communication Log
                            </h2>
                            <span className="log-subtitle">Real-time inter-agent messages</span>
                        </div>

                        <div className="log-entries">
                            {logs.length === 0 ? (
                                <div className="empty-logs">
                                    <p>Waiting for agent interactions...</p>
                                </div>
                            ) : (
                                logs.map((entry, index) => (
                                    <div key={index} className="log-entry">
                                        <div className="entry-time">{entry.time}</div>
                                        <div className="entry-flow">
                                            <span className="agent-name">{entry.from}</span>
                                            <ArrowRight size={14} />
                                            <span className="agent-name">{entry.to}</span>
                                        </div>
                                        <div className="entry-message">{entry.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default AgentPlayground;
