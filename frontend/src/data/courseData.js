/**
 * Course Data - Role Requirements and Course Catalog
 * Central data source for skills, roles, and courses in the Learning Hub
 */

// All skills available in the system
export const ALL_SKILLS = [
    'JavaScript',
    'React',
    'Python',
    'System Design',
    'SQL',
    'Communication',
    'Leadership',
    'Architecture',
    'Node.js',
    'Docker',
    'CI/CD',
    'Linux',
    'Cloud',
    'Security',
    'Data Pipelines',
    'Spark',
    'DevOps',
    'TypeScript',
    'Testing',
    'Agile',
    'Machine Learning',
    'Deep Learning',
    'NLP',
    'TensorFlow',
    'PyTorch',
    'Computer Vision'
];

// Skill requirements for each target role
// Each skill has a required level (0-100)
export const ROLE_SKILL_REQUIREMENTS = {
    'Senior Software Engineer': {
        description: 'Lead technical projects and mentor junior developers',
        skills: {
            'JavaScript': 90,
            'React': 85,
            'Python': 80,
            'System Design': 75,
            'SQL': 70,
            'Communication': 85
        }
    },
    'Tech Lead': {
        description: 'Guide technical direction and lead engineering teams',
        skills: {
            'JavaScript': 85,
            'React': 80,
            'System Design': 90,
            'Leadership': 85,
            'Architecture': 90,
            'Communication': 90
        }
    },
    'Data Engineer': {
        description: 'Build and maintain data pipelines and infrastructure',
        skills: {
            'Python': 90,
            'SQL': 90,
            'Data Pipelines': 85,
            'Spark': 80,
            'Cloud': 75,
            'System Design': 70
        }
    },
    'DevOps Engineer': {
        description: 'Manage infrastructure, CI/CD, and deployment processes',
        skills: {
            'Cloud': 90,
            'Docker': 90,
            'CI/CD': 85,
            'Linux': 85,
            'Python': 75,
            'Security': 80
        }
    },
    'AI Engineer': {
        description: 'Design, build, and deploy AI models and intelligent systems',
        skills: {
            'Python': 95,
            'Machine Learning': 90,
            'Deep Learning': 85,
            'NLP': 80,
            'System Design': 75,
            'Cloud': 70
        }
    },
    'Full Stack Developer': {
        description: 'Build end-to-end web applications',
        skills: {
            'JavaScript': 85,
            'React': 85,
            'Node.js': 80,
            'SQL': 80,
            'DevOps': 70,
            'System Design': 75
        }
    }
};

