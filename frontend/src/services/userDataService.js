/**
 * User Data Service
 * Provides localStorage-based persistence for user-specific data.
 * Each user gets their own isolated data space.
 */

const STORAGE_PREFIX = 'ai_talent_';

/**
 * Get the storage key for a specific user and data type
 */
const getKey = (userId, dataType) => `${STORAGE_PREFIX}${userId}_${dataType}`;

/**
 * Get today's date as YYYY-MM-DD string
 */
const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * Initialize default data for a new user
 */
export const initializeUserData = (userId) => {
    const defaultData = {
        // User statistics - starts at 0 for new users
        stats: {
            skillsMastered: 0,
            learningHours: 0,
            coursesCompleted: 0,
            currentStreak: 0,
            lastActiveDate: null,
            totalSkills: 20 // Target skills for progress display
        },

        // Onboarding tasks
        onboarding: {
            'Day 1': [
                { id: 1, title: 'Welcome meeting with HR', completed: false, type: 'meeting' },
                { id: 2, title: 'Set up workstation and accounts', completed: false, type: 'setup' },
                { id: 3, title: 'Review company handbook', completed: false, type: 'document' },
                { id: 4, title: 'Meet your buddy', completed: false, type: 'meeting' }
            ],
            'Week 1': [
                { id: 5, title: 'Complete security training', completed: false, type: 'training' },
                { id: 6, title: 'Attend team standup', completed: false, type: 'meeting' },
                { id: 7, title: 'Review codebase documentation', completed: false, type: 'document' },
                { id: 8, title: 'Set up development environment', completed: false, type: 'setup' }
            ],
            'Month 1': [
                { id: 9, title: 'Complete first PR', completed: false, type: 'code' },
                { id: 10, title: 'Meet all team members', completed: false, type: 'meeting' },
                { id: 11, title: 'Complete role-specific training', completed: false, type: 'training' },
                { id: 12, title: 'Set career goals with manager', completed: false, type: 'meeting' }
            ]
        },

        // Learning courses - empty for new users
        courses: {
            enrolled: [],
            completed: [],
            inProgress: []
        },

        // Mentorship
        mentorship: {
            requests: [],
            activeMentors: [],
            pendingRequests: []
        },

        // Opportunities
        opportunities: {
            applied: [],
            bookmarked: [],
            interested: []
        },

        // Feedback
        feedback: {
            received: [],
            given: []
        },

        // Career path selections
        careerPath: {
            selectedPath: null,
            milestones: []
        }
    };

    // Store each data type separately
    Object.entries(defaultData).forEach(([key, value]) => {
        const existingData = localStorage.getItem(getKey(userId, key));
        if (!existingData) {
            localStorage.setItem(getKey(userId, key), JSON.stringify(value));
        }
    });

    return defaultData;
};

/**
 * Get user data for a specific type
 */
export const getUserData = (userId, dataType) => {
    const data = localStorage.getItem(getKey(userId, dataType));
    return data ? JSON.parse(data) : null;
};

/**
 * Set user data for a specific type
 */
export const setUserData = (userId, dataType, data) => {
    localStorage.setItem(getKey(userId, dataType), JSON.stringify(data));
};

/**
 * Update user data (merge with existing)
 */
export const updateUserData = (userId, dataType, updates) => {
    const existing = getUserData(userId, dataType) || {};
    const updated = { ...existing, ...updates };
    setUserData(userId, dataType, updated);
    return updated;
};

// ==========================================
// Onboarding Functions
// ==========================================

export const getOnboardingTasks = (userId) => {
    return getUserData(userId, 'onboarding') || initializeUserData(userId).onboarding;
};

export const toggleOnboardingTask = (userId, phase, taskId) => {
    const tasks = getOnboardingTasks(userId);
    tasks[phase] = tasks[phase].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setUserData(userId, 'onboarding', tasks);
    return tasks;
};

// ==========================================
// Learning/Courses Functions
// ==========================================

export const getUserCourses = (userId) => {
    return getUserData(userId, 'courses') || { enrolled: [], completed: [], inProgress: [] };
};

export const enrollInCourse = (userId, course) => {
    const courses = getUserCourses(userId);
    if (!courses.enrolled.find(c => c.id === course.id)) {
        // Initialize module progress - all modules start uncompleted
        const moduleProgress = {};
        if (course.modules) {
            course.modules.forEach(m => {
                moduleProgress[m.id] = false;
            });
        }

        const enrolledCourse = {
            ...course,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            moduleProgress,
            currentModuleIndex: 0
        };

        courses.enrolled.push(enrolledCourse);
        courses.inProgress.push({
            ...enrolledCourse,
            startedAt: new Date().toISOString()
        });
    }
    setUserData(userId, 'courses', courses);
    return courses;
};

