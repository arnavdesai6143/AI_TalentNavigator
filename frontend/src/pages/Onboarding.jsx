import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    Sparkles,
    CheckCircle2,
    Circle,
    Clock,
    MessageCircle,
    Send,
    FileText,
    Users,
    Code,
    Briefcase,
    ChevronRight,
    Loader2,
    Bot
} from 'lucide-react';
import { getOnboardingTasks, toggleOnboardingTask, initializeUserData } from '../services/userDataService';
import { askOnboardingCoach, getSuggestedQuestions } from '../services/onboardingKnowledge';
import './Onboarding.css';

const initialMessage = {
    role: 'assistant',
    content: `Hi! I'm your Onboarding Coach 🎉

I'm here to help you with the tasks shown on this page — from Day 1 setup to your Month 1 milestones.

📋 I can answer questions about your:
• Day 1 tasks
• Week 1 tasks  
• Month 1 tasks

⚠️ I'm specialized in onboarding tasks only and will redirect off-topic questions.

What would you like to know about your onboarding?`
};

function Onboarding() {
    const { user } = useAuth();
    const [activePhase, setActivePhase] = useState('Day 1');
    const [tasks, setTasks] = useState(null);
    const [messages, setMessages] = useState([initialMessage]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    // Initialize tasks from localStorage on mount
    useEffect(() => {
        if (user?.id) {
            // Initialize user data if needed
            initializeUserData(user.id);
            // Load tasks from localStorage
            const savedTasks = getOnboardingTasks(user.id);
            setTasks(savedTasks);
            // Generate suggested questions based on incomplete tasks
            const suggestions = getSuggestedQuestions(savedTasks);
            setSuggestedQuestions(suggestions);
        }
    }, [user?.id]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const toggleTask = (phase, taskId) => {
        if (!user?.id) return;
        // Update in localStorage and get the updated tasks
        const updatedTasks = toggleOnboardingTask(user.id, phase, taskId);
        setTasks(updatedTasks);
    };

    const getProgress = (phase) => {
        if (!tasks || !tasks[phase]) return 0;
        const phaseTasks = tasks[phase];
        const completed = phaseTasks.filter(t => t.completed).length;
        return Math.round((completed / phaseTasks.length) * 100);
    };

    const getOverallProgress = () => {
        if (!tasks) return 0;
        const allTasks = Object.values(tasks).flat();
        const completed = allTasks.filter(t => t.completed).length;
        return Math.round((completed / allTasks.length) * 100);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'meeting': return Users;
            case 'document': return FileText;
            case 'setup': return Code;
            case 'training': return Briefcase;
            case 'code': return Code;
            default: return FileText;
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { role: 'user', content: inputValue };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        const query = inputValue;
        setInputValue('');
        setIsTyping(true);

        try {
            // Use RAG-based AI to generate response with conversation history for context
            const response = await askOnboardingCoach(query, tasks, updatedMessages);

            const aiMessage = {
                role: 'assistant',
                content: response
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I encountered an issue. Please try asking your question again."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Loading state - show spinner while tasks load from localStorage
    if (!tasks) {
        return (
            <div className="onboarding-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 72px)' }}>
                <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    <Loader2 className="spin" size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                    <p>Loading your onboarding tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Header */}
                <motion.div
                    className="onboarding-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <div className="header-badge">
                            <Sparkles size={14} />
                            <span>Your Onboarding Journey</span>
                        </div>
                        <h1>Welcome to the Team!</h1>
                        <p>Complete your onboarding tasks to get up to speed quickly.</p>
                    </div>

                    <div className="progress-card glass-card">
                        <div className="progress-circle">
                            <svg viewBox="0 0 100 100">
                                <circle className="progress-bg" cx="50" cy="50" r="45" />
                                <circle
                                    className="progress-fill"
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    style={{
                                        strokeDasharray: `${getOverallProgress() * 2.83} 283`
                                    }}
                                />
                            </svg>
                            <span className="progress-value">{getOverallProgress()}%</span>
                        </div>
                        <div className="progress-info">
                            <span className="progress-label">Overall Progress</span>
                            <span className="progress-status">
                                {Object.values(tasks).flat().filter(t => t.completed).length} of {Object.values(tasks).flat().length} tasks
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="onboarding-content">
                    {/* Timeline Section */}
                    <motion.div
                        className="timeline-section"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Phase Tabs */}
                        <div className="phase-tabs">
                            {Object.keys(tasks).map((phase) => (
                                <button
                                    key={phase}
                                    className={`phase-tab ${activePhase === phase ? 'active' : ''}`}
                                    onClick={() => setActivePhase(phase)}
                                >
                                    <span className="phase-name">{phase}</span>
                                    <span className="phase-progress">{getProgress(phase)}%</span>
                                </button>
                            ))}
                        </div>

                        {/* Tasks List */}
                        <div className="tasks-container glass-card">
                            <div className="tasks-header">
                                <h2>{activePhase} Tasks</h2>
                                <span className="tasks-count">
                                    {tasks?.[activePhase]?.filter(t => t.completed).length || 0}/{tasks?.[activePhase]?.length || 0} completed
                                </span>
                            </div>

                            <div className="tasks-list">
                                {(tasks?.[activePhase] || []).map((task, index) => {
                                    const TypeIcon = getTypeIcon(task.type);
                                    return (
                                        <motion.div
                                            key={task.id}
                                            className={`task-item ${task.completed ? 'completed' : ''}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <button
                                                className="task-checkbox"
                                                onClick={() => toggleTask(activePhase, task.id)}
                                            >
                                                {task.completed ? (
                                                    <CheckCircle2 className="check-icon completed" size={22} />
                                                ) : (
                                                    <Circle className="check-icon" size={22} />
                                                )}
                                            </button>
                                            <div className="task-content">
                                                <span className="task-title">{task.title}</span>
                                                <span className={`task-type type-${task.type}`}>
                                                    <TypeIcon size={12} />
                                                    {task.type}
                                                </span>
                                            </div>
                                            <ChevronRight className="task-arrow" size={18} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Chat Section */}
                    <motion.div
                        className="chat-section glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="chat-header">
                            <div className="chat-agent">
                                <div className="agent-avatar">
                                    <Bot size={20} />
                                </div>
                                <div className="agent-info">
                                    <span className="agent-name">Onboarding Coach</span>
                                    <span className="agent-status">
                                        <span className="status-dot" />
                                        Always available
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="message-avatar">
                                            <Bot size={16} />
                                        </div>
                                    )}
                                    <div className="message-content">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message assistant">
                                    <div className="message-avatar">
                                        <Bot size={16} />
                                    </div>
                                    <div className="message-content typing">
                                        <span className="dot" />
                                        <span className="dot" />
                                        <span className="dot" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Ask about your onboarding tasks..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="input"
                            />
                            <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                                <Send size={18} />
                            </button>
                        </form>

                        <div className="quick-questions">
                            <span>Try asking:</span>
                            <button onClick={() => setInputValue('How do I set up my workstation?')}>
                                Workstation setup
                            </button>
                            <button onClick={() => setInputValue('What is in the security training?')}>
                                Security training
                            </button>
                            <button onClick={() => setInputValue('How do I make my first PR?')}>
                                First PR
                            </button>
                            <button onClick={() => setInputValue("What's my progress?")}>
                                My progress
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Onboarding;