// Course catalog with modules
export const COURSE_CATALOG = [
    {
        id: 1,
        title: 'Advanced System Design Patterns',
        description: 'Master distributed systems, microservices, and scalability patterns used at top tech companies.',
        duration: '6h 30m',
        durationHours: 6.5,
        level: 'Advanced',
        provider: 'Internal',
        rating: 4.8,
        enrolled: 234,
        category: 'Technical',
        skillsAddressed: [
            { skill: 'System Design', points: 25 },
            { skill: 'Architecture', points: 15 }
        ],
        modules: [
            { id: 'm1', title: 'Introduction to Distributed Systems', duration: '45m', type: 'video' },
            { id: 'm2', title: 'Load Balancing Strategies', duration: '50m', type: 'video' },
            { id: 'm3', title: 'Database Sharding & Partitioning', duration: '55m', type: 'video' },
            { id: 'm4', title: 'Caching Patterns', duration: '40m', type: 'video' },
            { id: 'm5', title: 'Message Queues & Event-Driven Architecture', duration: '60m', type: 'video' },
            { id: 'm6', title: 'Microservices Design', duration: '50m', type: 'video' },
            { id: 'm7', title: 'System Design Case Study: URL Shortener', duration: '45m', type: 'project' },
            { id: 'm8', title: 'System Design Case Study: Social Media Feed', duration: '45m', type: 'project' }
        ]
    },
    {
        id: 2,
        title: 'Python for Data Engineering',
        description: 'Build robust data pipelines using Python, Pandas, and modern ETL frameworks.',
        duration: '8h',
        durationHours: 8,
        level: 'Intermediate',
        provider: 'Coursera',
        rating: 4.7,
        enrolled: 1205,
        category: 'Data',
        skillsAddressed: [
            { skill: 'Python', points: 20 },
            { skill: 'Data Pipelines', points: 25 },
            { skill: 'SQL', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'Python for Data Processing', duration: '60m', type: 'video' },
            { id: 'm2', title: 'Pandas Deep Dive', duration: '75m', type: 'video' },
            { id: 'm3', title: 'Working with APIs', duration: '45m', type: 'video' },
            { id: 'm4', title: 'ETL Pipeline Fundamentals', duration: '60m', type: 'video' },
            { id: 'm5', title: 'Data Validation & Quality', duration: '50m', type: 'video' },
            { id: 'm6', title: 'Scheduling & Orchestration', duration: '55m', type: 'video' },
            { id: 'm7', title: 'Project: Build a Data Pipeline', duration: '90m', type: 'project' },
            { id: 'm8', title: 'Best Practices & Optimization', duration: '45m', type: 'video' }
        ]
    },
    {
        id: 3,
        title: 'React Performance Optimization',
        description: 'Learn advanced techniques to build blazing-fast React applications.',
        duration: '4h',
        durationHours: 4,
        level: 'Advanced',
        provider: 'Internal',
        rating: 4.9,
        enrolled: 156,
        category: 'Technical',
        skillsAddressed: [
            { skill: 'React', points: 25 },
            { skill: 'JavaScript', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'React Rendering Deep Dive', duration: '40m', type: 'video' },
            { id: 'm2', title: 'Memoization Strategies', duration: '35m', type: 'video' },
            { id: 'm3', title: 'Virtual DOM Optimization', duration: '30m', type: 'video' },
            { id: 'm4', title: 'Code Splitting & Lazy Loading', duration: '40m', type: 'video' },
            { id: 'm5', title: 'State Management Performance', duration: '35m', type: 'video' },
            { id: 'm6', title: 'Profiling & DevTools', duration: '30m', type: 'video' },
            { id: 'm7', title: 'Project: Optimize a Real App', duration: '50m', type: 'project' }
        ]
    },
    {
        id: 4,
        title: 'Technical Communication Mastery',
        description: 'Improve your documentation, presentations, and technical writing skills.',
        duration: '3h',
        durationHours: 3,
        level: 'Intermediate',
        provider: 'LinkedIn Learning',
        rating: 4.6,
        enrolled: 890,
        category: 'Communication',
        skillsAddressed: [
            { skill: 'Communication', points: 30 }
        ],
        modules: [
            { id: 'm1', title: 'Writing Clear Documentation', duration: '30m', type: 'video' },
            { id: 'm2', title: 'Technical Presentations', duration: '35m', type: 'video' },
            { id: 'm3', title: 'Code Review Communication', duration: '25m', type: 'video' },
            { id: 'm4', title: 'Stakeholder Communication', duration: '30m', type: 'video' },
            { id: 'm5', title: 'Remote Communication Best Practices', duration: '25m', type: 'video' },
            { id: 'm6', title: 'Project: Create Technical Documentation', duration: '35m', type: 'project' }
        ]
    },
    {
        id: 5,
        title: 'Docker & Containerization',
        description: 'Master Docker fundamentals and container orchestration for modern deployments.',
        duration: '5h',
        durationHours: 5,
        level: 'Intermediate',
        provider: 'Udemy',
        rating: 4.8,
        enrolled: 2340,
        category: 'DevOps',
        skillsAddressed: [
            { skill: 'Docker', points: 30 },
            { skill: 'DevOps', points: 15 },
            { skill: 'CI/CD', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'Container Fundamentals', duration: '40m', type: 'video' },
            { id: 'm2', title: 'Dockerfile Best Practices', duration: '45m', type: 'video' },
            { id: 'm3', title: 'Docker Compose', duration: '50m', type: 'video' },
            { id: 'm4', title: 'Networking & Volumes', duration: '40m', type: 'video' },
            { id: 'm5', title: 'Multi-Stage Builds', duration: '35m', type: 'video' },
            { id: 'm6', title: 'Security Best Practices', duration: '30m', type: 'video' },
            { id: 'm7', title: 'Project: Containerize a Full Stack App', duration: '60m', type: 'project' }
        ]
    },
    {
        id: 6,
        title: 'Leadership for Engineers',
        description: 'Develop leadership skills to guide teams and drive technical decisions.',
        duration: '4h 30m',
        durationHours: 4.5,
        level: 'Intermediate',
        provider: 'Internal',
        rating: 4.7,
        enrolled: 432,
        category: 'Leadership',
        skillsAddressed: [
            { skill: 'Leadership', points: 35 },
            { skill: 'Communication', points: 15 }
        ],
        modules: [
            { id: 'm1', title: 'Technical Leadership Mindset', duration: '35m', type: 'video' },
            { id: 'm2', title: 'Mentoring Junior Developers', duration: '40m', type: 'video' },
            { id: 'm3', title: 'Running Effective Meetings', duration: '30m', type: 'video' },
            { id: 'm4', title: 'Conflict Resolution', duration: '35m', type: 'video' },
            { id: 'm5', title: 'Giving Constructive Feedback', duration: '40m', type: 'video' },
            { id: 'm6', title: 'Building Team Culture', duration: '35m', type: 'video' },
            { id: 'm7', title: 'Project: Leadership Case Studies', duration: '55m', type: 'project' }
        ]
    },
    {
        id: 7,
        title: 'Cloud Architecture with AWS',
        description: 'Design and deploy scalable applications on Amazon Web Services.',
        duration: '7h',
        durationHours: 7,
        level: 'Advanced',
        provider: 'AWS Training',
        rating: 4.9,
        enrolled: 1876,
        category: 'DevOps',
        skillsAddressed: [
            { skill: 'Cloud', points: 30 },
            { skill: 'Architecture', points: 15 },
            { skill: 'Security', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'AWS Core Services Overview', duration: '50m', type: 'video' },
            { id: 'm2', title: 'EC2 & Auto Scaling', duration: '55m', type: 'video' },
            { id: 'm3', title: 'S3 & Storage Solutions', duration: '45m', type: 'video' },
            { id: 'm4', title: 'RDS & Database Services', duration: '50m', type: 'video' },
            { id: 'm5', title: 'Lambda & Serverless', duration: '55m', type: 'video' },
            { id: 'm6', title: 'VPC & Networking', duration: '50m', type: 'video' },
            { id: 'm7', title: 'IAM & Security', duration: '40m', type: 'video' },
            { id: 'm8', title: 'Project: Deploy a Scalable App', duration: '75m', type: 'project' }
        ]
    },
    {
        id: 8,
        title: 'JavaScript Deep Dive',
        description: 'Master advanced JavaScript concepts including closures, prototypes, and async patterns.',
        duration: '5h 30m',
        durationHours: 5.5,
        level: 'Intermediate',
        provider: 'Frontend Masters',
        rating: 4.8,
        enrolled: 3421,
        category: 'Technical',
        skillsAddressed: [
            { skill: 'JavaScript', points: 30 }
        ],
        modules: [
            { id: 'm1', title: 'Execution Context & Scope', duration: '45m', type: 'video' },
            { id: 'm2', title: 'Closures & Modules', duration: '50m', type: 'video' },
            { id: 'm3', title: 'Prototypes & Inheritance', duration: '45m', type: 'video' },
            { id: 'm4', title: 'Async & Event Loop', duration: '55m', type: 'video' },
            { id: 'm5', title: 'Promises & Async/Await', duration: '50m', type: 'video' },
            { id: 'm6', title: 'Error Handling Patterns', duration: '35m', type: 'video' },
            { id: 'm7', title: 'Project: Build a Module System', duration: '50m', type: 'project' }
        ]
    },
    {
        id: 9,
        title: 'SQL Mastery',
        description: 'Advanced SQL techniques for complex queries, optimization, and database design.',
        duration: '6h',
        durationHours: 6,
        level: 'Intermediate',
        provider: 'DataCamp',
        rating: 4.7,
        enrolled: 2156,
        category: 'Data',
        skillsAddressed: [
            { skill: 'SQL', points: 35 }
        ],
        modules: [
            { id: 'm1', title: 'Complex Joins & Subqueries', duration: '50m', type: 'video' },
            { id: 'm2', title: 'Window Functions', duration: '55m', type: 'video' },
            { id: 'm3', title: 'Query Optimization', duration: '50m', type: 'video' },
            { id: 'm4', title: 'Indexing Strategies', duration: '45m', type: 'video' },
            { id: 'm5', title: 'Database Design Patterns', duration: '50m', type: 'video' },
            { id: 'm6', title: 'Transactions & Locking', duration: '40m', type: 'video' },
            { id: 'm7', title: 'Project: Optimize a Slow Database', duration: '60m', type: 'project' }
        ]
    },
    {
        id: 10,
        title: 'Node.js Backend Development',
        description: 'Build robust backend services with Node.js, Express, and modern patterns.',
        duration: '6h 30m',
        durationHours: 6.5,
        level: 'Intermediate',
        provider: 'Pluralsight',
        rating: 4.6,
        enrolled: 1543,
        category: 'Technical',
        skillsAddressed: [
            { skill: 'Node.js', points: 30 },
            { skill: 'JavaScript', points: 10 },
            { skill: 'SQL', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'Node.js Core Concepts', duration: '45m', type: 'video' },
            { id: 'm2', title: 'Express.js Deep Dive', duration: '55m', type: 'video' },
            { id: 'm3', title: 'Middleware Patterns', duration: '40m', type: 'video' },
            { id: 'm4', title: 'Authentication & Authorization', duration: '55m', type: 'video' },
            { id: 'm5', title: 'Database Integration', duration: '50m', type: 'video' },
            { id: 'm6', title: 'Error Handling & Logging', duration: '35m', type: 'video' },
            { id: 'm7', title: 'Testing Node.js Apps', duration: '45m', type: 'video' },
            { id: 'm8', title: 'Project: Build a REST API', duration: '65m', type: 'project' }
        ]
    },
    {
        id: 11,
        title: 'Apache Spark Fundamentals',
        description: 'Process big data at scale with Apache Spark and PySpark.',
        duration: '7h 30m',
        durationHours: 7.5,
        level: 'Advanced',
        provider: 'Databricks',
        rating: 4.8,
        enrolled: 876,
        category: 'Data',
        skillsAddressed: [
            { skill: 'Spark', points: 35 },
            { skill: 'Python', points: 10 },
            { skill: 'Data Pipelines', points: 15 }
        ],
        modules: [
            { id: 'm1', title: 'Spark Architecture', duration: '50m', type: 'video' },
            { id: 'm2', title: 'RDDs & DataFrames', duration: '60m', type: 'video' },
            { id: 'm3', title: 'Transformations & Actions', duration: '55m', type: 'video' },
            { id: 'm4', title: 'Spark SQL', duration: '50m', type: 'video' },
            { id: 'm5', title: 'Performance Tuning', duration: '55m', type: 'video' },
            { id: 'm6', title: 'Spark Streaming', duration: '50m', type: 'video' },
            { id: 'm7', title: 'MLlib Basics', duration: '45m', type: 'video' },
            { id: 'm8', title: 'Project: Build a Batch Processing Pipeline', duration: '75m', type: 'project' }
        ]
    },
    {
        id: 12,
        title: 'CI/CD Pipeline Mastery',
        description: 'Design and implement production-ready continuous integration and deployment pipelines.',
        duration: '5h',
        durationHours: 5,
        level: 'Intermediate',
        provider: 'Internal',
        rating: 4.7,
        enrolled: 654,
        category: 'DevOps',
        skillsAddressed: [
            { skill: 'CI/CD', points: 35 },
            { skill: 'DevOps', points: 15 },
            { skill: 'Docker', points: 10 }
        ],
        modules: [
            { id: 'm1', title: 'CI/CD Fundamentals', duration: '40m', type: 'video' },
            { id: 'm2', title: 'GitHub Actions Deep Dive', duration: '50m', type: 'video' },
            { id: 'm3', title: 'Testing in Pipelines', duration: '45m', type: 'video' },
            { id: 'm4', title: 'Artifact Management', duration: '35m', type: 'video' },
            { id: 'm5', title: 'Deployment Strategies', duration: '50m', type: 'video' },
            { id: 'm6', title: 'Monitoring & Rollbacks', duration: '40m', type: 'video' },
            { id: 'm7', title: 'Project: Build a Full CI/CD Pipeline', duration: '60m', type: 'project' }
        ]
    }
];

