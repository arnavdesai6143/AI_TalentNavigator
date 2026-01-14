
// Simulate projectData.js logic
const INITIAL_PROJECTS = [
    {
        id: 1,
        title: 'With Base Score',
        skills: ['Python', 'Machine Learning'],
        baseScore: 70,
        domain: 'AI/ML'
    },
    {
        id: 2,
        title: 'Without Base Score',
        skills: ['Python', 'Machine Learning'],
        // baseScore missing
        domain: 'AI/ML'
    }
];

const getRecommendedProjects = (user, currentProjects) => {
    if (!user) return currentProjects;

    const targetRole = user.targetRole || 'Senior Software Engineer';
    const userSkills = user.currentSkills ? Object.keys(user.currentSkills) : [];

    return currentProjects.map(project => {
        // Look up canonical project data to ensure we have baseScore and correct metadata
        // This handles cases where localStorage might have stale/partial data
        const canonicalProject = INITIAL_PROJECTS.find(p => p.id === project.id) || project;

        // Use partial data from currentProjects (like spots) but static data from canonical (baseScore, domain)
        const projectData = {
            ...canonicalProject,
            ...project, // Keep dynamic state like spots
            baseScore: canonicalProject.baseScore || 50, // Default to 50 if still missing
            domain: canonicalProject.domain,
            skills: canonicalProject.skills
        };

        let score = projectData.baseScore;
        let matchReasons = [];

        // 1. Role Domain Matching
        const role = targetRole.toLowerCase();
        const domain = projectData.domain;

        if (role.includes('data') && domain === 'Data') {
            score += 25;
            console.log(`[${project.title}] Role Match (+25) - Data`);
        } else if ((role.includes('machine learning') || role.includes('ai engineer')) && domain === 'AI/ML') {
            score += 25;
            console.log(`[${project.title}] Role Match (+25) - AI/ML`);
        } else if (role.includes('mobile') && domain === 'Mobile') {
            score += 25;
        }

        // 2. Skill Matching
        const matchingSkills = projectData.skills.filter(skill =>
            userSkills.includes(skill) || targetRole.includes(skill)
        );

        if (matchingSkills.length > 0) {
            score += (matchingSkills.length * 5);
            console.log(`[${project.title}] Skill Match (+${matchingSkills.length * 5})`);
        }

        // 3. Normalize score (cap at 98, min 50)
        score = Math.min(98, Math.max(50, score));

        console.log(`[${project.title}] Final Score: ${score}`);
        return {
            ...project,
            matchScore: score,
        };
    });
};

// Simulation
const user = {
    targetRole: 'Machine Learning Engineer',
    currentSkills: { 'Python': 80, 'Machine Learning': 70 }
};

// Case 1: passing initialized projects (simulates fresh load)
console.log('--- Case 1: Fresh Load ---');
getRecommendedProjects(user, INITIAL_PROJECTS);

// Case 2: passing projects from local storage (simulates missing baseScore)
const storedProjects = INITIAL_PROJECTS.map(p => {
    const { baseScore, ...rest } = p;
    return rest;
});
console.log('\n--- Case 2: Stale Storage (Missing baseScore) ---');
getRecommendedProjects(user, storedProjects);