// Update user skills when completing a course
const updateSkillsFromCourse = (userId, course) => {
    if (!course.skillsAddressed) return;

    const userData = JSON.parse(localStorage.getItem('ai_talent_user') || '{}');
    if (!userData.currentSkills) userData.currentSkills = {};

    course.skillsAddressed.forEach(({ skill, points }) => {
        const currentLevel = userData.currentSkills[skill] || 0;
        // Add points but cap at 100
        userData.currentSkills[skill] = Math.min(currentLevel + points, 100);
    });

    localStorage.setItem('ai_talent_user', JSON.stringify(userData));
    // Trigger storage event to update other components
    window.dispatchEvent(new Event('storage'));
};

export const updateModuleProgress = (userId, courseId, moduleId, completed) => {
    const courses = getUserCourses(userId);

    // Find course in inProgress
    const courseIndex = courses.inProgress.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return courses;

    const course = courses.inProgress[courseIndex];

    // Update module completion
    if (!course.moduleProgress) course.moduleProgress = {};
    course.moduleProgress[moduleId] = completed;

    // Calculate overall progress
    const modules = course.modules || [];
    const completedModules = modules.filter(m => course.moduleProgress[m.id]).length;
    const progress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;
    course.progress = progress;
    course.lastAccessedAt = new Date().toISOString();

    // Update current module index to next incomplete module
    const nextIncompleteIndex = modules.findIndex(m => !course.moduleProgress[m.id]);
    course.currentModuleIndex = nextIncompleteIndex >= 0 ? nextIncompleteIndex : modules.length - 1;

    // If course is 100% complete, move to completed
    if (progress >= 100) {
        course.completedAt = new Date().toISOString();
        courses.completed.push(course);
        courses.inProgress.splice(courseIndex, 1);

        // Update stats
        incrementCoursesCompleted(userId);
        addLearningTime(userId, course.durationHours || 0);

        // Update skills based on course
        updateSkillsFromCourse(userId, course);
    } else {
        courses.inProgress[courseIndex] = course;
    }

    // Also update in enrolled list
    const enrolledIndex = courses.enrolled.findIndex(c => c.id === courseId);
    if (enrolledIndex !== -1) {
        courses.enrolled[enrolledIndex] = { ...course };
    }

    setUserData(userId, 'courses', courses);
    return { courses, courseCompleted: progress >= 100 };
};

export const getCourseProgress = (userId, courseId) => {
    const courses = getUserCourses(userId);
    const course = courses.inProgress.find(c => c.id === courseId) ||
        courses.completed.find(c => c.id === courseId);

    if (!course) return null;

    return {
        progress: course.progress || 0,
        moduleProgress: course.moduleProgress || {},
        currentModuleIndex: course.currentModuleIndex || 0,
        isCompleted: (course.progress || 0) >= 100
    };
};

export const updateCourseProgress = (userId, courseId, progress) => {
    const courses = getUserCourses(userId);
    courses.inProgress = courses.inProgress.map(c =>
        c.id === courseId ? { ...c, progress, lastAccessedAt: new Date().toISOString() } : c
    );
    if (progress >= 100) {
        const course = courses.inProgress.find(c => c.id === courseId);
        if (course) {
            courses.completed.push({ ...course, completedAt: new Date().toISOString() });
            courses.inProgress = courses.inProgress.filter(c => c.id !== courseId);
        }
    }
    setUserData(userId, 'courses', courses);
    return courses;
};



// ==========================================
// Mentorship Functions
// ==========================================

export const getUserMentorship = (userId) => {
    return getUserData(userId, 'mentorship') || { requests: [], activeMentors: [], pendingRequests: [] };
};

export const requestMentorship = (userId, mentor) => {
    const mentorship = getUserMentorship(userId);
    if (!mentorship.pendingRequests.find(m => m.id === mentor.id)) {
        mentorship.pendingRequests.push({
            ...mentor,
            requestedAt: new Date().toISOString(),
            status: 'pending'
        });
        mentorship.requests.push({
            mentorId: mentor.id,
            mentorName: mentor.name,
            requestedAt: new Date().toISOString(),
            status: 'pending'
        });
    }
    setUserData(userId, 'mentorship', mentorship);
    return mentorship;
};

// ==========================================
// Opportunities Functions
// ==========================================

export const getUserOpportunities = (userId) => {
    return getUserData(userId, 'opportunities') || { applied: [], bookmarked: [], interested: [] };
};

export const applyToOpportunity = (userId, opportunity) => {
    const opportunities = getUserOpportunities(userId);
    if (!opportunities.applied.find(o => o.id === opportunity.id)) {
        opportunities.applied.push({
            ...opportunity,
            appliedAt: new Date().toISOString(),
            status: 'pending'
        });
    }
    setUserData(userId, 'opportunities', opportunities);
    return opportunities;
};

export const bookmarkOpportunity = (userId, opportunity) => {
    const opportunities = getUserOpportunities(userId);
    const existingIndex = opportunities.bookmarked.findIndex(o => o.id === opportunity.id);
    if (existingIndex >= 0) {
        opportunities.bookmarked.splice(existingIndex, 1);
    } else {
        opportunities.bookmarked.push({
            ...opportunity,
            bookmarkedAt: new Date().toISOString()
        });
    }
    setUserData(userId, 'opportunities', opportunities);
    return opportunities;
};