/**
 * Calculate match score between a course and skill gaps
 * @param {Object} course - Course from COURSE_CATALOG
 * @param {Object} skillGaps - Object of { skillName: gapAmount }
 * @param {Object} roleRequirements - (Optional) Object of { skillName: requiredLevel }
 * @returns {number} Match percentage (0-100)
 */
export const calculateCourseMatch = (course, skillGaps, roleRequirements = null) => {
    if (!skillGaps || Object.keys(skillGaps).length === 0) return 0;

    let matchPoints = 0;
    let maxPossiblePoints = 0;

    course.skillsAddressed.forEach(({ skill, points }) => {
        let skillPoints = points;
        let gapSensitivity = 30; // Default: 30 point gap needed for full weight (100% gap score)

        // BOOST: If this is a CORE skill (required >= 85) for the target role
        if (roleRequirements && roleRequirements[skill] >= 85) {
            // Make it MORE sensitive. Even a small gap (10 pts) is critical.
            gapSensitivity = 10;
            // Boost points to prioritize core skills over multiple secondary skills
            skillPoints *= 1.2;
        }

        if (skillGaps[skill] && skillGaps[skill] > 0) {
            // The more the gap, the more valuable the course
            const gapWeight = Math.min(skillGaps[skill] / gapSensitivity, 1);
            matchPoints += skillPoints * gapWeight;
        }
        maxPossiblePoints += skillPoints;
    });

    // Boost score if course addresses multiple gaps
    const gapsAddressed = course.skillsAddressed.filter(
        ({ skill }) => skillGaps[skill] && skillGaps[skill] > 0
    ).length;
    const multiGapBonus = gapsAddressed > 1 ? 1.2 : 1;

    // Use safe division
    if (maxPossiblePoints === 0) return 0;

    const baseScore = (matchPoints / maxPossiblePoints) * 100 * multiGapBonus;
    return Math.min(Math.round(baseScore), 100);
};

