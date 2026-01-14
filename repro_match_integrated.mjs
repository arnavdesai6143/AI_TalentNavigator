// Load dependencies
import { getRecommendedProjects, INITIAL_PROJECTS } from './frontend/src/data/projectData.js';

// Simulation Setup

// 1. Simulating a User with Stale LocalStorage Data
// In the bug scenario, localStorage has a project object that is "snapshot" from an older version
// or just corrupted, missing baseScore or having it wrong.
const staleLocalProject = {
    id: 1,
    title: 'AI-Powered Customer Support Platform', // Title matches
    team: 'Engineering',
    // BUG: baseScore is missing or wrong in storage
    baseScore: 10,
    domain: 'General', // Wrong domain in storage
    skills: [], // Wrong or missing skills in storage
    spots: 0, // Dynamic state: This SHOULD be preserved (e.g., spots changed)
    matchScore: 10 // Old stale match score
};

const userAI = {
    targetRole: 'AI Engineer', // Expect High Match for AI project
    currentSkills: {}
};

const userData = {
    targetRole: 'Data Engineer', // Expect High Match for Data project (id 3)
    currentSkills: {}
};

console.log('--- Verification Test: Stale Data Resilience ---');
console.log('Input Stale Project (ID 1): baseScore is 10 (Wrong), spots is 0 (Dynamic)');

// Test 1: AI Engineer Role
const resultsAI = getRecommendedProjects(userAI, [staleLocalProject]);
const resultAI_P1 = resultsAI.find(p => p.id === 1);

console.log('\n--- Test 1: Role = AI Engineer ---');
console.log(`Project ID 1 Match Score: ${resultAI_P1.matchScore}`);
console.log(`Project ID 1 Base Score (Internal): ${resultAI_P1.baseScore}`);
console.log(`Project ID 1 Spots (Should be 0 from stale): ${resultAI_P1.spots}`);
console.log(`Project ID 1 Domain (Should be AI/ML from canonical): ${resultAI_P1.domain}`);

if (resultAI_P1.matchScore > 80 && resultAI_P1.spots === 0 && resultAI_P1.domain === 'AI/ML') {
    console.log('✅ SUCCESS: Correctly restored canonical data while keeping dynamic spots.');
} else {
    console.log('❌ FAILURE: Logic did not restore canonical data or kept dynamic spots correctly.');
}

// Test 2: Data Engineer Role
// Should get high score for Data project (ID 3), even if not in "currentProjects" input list
// (Because the new logic iterates INITIAL_PROJECTS)
const resultsData = getRecommendedProjects(userData, []); // Empty input (simulation of first load or empty storage)
const resultData_P3 = resultsData.find(p => p.id === 3); // Data Pipeline Modernization

console.log('\n--- Test 2: Role = Data Engineer ---');
if (resultData_P3) {
    console.log(`Project ID 3 Match Score: ${resultData_P3.matchScore}`);
    if (resultData_P3.matchScore > 80) {
        console.log('✅ SUCCESS: Data project correctly matched for Data Engineer.');
    } else {
        console.log('❌ FAILURE: Data project score too low.');
    }
} else {
    console.log('❌ FAILURE: Project ID 3 not found in results.');
}