export const withdrawFromOpportunity = (userId, projectId) => {
    const opportunities = getUserOpportunities(userId);
    opportunities.applied = opportunities.applied.filter(op => op.id !== projectId);
    setUserData(userId, 'opportunities', opportunities);
    return opportunities;
};

// ==========================================
// Career Path Functions
// ==========================================

export const getUserCareerPath = (userId) => {
    return getUserData(userId, 'careerPath') || { selectedPath: null, milestones: [] };
};

export const selectCareerPath = (userId, path) => {
    const careerPath = getUserCareerPath(userId);
    careerPath.selectedPath = path;
    careerPath.milestones = path.milestones || [];
    setUserData(userId, 'careerPath', careerPath);
    return careerPath;
};

export const getRoadmapProgress = (userId) => {
    return getUserData(userId, 'roadmap') || { completedTasks: [] };
};

export const toggleRoadmapTask = (userId, taskId) => {
    const progress = getRoadmapProgress(userId);
    const completed = progress.completedTasks || [];

    if (completed.includes(taskId)) {
        progress.completedTasks = completed.filter(id => id !== taskId);
    } else {
        progress.completedTasks = [...completed, taskId];
    }

    setUserData(userId, 'roadmap', progress);
    return progress.completedTasks;
};

// ==========================================
// Stats Functions
// ==========================================

export const getUserStats = (userId) => {
    const defaultStats = {
        skillsMastered: 0,
        learningHours: 0,
        coursesCompleted: 0,
        currentStreak: 0,
        lastActiveDate: null,
        totalSkills: 20
    };
    return getUserData(userId, 'stats') || defaultStats;
};

export const updateStreak = (userId) => {
    const stats = getUserStats(userId);
    const today = getTodayString();
    const lastActive = stats.lastActiveDate;

    if (lastActive === today) {
        // Already active today, no change
        return stats;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayString) {
        // Continuing streak
        stats.currentStreak += 1;
    } else if (lastActive === null) {
        // First activity
        stats.currentStreak = 1;
    } else {
        // Streak broken, start new
        stats.currentStreak = 1;
    }

    stats.lastActiveDate = today;
    setUserData(userId, 'stats', stats);
    return stats;
};

export const addLearningTime = (userId, hours) => {
    const stats = getUserStats(userId);
    stats.learningHours = (stats.learningHours || 0) + hours;
    setUserData(userId, 'stats', stats);
    return stats;
};

export const incrementCoursesCompleted = (userId) => {
    const stats = getUserStats(userId);
    stats.coursesCompleted = (stats.coursesCompleted || 0) + 1;
    setUserData(userId, 'stats', stats);
    return stats;
};

export const incrementSkillsMastered = (userId) => {
    const stats = getUserStats(userId);
    stats.skillsMastered = (stats.skillsMastered || 0) + 1;
    setUserData(userId, 'stats', stats);
    return stats;
};

// ==========================================
// Feedback Functions
// ==========================================

export const getUserFeedback = (userId) => {
    return getUserData(userId, 'feedback') || { received: [], given: [] };
};

// ==========================================
// Check if user is new
// ==========================================

export const isNewUser = (userId) => {
    return !localStorage.getItem(getKey(userId, 'onboarding'));
};

// ==========================================
// Get incomplete onboarding tasks for dashboard
// ==========================================

export const getIncompleteTasks = (userId) => {
    const tasks = getOnboardingTasks(userId);
    const incompleteTasks = [];

    Object.entries(tasks).forEach(([phase, phaseTasks]) => {
        phaseTasks.forEach(task => {
            if (!task.completed) {
                incompleteTasks.push({ ...task, phase });
            }
        });
    });

    return incompleteTasks.slice(0, 5); // Return top 5 incomplete tasks
};

// ==========================================
// Clear all user data (for testing)
// ==========================================

export const clearUserData = (userId) => {
    const dataTypes = ['onboarding', 'courses', 'mentorship', 'opportunities', 'feedback', 'careerPath', 'stats'];
    dataTypes.forEach(type => {
        localStorage.removeItem(getKey(userId, type));
    });
};

export default {
    initializeUserData,
    getUserData,
    setUserData,
    updateUserData,
    getOnboardingTasks,
    toggleOnboardingTask,
    getUserCourses,
    enrollInCourse,
    updateCourseProgress,
    updateModuleProgress,
    getCourseProgress,
    getUserMentorship,
    requestMentorship,
    getUserOpportunities,
    applyToOpportunity,
    bookmarkOpportunity,
    getUserCareerPath,
    selectCareerPath,
    getUserStats,
    updateStreak,
    addLearningTime,
    incrementCoursesCompleted,
    incrementSkillsMastered,
    getUserFeedback,
    getIncompleteTasks,
    isNewUser,
    clearUserData
};

