// Mock Initial Data
const INITIAL_PROJECTS = [
    {
        id: 1,
        title: 'AI-Powered Customer Support Platform',
        team: 'Engineering',
        description: 'Build an intelligent customer support system using NLP and machine learning.',
        skills: ['Python', 'Machine Learning', 'NLP', 'React'],
        baseScore: 70, // Base score
        commitment: '20 hrs/week',
        duration: '3 months',
        spots: 2,
        domain: 'AI/ML'
    }
];

// Logic under test
const getRecommendedProjects = (user, currentProjects = INITIAL_PROJECTS) => {
    if (!user) return currentProjects;

    const targetRole = user.targetRole || 'Senior Software Engineer';
    const userSkills = user.currentSkills ? Object.keys(user.currentSkills) : [];

    return currentProjects.map(project => {
        // Look up canonical project data
        const canonicalProject = INITIAL_PROJECTS.find(p => p.id == project.id) || project;

        console.log(`Analyzing Project ID ${project.id}`);
        console.log(`Found Canonical: ${canonicalProject !== project}`);
        console.log(`Canonical BaseScore: ${canonicalProject.baseScore}`);

        const projectData = {
            ...canonicalProject,
            ...project, // Keep dynamic state like spots
            baseScore: canonicalProject.baseScore || 50,
            domain: canonicalProject.domain,
            skills: canonicalProject.skills
        };

        console.log(`Resulting BaseScore: ${projectData.baseScore}`);

        let score = projectData.baseScore;
        // ... (rest of matching logic mocked slightly or omitted if irrelevant to baseScore issue)

        // Mock simple matching logic to see if it adds up
        const role = targetRole.toLowerCase();
        const domain = projectData.domain;
        if ((role.includes('machine learning') || role.includes('ai engineer')) && domain === 'AI/ML') {
            score += 25;
            console.log("Added 25 for AI/ML match");
        }

        score = Math.min(98, Math.max(50, score));
        console.log(`Final Score: ${score}`);

        return {
            ...project,
            matchScore: score,
        };
    });
};

// Simulation

// 1. User has stale data in localStorage (project with baseScore 50 and NO domain/skills potentially?)
// Actually, if localStorage has the full object from a previous save, it has everything.
const staleLocalProject = {
    id: 1,
    title: 'AI-Powered Customer Support Platform',
    team: 'Engineering',
    // Stale or Wrong Data from hypothetical previous bug
    baseScore: 50,
    domain: 'General', // Wrong domain
    skills: [], // Wrong skills
    spots: 1, // Dynamic state changed
    matchScore: 50 // Old match score
};

const user = {
    targetRole: 'AI Engineer', // Should trigger AI/ML match
    currentSkills: {}
};

console.log('--- Running Test ---');
const results = getRecommendedProjects(user, [staleLocalProject]);
const result = results[0];

if (result.matchScore > 50) {
    console.log('SUCCESS: Score updated correctly based on Canonical Data');
} else {
    console.log('FAILURE: Score stuck at 50');
}
