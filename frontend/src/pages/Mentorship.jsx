import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
    Users,
    Search,
    Target,
    Sparkles,
    MessageCircle,
    Star,
    MapPin,
    Briefcase,
    CheckCircle2,
    Filter,
    Check,
    X
} from 'lucide-react';
import { getUserMentorship, requestMentorship, initializeUserData } from '../services/userDataService';
import { getRecommendedMentors } from '../data/mentorData';
import './Mentorship.css';



function Mentorship() {
    const { user } = useAuth();
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' or 'available'
    const [mentorsList, setMentorsList] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [toast, setToast] = useState(null);

    // Load existing mentorship requests from localStorage
    useEffect(() => {
        if (user?.id) {
            initializeUserData(user.id);
            const mentorshipData = getUserMentorship(user.id);
            setPendingRequests(mentorshipData.pendingRequests.map(m => m.id));

            // Load dynamic recommendations
            const recommended = getRecommendedMentors(user);
            setMentorsList(recommended);
        }
    }, [user?.id, user?.targetRole]); // Re-run when target role changes

    const toggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const handleRequestMentorship = (mentor) => {
        if (!user?.id) return;

        if (pendingRequests.includes(mentor.id)) {
            setToast({ type: 'info', message: `You've already requested mentorship from ${mentor.name}` });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        // Save to localStorage
        const mentorshipData = requestMentorship(user.id, mentor);
        setPendingRequests(mentorshipData.pendingRequests.map(m => m.id));

        setToast({ type: 'success', message: `Mentorship request sent to ${mentor.name}!` });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredMentors = mentorsList.filter(mentor => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = mentor.name.toLowerCase().includes(query) ||
                mentor.title.toLowerCase().includes(query) ||
                mentor.skills.some(s => s.toLowerCase().includes(query));
            if (!matchesSearch) return false;
        }

        // Skill Filter (OR logic - match any selected skill)
        if (selectedSkills.length > 0) {
            const hasSkill = mentor.skills.some(skill => selectedSkills.includes(skill));
            if (!hasSkill) return false;
        }

        // Availability Filter
        if (availabilityFilter === 'available' && !mentor.available) {
            return false;
        }

        return true;
    });

    const allSkills = [...new Set(mentorsList.flatMap(m => m.skills))].slice(0, 12); // Limit skills shown in filter

    return (
        <div className="mentorship-page">
            <div className="mentorship-container">
                {/* Header */}
                <motion.div
                    className="mentorship-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-content">
                        <h1>
                            <Users className="header-icon" />
                            Mentor & Network
                        </h1>
                        <p>Connect with mentors who can guide your professional growth</p>
                    </div>
                </motion.div>

                <div className="mentorship-content">
                    {/* Filters Sidebar */}
                    <motion.div
                        className="filters-sidebar glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2>
                            <Filter size={18} />
                            Find a Mentor
                        </h2>

                        <div className="filter-section">
                            <label>Search by name</label>
                            <div className="search-input-wrapper">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search mentors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="filter-section">
                            <label>Skills to develop</label>
                            <div className="skill-filters">
                                {allSkills.map((skill) => (
                                    <button
                                        key={skill}
                                        className={`skill-filter ${selectedSkills.includes(skill) ? 'active' : ''}`}
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-section">
                            <label>Availability</label>
                            <div className="availability-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={availabilityFilter === 'available'}
                                        onChange={(e) => setAvailabilityFilter(e.target.checked ? 'available' : 'all')}
                                    />
                                    <span>Available now</span>
                                </label>
                            </div>
                        </div>

                        <button className="btn btn-primary apply-filters">
                            Apply Filters
                        </button>
                    </motion.div>

                    {/* Mentors List */}
                    <div className="mentors-list">
                        <div className="list-header">
                            <span className="results-count">{filteredMentors.length} mentors found</span>
                            <div className="ai-match-badge">
                                <Sparkles size={14} />
                                Sorted by AI match score
                            </div>
                        </div>

                        {filteredMentors.length === 0 ? (
                            <div className="no-results">
                                <p>No mentors found matching your criteria. Try adjusting filters.</p>
                            </div>
                        ) : (
                            filteredMentors.map((mentor, index) => (
                                <motion.div
                                    key={mentor.id}
                                    className="mentor-card glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="mentor-main">
                                        <div className="mentor-avatar">
                                            {mentor.avatar ? (
                                                <img src={mentor.avatar} alt={mentor.name} />
                                            ) : (
                                                <span>{mentor.name.split(' ').map(n => n[0]).join('')}</span>
                                            )}
                                            {mentor.available && <div className="availability-dot" />}
                                        </div>

                                        <div className="mentor-info">
                                            <div className="mentor-header">
                                                <div>
                                                    <h3 className="mentor-name">{mentor.name}</h3>
                                                    <p className="mentor-title">{mentor.title}</p>
                                                </div>
                                            </div>

                                            <div className="mentor-meta">
                                                <span className="meta-item">
                                                    <Briefcase size={14} />
                                                    {mentor.department}
                                                </span>
                                                <span className="meta-item">
                                                    <Star size={14} />
                                                    {mentor.experience}
                                                </span>
                                                <span className="meta-item">
                                                    <Users size={14} />
                                                    {mentor.mentees} mentees
                                                </span>
                                            </div>

                                            <div className="mentor-skills">
                                                {mentor.skills.map((skill) => (
                                                    <span key={skill} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>

                                            <div className="match-reasons">
                                                <h4>
                                                    <Sparkles size={14} />
                                                    Why this match
                                                </h4>
                                                <ul>
                                                    {mentor.matchReasons.map((reason, i) => (
                                                        <li key={i}>
                                                            <CheckCircle2 size={12} />
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mentor-actions">
                                        <button
                                            className={`btn ${pendingRequests.includes(mentor.id) ? 'btn-secondary' : 'btn-primary'}`}
                                            onClick={() => handleRequestMentorship(mentor)}
                                        >
                                            {pendingRequests.includes(mentor.id) ? (
                                                <><Check size={16} /> Request Sent</>
                                            ) : (
                                                <><MessageCircle size={16} /> Request Mentorship</>
                                            )}
                                        </button>
                                        <button className="btn btn-ghost">
                                            View Profile
                                        </button>
                                    </div>
                                </motion.div>
                            )))}
                    </div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            className={`toast toast-${toast.type}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            {toast.type === 'success' ? <Check size={18} /> : <MessageCircle size={18} />}
                            {toast.message}
                            <button onClick={() => setToast(null)}><X size={16} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Mentorship;
