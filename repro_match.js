const { getRecommendedProjects, INITIAL_PROJECTS } = require('./frontend/src/data/projectData');

// Mock User
const user = {
    targetRole: 'Data Engineer',
    currentSkills: { 'Python': 80, 'SQL': 70 }
};

// Mock LocalStorage Data (Simulating stale data with bad baseScore)
// Note: In the real app, this comes from localStorage.
// We simulate a project that exists in INITIAL_PROJECTS (id: 1) but has wrong data in storage.
const currentProjects = [
    {
        id: 1,
        title: 'Old Title',
        team: 'Engineering',
        baseScore: 50, // Stale/Wrong
        domain: 'WrongDomain',
        skills: [],
        spots: 2 // Dynamic state we want to keep
    }
];

console.log('--- Initial Projects ---');
console.log(JSON.stringify(INITIAL_PROJECTS, null, 2));

console.log('--- Current Projects (from storage) ---');
console.log(JSON.stringify(currentProjects, null, 2));

const recommendations = getRecommendedProjects(user, currentProjects);

console.log('--- Recommendations ---');
console.log(JSON.stringify(recommendations, null, 2));

// Check if baseScore is corrected
const p1 = recommendations.find(p => p.id === 1);
if (p1.baseScore === 70) {
    console.log('SUCCESS: baseScore restored from INITIAL_PROJECTS');
} else {
    console.log(`FAILURE: baseScore is ${p1.baseScore}, expected 70`);
}
