import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    Target,
    Mail,
    Lock,
    User,
    Building2,
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Sparkles,
    ChevronDown,
    Plus,
    X
} from 'lucide-react';
import { ALL_SKILLS, ROLE_SKILL_REQUIREMENTS } from '../data/courseData';
import { formatJobTitle } from '../utils/formatters';
import './Login.css';

function Login() {
    const [searchParams] = useSearchParams();
    const isRegisterMode = searchParams.get('register') === 'true';
    const [isRegister, setIsRegister] = useState(isRegisterMode);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        title: '',
        department: '',
        role: 'employee',
        targetRole: '',
        currentSkills: {}
    });
    const [showSkillSelector, setShowSkillSelector] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                if (!formData.targetRole) {
                    throw new Error('Please select a career goal');
                }
                await register(formData);
            } else {
                await login(formData.email, formData.password, formData.role);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role) => {
        setLoading(true);
        try {
            const email = role === 'employee' ? 'john.doe@company.com' : `demo-${role}@company.com`;
            await login(email, 'demo123', 'employee'); // Force role to employee
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-glow login-glow-1" />
                <div className="login-glow login-glow-2" />
            </div>

            <Link to="/" className="login-logo">
                <div className="logo-icon">
                    <Target size={24} />
                </div>
                <span>AI Talent<span className="accent">Navigator</span></span>
            </Link>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="login-card glass">
                    <div className="login-header">
                        <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                        <p>
                            {isRegister
                                ? 'Start your AI-powered career journey'
                                : 'Sign in to continue your journey'
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        {isRegister && (
                            <>
                                <div className="input-group">
                                    <label htmlFor="name">Full Name</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label htmlFor="title">Job Title</label>
                                        <div className="input-wrapper">
                                            <Building2 className="input-icon" size={18} />
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="Software Engineer"
                                                className="input"
                                                onBlur={(e) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        title: formatJobTitle(e.target.value)
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="department">Department</label>
                                        <div className="input-wrapper">
                                            <Building2 className="input-icon" size={18} />
                                            <input
                                                type="text"
                                                id="department"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                placeholder="Engineering"
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Target Role Selection */}
                                <div className="input-group">
                                    <label htmlFor="targetRole">
                                        <Sparkles size={14} className="label-icon" />
                                        Career Goal
                                    </label>
                                    <select
                                        id="targetRole"
                                        name="targetRole"
                                        value={formData.targetRole}
                                        onChange={handleChange}
                                        className="input select"
                                    >
                                        <option value="" disabled>Select a career goal...</option>
                                        {Object.keys(ROLE_SKILL_REQUIREMENTS).map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <span className="input-hint">
                                        {ROLE_SKILL_REQUIREMENTS[formData.targetRole]?.description}
                                    </span>
                                </div>

                                {/* Current Skills Selection */}
                                <div className="input-group skills-section">
                                    <label>
                                        <Target size={14} className="label-icon" />
                                        Your Current Skills
                                    </label>

                                    {/* Selected Skills */}
                                    <div className="selected-skills">
                                        {Object.entries(formData.currentSkills).map(([skill, level]) => (
                                            <div key={skill} className="skill-tag">
                                                <span className="skill-name">{skill}</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={level}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        currentSkills: {
                                                            ...prev.currentSkills,
                                                            [skill]: parseInt(e.target.value)
                                                        }
                                                    }))}
                                                    className="skill-slider"
                                                />
                                                <span className="skill-level">{level}%</span>
                                                <button
                                                    type="button"
                                                    className="remove-skill"
                                                    onClick={() => {
                                                        const newSkills = { ...formData.currentSkills };
                                                        delete newSkills[skill];
                                                        setFormData(prev => ({ ...prev, currentSkills: newSkills }));
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Skill Dropdown */}
                                    <div className="add-skill-container">
                                        <select
                                            value={selectedSkill}
                                            onChange={(e) => {
                                                if (e.target.value && !formData.currentSkills[e.target.value]) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        currentSkills: {
                                                            ...prev.currentSkills,
                                                            [e.target.value]: 50
                                                        }
                                                    }));
                                                    setSelectedSkill('');
                                                }
                                            }}
                                            className="input select add-skill-select"
                                        >
                                            <option value="">+ Add a skill...</option>
                                            {ALL_SKILLS
                                                .filter(skill => !formData.currentSkills[skill])
                                                .map(skill => (
                                                    <option key={skill} value={skill}>{skill}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <span className="input-hint">
                                        Add your skills and adjust proficiency levels (0-100%)
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="spin" size={20} />
                            ) : (
                                <>
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>or try a demo</span>
                    </div>

                    <div className="demo-buttons">
                        <button
                            className="demo-btn"
                            onClick={() => handleDemoLogin('employee')}
                            disabled={loading}
                        >
                            <span className="demo-role">Employee Demo</span>
                            <span className="demo-name">John Doe</span>
                            <ArrowRight size={14} className="demo-arrow" />
                        </button>
                    </div>

                    <p className="login-footer-text">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            className="toggle-btn"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