/**
 * Get recommended courses based on skill gaps
 * @param {Object} skillGaps - Object of { skillName: gapAmount }
 * @param {Array} enrolledCourseIds - IDs of already enrolled courses
 * @param {Object} roleRequirements - (Optional) Object of { skillName: requiredLevel }
 * @returns {Array} Sorted array of courses with match scores
 */
export const getRecommendedCourses = (skillGaps, enrolledCourseIds = [], roleRequirements = null) => {
    return COURSE_CATALOG
        .filter(course => !enrolledCourseIds.includes(course.id))
        .map(course => ({
            ...course,
            match: calculateCourseMatch(course, skillGaps, roleRequirements),
            reason: generateRecommendationReason(course, skillGaps)
        }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 6); // Return top 6 recommendations
};

/**
 * Generate a human-readable reason for recommendation
 */
const generateRecommendationReason = (course, skillGaps) => {
    const addressedGaps = course.skillsAddressed
        .filter(({ skill }) => skillGaps[skill] && skillGaps[skill] > 0)
        .sort((a, b) => (skillGaps[b.skill] || 0) - (skillGaps[a.skill] || 0));

    if (addressedGaps.length === 0) {
        return 'Recommended for your career growth';
    }

    const topGap = addressedGaps[0].skill;
    const gapAmount = skillGaps[topGap];

    if (gapAmount >= 25) {
        return `Addresses your biggest skill gap: ${topGap}`;
    } else if (addressedGaps.length > 1) {
        return `Improves ${addressedGaps.map(g => g.skill).join(' & ')}`;
    } else {
        return `Strengthens your ${topGap} skills`;
    }
};

/**
 * Get a course by ID
 */
export const getCourseById = (courseId) => {
    return COURSE_CATALOG.find(c => c.id === courseId);
};

/**
 * Get all available target roles
 */
export const getTargetRoles = () => {
    return Object.entries(ROLE_SKILL_REQUIREMENTS).map(([name, data]) => ({
        name,
        description: data.description,
        requiredSkills: Object.keys(data.skills)
    }));
};

/**
 * Generate a dynamic roadmap based on target role and skill gaps
 */
export const getRoadmapTasks = (targetRole, currentSkills = {}, completedTaskIds = [], enrolledCourseIds = [], completedCourseIds = []) => {
    if (!targetRole || !ROLE_SKILL_REQUIREMENTS[targetRole]) return [];

    const requirements = ROLE_SKILL_REQUIREMENTS[targetRole].skills;
    const tasks = [];
    let taskIdCounter = 1;

    // 1. Identify Skill Gaps
    const gaps = [];
    Object.entries(requirements).forEach(([skill, required]) => {
        const current = currentSkills[skill] || 0;
        if (current < required) {
            gaps.push({ skill, gap: required - current });
        }
    });

    // Sort gaps by size
    gaps.sort((a, b) => b.gap - a.gap);

    // 2. Generate Course Tasks for major gaps (Top 3)
    // ONLY if the user is enrolled in the best matching course
    gaps.slice(0, 3).forEach(({ skill }) => {
        // Find best course for this skill
        const course = COURSE_CATALOG.find(c =>
            c.skillsAddressed.some(s => s.skill === skill)
        );

        // Only add if course exists AND user is enrolled
        if (course && enrolledCourseIds.includes(course.id)) {
            const taskId = `task_course_${course.id}`;
            // Check if course is completed
            const isCourseCompleted = completedCourseIds.includes(course.id);

            tasks.push({
                id: taskId,
                type: 'course',
                title: `Master ${skill}: ${course.title}`,
                status: (completedTaskIds.includes(taskId) || isCourseCompleted) ? 'completed' : 'in-progress',
                courseId: course.id,
                skill: skill
            });
        }
    });

    // 3. Add Role-Specific Activity Tasks
    const activityTasks = [
        {
            id: 'activity_mentor',
            title: 'Mentor a junior developer or student',
            type: 'activity',
            roleLevel: 'Senior'
        },
        {
            id: 'activity_review',
            title: 'Conduct 5 comprehensive code reviews',
            type: 'activity',
            roleLevel: 'Senior'
        },
        {
            id: 'activity_system_design',
            title: 'Lead a system design whiteboard session',
            type: 'activity',
            roleLevel: 'Lead'
        },
        {
            id: 'activity_blog',
            title: 'Write a technical blog post about your learning',
            type: 'activity',
            roleLevel: 'All'
        },
        {
            id: 'activity_project',
            title: 'Build a capstone project using new skills',
            type: 'activity',
            roleLevel: 'All'
        }
    ];

    // Filter activities based on role (simple heuristic)
    const isSeniorOrLead = targetRole.includes('Senior') || targetRole.includes('Lead') || targetRole.includes('Manager');

    activityTasks.forEach(activity => {
        if (activity.roleLevel === 'All' || (isSeniorOrLead && (activity.roleLevel === 'Senior' || activity.roleLevel === 'Lead'))) {
            // Don't add if we already have too many tasks
            if (tasks.length < 6) {
                const taskId = `${targetRole.replace(/\s+/g, '_')}_${activity.id}`;
                tasks.push({
                    id: taskId,
                    type: 'activity',
                    title: activity.title,
                    status: completedTaskIds.includes(taskId) ? 'completed' : 'upcoming'
                });
            }
        }
    });

    return tasks;
};

export default {
    ALL_SKILLS,
    ROLE_SKILL_REQUIREMENTS,
    COURSE_CATALOG,
    calculateCourseMatch,
    getRecommendedCourses,
    getCourseById,
    getTargetRoles,
    getRoadmapTasks
};
