
const { ROLE_SKILL_REQUIREMENTS, COURSE_CATALOG, calculateCourseMatch } = require('./frontend/src/data/courseData.js');

// Mock Data Engineer requirements
const role = 'Data Engineer';
const requirements = ROLE_SKILL_REQUIREMENTS[role].skills;
console.log(`Role: ${role}`, requirements);
// SQL: 90, Cloud: 75

// Simulated User Skills (reverse engineered from observations)
// User saw 50% match for SQL Mastery (35 pts). 
// Formula: (pts * gapWeight) / maxPts * 100 = 50
// (35 * gapWeight) / 35 = 0.5 => gapWeight = 0.5.
// gapWeight = gap / 30. so gap = 15.
// gap = required - current. 15 = 90 - current. current = 75.

// User saw 55% match for AWS (30 Cloud, 15 Arch, 10 Sec).
// Assuming Cloud gap is max (weight 1), and others are 0?
// If Cloud gap >= 30 (cap), then weight=1. 
// Cloud pts = 30 * 1 = 30.
// If Arch/Sec gaps are 0.
// Score = 30 / (30+15+10) = 30/55 = 54.5% -> 55%.
// So user has 0 Cloud skill (gap=75 >= 30).

const mockUserSkills = {
    'SQL': 75,
    'Cloud': 0,
    'Python': 50, // Arbitrary
    'Data Pipelines': 50, // Arbitrary
    'Spark': 50 // Arbitrary
};

console.log('User Skills:', mockUserSkills);

// Calculate Gaps
const skillGaps = {};
Object.entries(requirements).forEach(([skill, required]) => {
    const current = mockUserSkills[skill] || 0;
    if (current < required) {
        skillGaps[skill] = required - current;
    }
});

console.log('Skill Gaps:', skillGaps);

// Test Course 7 (AWS) and Course 9 (SQL)
const awsCourse = COURSE_CATALOG.find(c => c.id === 7);
const sqlCourse = COURSE_CATALOG.find(c => c.id === 9);

const awsScore = calculateCourseMatch(awsCourse, skillGaps);
const sqlScore = calculateCourseMatch(sqlCourse, skillGaps);

console.log(`AWS Course Match: ${awsScore}% (Expected ~55%)`);
console.log(`SQL Course Match: ${sqlScore}% (Expected ~50%)`);

// Proposed Logic Test V3 - Sensitivity Boost
function calculateCourseMatchV3(course, skillGaps, roleRequirements) {
    if (!skillGaps || Object.keys(skillGaps).length === 0) return 0;

    let matchPoints = 0;
    let maxPossiblePoints = 0;

    course.skillsAddressed.forEach(({ skill, points }) => {
        let skillPoints = points;
        let gapSensitivity = 30; // Default: 30 point gap needed for full weight

        // BOOST: If this is a CORE skill (required >= 85)
        if (roleRequirements && roleRequirements[skill] >= 85) {
            // Make it MORE sensitive. Even a small gap (10 pts) is critical.
            gapSensitivity = 10;
            // Also optionally boost points to outweigh non-core multi-skill courses
            skillPoints *= 1.2;
        }

        if (skillGaps[skill] && skillGaps[skill] > 0) {
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

    const baseScore = (matchPoints / maxPossiblePoints) * 100 * multiGapBonus;
    return Math.min(Math.round(baseScore), 100);
}

const awsScoreV3 = calculateCourseMatchV3(awsCourse, skillGaps, requirements);
const sqlScoreV3 = calculateCourseMatchV3(sqlCourse, skillGaps, requirements);

console.log(`\nAWS Course Match V3: ${awsScoreV3}%`);
console.log(`SQL Course Match V3: ${sqlScoreV3}%`);
