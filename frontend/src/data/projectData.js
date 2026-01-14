export const INITIAL_PROJECTS = [
    {
        id: 1,
        title: 'AI-Powered Customer Support Platform',
        team: 'Engineering',
        description: 'Build an intelligent customer support system using NLP and machine learning.',
        skills: ['Python', 'Machine Learning', 'NLP', 'React'],
        baseScore: 70, // Base score before personalization
        commitment: '20 hrs/week',
        duration: '3 months',
        spots: 2,
        domain: 'AI/ML'
    },
    {
        id: 2,
        title: 'Mobile App Performance Optimization',
        team: 'Mobile',
        description: 'Improve app load times and reduce memory usage across platforms.',
        skills: ['React Native', 'Performance', 'JavaScript'],
        baseScore: 65,
        commitment: '15 hrs/week',
        duration: '2 months',
        spots: 1,
        domain: 'Mobile'
    },
    {
        id: 3,
        title: 'Data Pipeline Modernization',
        team: 'Data Engineering',
        description: 'Migrate legacy ETL processes to modern streaming architecture.',
        skills: ['Python', 'SQL', 'Kafka', 'Spark'],
        baseScore: 70,
        commitment: '25 hrs/week',
        duration: '4 months',
        spots: 3,
        domain: 'Data'
    },
    {
        id: 4,
        title: 'Internal Hackathon - Innovation Week',
        team: 'Company-wide',
        description: 'Annual hackathon to prototype new product ideas and innovations.',
        skills: ['Any', 'Creativity', 'Teamwork'],
        baseScore: 85, // Hackathons generally high match for everyone
        commitment: 'Full week',
        duration: '1 week',
        spots: 'Unlimited',
        domain: 'General'
    }
];

export const getRecommendedProjects = (user, currentProjects = INITIAL_PROJECTS) => {
    if (!user) return currentProjects;

    const targetRole = (user.targetRole || 'Senior Software Engineer').toLowerCase();
    const userSkills = user.currentSkills ? Object.keys(user.currentSkills) : [];

    // Map over INITIAL_PROJECTS as the source of truth for static data (skills, domain, baseScore)
    // Merge with currentProjects to preserve dynamic state (spots, etc.)
    return INITIAL_PROJECTS.map(canonicalProject => {
        // Find the dynamic state for this project (if any)
        // We look for ID match.
        const dynamicProjectState = currentProjects.find(p => p.id === canonicalProject.id) || {};

        // Merge: Canonical takes precedence for static data, dynamic for volatile
        const project = {
            ...canonicalProject,
            ...dynamicProjectState,
            // Explicitly enforce static fields that might be corrupted in localStorage
            title: canonicalProject.title,
            description: canonicalProject.description,
            skills: canonicalProject.skills,
            baseScore: canonicalProject.baseScore,
            domain: canonicalProject.domain,
            // Keep spots from dynamic state if it exists, otherwise canonical
            spots: dynamicProjectState.spots !== undefined ? dynamicProjectState.spots : canonicalProject.spots
        };

        let score = project.baseScore || 50;
        let matchReasons = [];

        // 1. Role Domain Matching
        const domain = project.domain;

        if (targetRole.includes('data') && domain === 'Data') {
            score += 25;
            matchReasons.push('Aligns with your Data Engineering career path');
        } else if ((targetRole.includes('machine learning') || targetRole.includes('ai engineer')) && domain === 'AI/ML') {
            score += 25;
            matchReasons.push('Perfect for your AI/ML goals');
        } else if (targetRole.includes('mobile') && domain === 'Mobile') {
            score += 25;
            matchReasons.push('Relevant to your Mobile specialization');
        } else if ((targetRole.includes('product') || targetRole.includes('manager')) && domain === 'General') {
            score += 15;
            matchReasons.push('Good for leadership exposure');
        } else if (domain === 'General') {
            score += 10;
            matchReasons.push('Great visibility opportunity');
        }

        // 2. Skill Matching
        const matchingSkills = project.skills.filter(skill =>
            userSkills.includes(skill) || targetRole.includes(skill.toLowerCase())
        );

        if (matchingSkills.length > 0) {
            score += (matchingSkills.length * 5);
            matchReasons.push(`You have relevant skills: ${matchingSkills.slice(0, 2).join(', ')}`);
        }

        // 3. Normalize score (cap at 98, min 50)
        score = Math.min(98, Math.max(50, score));

        // Default reason if none found
        if (matchReasons.length === 0) {
            matchReasons.push('Expands your technical breadth');
        }

        return {
            ...project,
            matchScore: score,
            matchReason: matchReasons[0] // Display top reason
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
};
