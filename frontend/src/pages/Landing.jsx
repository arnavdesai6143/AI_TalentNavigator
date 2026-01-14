import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Target,
    BookOpen,
    TrendingUp,
    Users,
    MessageSquare,
    Briefcase,
    Bot,
    ArrowRight,
    CheckCircle2,
    Zap,
    Shield
} from 'lucide-react';
import './Landing.css';

const features = [
    {
        icon: Sparkles,
        title: 'Smart Onboarding',
        description: 'Personalized onboarding journey with AI-guided tasks and company knowledge base.',
        color: '#818cf8'
    },
    {
        icon: BookOpen,
        title: 'Learning Hub',
        description: 'AI-curated courses and learning paths tailored to your career goals.',
        color: '#22d3ee'
    },
    {
        icon: TrendingUp,
        title: 'Career Path',
        description: 'Visualize and plan your career trajectory with predictive analytics.',
        color: '#f59e0b'
    },
    {
        icon: MessageSquare,
        title: 'Feedback Analysis',
        description: 'NLP-powered insights from performance reviews and peer feedback.',
        color: '#10b981'
    },
    {
        icon: Briefcase,
        title: 'Opportunity Matcher',
        description: 'Find projects and roles that align with your skills and interests.',
        color: '#ec4899'
    },
    {
        icon: Users,
        title: 'Mentor Connect',
        description: 'Get matched with mentors who can guide your professional growth.',
        color: '#8b5cf6'
    }
];

const agents = [
    { name: 'Onboarding Coach', status: 'active' },
    { name: 'Skill Navigator', status: 'active' },
    { name: 'Learning Recommender', status: 'active' },
    { name: 'Feedback Analyzer', status: 'active' },
    { name: 'Career Coach', status: 'active' },
    { name: 'Project Matcher', status: 'active' },
    { name: 'Mentor Matcher', status: 'active' },
    { name: 'Orchestrator', status: 'active' }
];

function Landing() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <Link to="/" className="landing-logo">
                    <div className="logo-icon">
                        <Target size={24} />
                    </div>
                    <span>AI Talent<span className="accent">Navigator</span></span>
                </Link>
                <div className="nav-links">
                    <Link to="/login" className="btn btn-ghost">Sign In</Link>
                    <Link to="/login?register=true" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-glow hero-glow-1" />
                    <div className="hero-glow hero-glow-2" />
                    <div className="hero-grid" />
                </div>

                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="hero-badge">
                            <Zap size={14} />
                            <span>Powered by Multi-Agent AI</span>
                        </div>

                        <h1 className="hero-title">
                            Your AI Career Copilot <br />
                            <span className="text-gradient">From Day One</span>
                        </h1>

                        <p className="hero-subtitle">
                            Navigate your professional journey with a network of intelligent AI agents.
                            Get personalized guidance for onboarding, learning, career growth, and more.
                        </p>

                        <div className="hero-cta">
                            <Link to="/login?register=true" className="btn btn-primary btn-lg">
                                Start Your Journey
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/agents" className="btn btn-secondary btn-lg">
                                <Bot size={18} />
                                Explore Agents
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">8</span>
                                <span className="stat-label">AI Agents</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">100+</span>
                                <span className="stat-label">Learning Paths</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">50+</span>
                                <span className="stat-label">Skills Tracked</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Agent Network Visualization */}
                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="agent-network">
                            <div className="central-hub">
                                <Bot size={32} />
                                <span>Orchestrator</span>
                            </div>
                            {agents.slice(0, 6).map((agent, i) => (
                                <div
                                    key={agent.name}
                                    className={`agent-node agent-node-${i + 1}`}
                                >
                                    <div className="agent-dot" />
                                    <span>{agent.name}</span>
                                </div>
                            ))}
                            <svg className="connections">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <line
                                        key={i}
                                        className={`connection connection-${i}`}
                                    />
                                ))}
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">
                            Everything You Need to <span className="text-gradient">Grow</span>
                        </h2>
                        <p className="section-subtitle">
                            A complete ecosystem of AI-powered tools to accelerate your career development
                        </p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div
                                    className="feature-icon"
                                    style={{ background: `${feature.color}20`, color: feature.color }}
                                >
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">
                            How It <span className="text-gradient">Works</span>
                        </h2>
                    </motion.div>

                    <div className="steps">
                        {[
                            { step: 1, title: 'Create Your Profile', desc: 'Set up your skills, goals, and career aspirations' },
                            { step: 2, title: 'AI Analyzes Your Data', desc: 'Our agents process your profile and feedback' },
                            { step: 3, title: 'Get Personalized Guidance', desc: 'Receive tailored recommendations and paths' },
                            { step: 4, title: 'Track Your Progress', desc: 'Monitor growth and celebrate achievements' }
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                className="step-card"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                            >
                                <div className="step-number">{item.step}</div>
                                <div className="step-content">
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                                {index < 3 && <ArrowRight className="step-arrow" size={20} />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="trust-section">
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item">
                            <Shield size={24} />
                            <span>Enterprise Security</span>
                        </div>
                        <div className="trust-item">
                            <CheckCircle2 size={24} />
                            <span>GDPR Compliant</span>
                        </div>
                        <div className="trust-item">
                            <Zap size={24} />
                            <span>Real-time AI</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-card glass"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Ready to Transform Your Career?</h2>
                        <p>Join thousands of professionals using AI to accelerate their growth</p>
                        <Link to="/login?register=true" className="btn btn-primary btn-lg">
                            Get Started Free
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="landing-logo">
                                <div className="logo-icon">
                                    <Target size={20} />
                                </div>
                                <span>AI Talent<span className="accent">Navigator</span></span>
                            </div>
                            <p>Empowering careers with intelligent AI guidance</p>
                        </div>
                        <div className="footer-links">
                            <a href="#">About</a>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2024 AI Talent Navigator. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
