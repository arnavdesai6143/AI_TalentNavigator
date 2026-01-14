import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    Briefcase,
    Clock,
    Users,
    Target,
    MapPin,
    Calendar,
    Sparkles,
    Filter,
    Search,
    ExternalLink,
    CheckCircle2,
    Check,
    Bookmark,
    BookmarkCheck,
    X
} from 'lucide-react';
import { getUserOpportunities, applyToOpportunity, bookmarkOpportunity, withdrawFromOpportunity, initializeUserData } from '../services/userDataService';
import { getRecommendedProjects, INITIAL_PROJECTS } from '../data/projectData';
import './Opportunities.css';

// Mock data
// Initial Mock data


function Opportunities() {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedProjects, setAppliedProjects] = useState([]);
    const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
    const [projectsList, setProjectsList] = useState(() => {
        const saved = localStorage.getItem('ai_talent_projects');
        return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    });
    const [toast, setToast] = useState(null);

    // Load user's opportunities from localStorage
    // Load user's opportunities from localStorage and recalculate matches
    useEffect(() => {
        if (user?.id) {
            initializeUserData(user.id);
            const userData = getUserOpportunities(user.id);
            setAppliedProjects(userData.applied.map(o => o.id));
            setBookmarkedProjects(userData.bookmarked.map(o => o.id));

            // Recalculate dynamic scores while preserving current spots/projects state
            setProjectsList(currentProjects => {
                return getRecommendedProjects(user, currentProjects);
            });
        }
    }, [user?.id, user?.targetRole, user?.currentSkills]);

    const handleApply = (project) => {
        if (!user?.id) return;

        let updatedProjects = [...projectsList];
        const projectIndex = updatedProjects.findIndex(p => p.id === project.id);

        if (projectIndex === -1) return;

        if (appliedProjects.includes(project.id)) {
            // Withdraw logic
            withdrawFromOpportunity(user.id, project.id);
            setAppliedProjects(prev => prev.filter(id => id !== project.id));

            // Increment spots (if not Unlimited)
            if (updatedProjects[projectIndex].spots !== 'Unlimited') {
                updatedProjects[projectIndex].spots += 1;
            }

            setToast({ type: 'info', message: `Application withdrawn for "${project.title}"` });
        } else {
            // Apply logic
            applyToOpportunity(user.id, project);
            setAppliedProjects(prev => [...prev, project.id]);

            // Decrement spots (if not Unlimited and > 0)
            if (updatedProjects[projectIndex].spots !== 'Unlimited' && updatedProjects[projectIndex].spots > 0) {
                updatedProjects[projectIndex].spots -= 1;
            }

            setToast({ type: 'success', message: `Interest expressed for "${project.title}"! The team will reach out soon.` });
        }

        // Update state and persistence
        setProjectsList(updatedProjects);
        localStorage.setItem('ai_talent_projects', JSON.stringify(updatedProjects));

        setTimeout(() => setToast(null), 3000);
    };

    const handleBookmark = (project) => {
        if (!user?.id) return;

        const isBookmarked = bookmarkedProjects.includes(project.id);
        bookmarkOpportunity(user.id, project);

        if (isBookmarked) {
            setBookmarkedProjects(prev => prev.filter(id => id !== project.id));
            setToast({ type: 'info', message: 'Removed from bookmarks' });
        } else {
            setBookmarkedProjects(prev => [...prev, project.id]);
            setToast({ type: 'success', message: 'Saved to bookmarks!' });
        }
        setTimeout(() => setToast(null), 2000);
    };

    const filteredProjects = projectsList.filter(project => {
        // Text Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = project.title.toLowerCase().includes(query) ||
                project.skills.some(s => s.toLowerCase().includes(query));
            if (!matchesSearch) return false;
        }

        // Category Filters
        switch (filter) {
            case 'high-match':
                return project.matchScore >= 90;
            case 'short-term':
                return project.duration.includes('week') || project.duration.includes('1 month');
            case 'hackathons':
                return project.title.toLowerCase().includes('hackathon');
            case 'applied':
                return appliedProjects.includes(project.id);

            default: // 'all'
                return true;
        }
    });

    return (
        <div className="opportunities-page">
            <div className="opportunities-container">
                {/* Header */}
                <motion.div
                    className="opportunities-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>
                            <Briefcase className="header-icon" />
                            Projects & Opportunities
                        </h1>
                        <p>Find internal projects, hackathons, and stretch assignments matched to your skills</p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="filters-bar glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search projects or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="filter-chips">
                        {[
                            { id: 'all', label: 'All Projects' },
                            { id: 'high-match', label: '90%+ Match' },
                            { id: 'short-term', label: 'Short-term' },
                            { id: 'hackathons', label: 'Hackathons' },
                            { id: 'applied', label: 'Applied' }
                        ].map((f) => (
                            <button
                                key={f.id}
                                className={`filter-chip ${filter === f.id ? 'active' : ''}`}
                                onClick={() => setFilter(f.id)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Projects Grid */}
                <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            className="project-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="project-header">
                                <div className="project-team">
                                    <Users size={14} />
                                    {project.team}
                                </div>
                                <div className={`match-badge ${project.matchScore >= 90 ? 'high' : ''}`}>
                                    <Target size={14} />
                                    {project.matchScore}% match
                                </div>
                            </div>

                            <h3 className="project-title">{project.title}</h3>
                            <p className="project-description">{project.description}</p>

                            <div className="project-skills">
                                {project.skills.map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>

                            <div className="project-meta">
                                <div className="meta-item">
                                    <Clock size={14} />
                                    {project.commitment}
                                </div>
                                <div className="meta-item">
                                    <Calendar size={14} />
                                    {project.duration}
                                </div>
                                <div className="meta-item spots">
                                    <CheckCircle2 size={14} />
                                    {project.spots} {typeof project.spots === 'number' ? 'spots' : ''}
                                </div>
                            </div>

                            <div className="match-reason">
                                <Sparkles size={14} />
                                <span>{project.matchReason}</span>
                            </div>

                            <div className="project-actions">
                                <button
                                    className={`btn ${appliedProjects.includes(project.id) ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => handleApply(project)}
                                >
                                    {appliedProjects.includes(project.id) ? (
                                        <><X size={16} /> Withdraw</>
                                    ) : (
                                        'Express Interest'
                                    )}
                                </button>
                                <button
                                    className={`btn ${bookmarkedProjects.includes(project.id) ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => handleBookmark(project)}
                                >
                                    {bookmarkedProjects.includes(project.id) ? (
                                        <BookmarkCheck size={16} />
                                    ) : (
                                        <Bookmark size={16} />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="no-results">
                        <p>No projects found matching your criteria</p>
                    </div>
                )}

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            {toast.type === 'success' ? <Check size={18} /> : <Briefcase size={18} />}
                            {toast.message}
                            <button onClick={() => setToast(null)}><X size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Opportunities;
