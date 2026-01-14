export const MENTORS = [
    // Engineering - Leadership
    {
        id: 1,
        name: 'Sarah Chen',
        title: 'Principal Engineer',
        department: 'Platform Engineering',
        skills: ['System Design', 'Distributed Systems', 'Technical Leadership', 'Go'],
        experience: '15 years',
        mentees: 3,
        available: true,
        matchScore: 95, // Dynamic base
        category: 'Engineering'
    },
    {
        id: 2,
        name: 'Michael Torres',
        title: 'Senior Engineering Manager',
        department: 'Product Engineering',
        skills: ['People Management', 'Career Strategy', 'React', 'Node.js'],
        experience: '12 years',
        mentees: 2,
        available: true,
        matchScore: 88,
        category: 'Engineering'
    },
    // Engineering - IC
    {
        id: 3,
        name: 'David Kim',
        title: 'Senior Software Engineer',
        department: 'AI/ML Team',
        skills: ['Python', 'Machine Learning', 'PyTorch', 'Data Structures'],
        experience: '6 years',
        mentees: 1,
        available: false,
        matchScore: 90,
        category: 'Engineering'
    },
    {
        id: 4,
        name: 'Elena Rodriguez',
        title: 'Staff Frontend Engineer',
        department: 'Design Systems',
        skills: ['React', 'CSS Architecture', 'Accessibility', 'TypeScript'],
        experience: '9 years',
        mentees: 2,
        available: true,
        matchScore: 85,
        category: 'Engineering'
    },
    // Product Management
    {
        id: 5,
        name: 'Jessica Wu',
        title: 'Group Product Manager',
        department: 'Core Product',
        skills: ['Product Strategy', 'User Research', 'Roadmapping', 'Agile'],
        experience: '10 years',
        mentees: 3,
        available: true,
        matchScore: 70,
        category: 'Product'
    },
    {
        id: 6,
        name: 'James Wilson',
        title: 'Senior Product Manager',
        department: 'Growth',
        skills: ['A/B Testing', 'Data Analysis', 'User Psychology', 'SQL'],
        experience: '7 years',
        mentees: 2,
        available: true,
        matchScore: 75,
        category: 'Product'
    },
    // Design
    {
        id: 7,
        name: 'Olivia Martinez',
        title: 'Lead Product Designer',
        department: 'UX Research',
        skills: ['Design Systems', 'Figma', 'User Research', 'Prototyping'],
        experience: '8 years',
        mentees: 2,
        available: true,
        matchScore: 65,
        category: 'Design'
    },
    {
        id: 8,
        name: 'Marcus Johnson',
        title: 'Senior UI/UX Designer',
        department: 'Mobile Experience',
        skills: ['Mobile Design', 'Interaction Design', 'Adobe XD', 'Sketch'],
        experience: '6 years',
        mentees: 1,
        available: true,
        matchScore: 60,
        category: 'Design'
    },
    // Data Science
    {
        id: 9,
        name: 'Dr. Priya Patel',
        title: 'Staff Data Scientist',
        department: 'Analytics',
        skills: ['Statistics', 'Python', 'Machine Learning', 'Visualization'],
        experience: '10 years',
        mentees: 4,
        available: false,
        matchScore: 80,
        category: 'Data'
    },
    {
        id: 10,
        name: 'Robert Chang',
        title: 'Senior Data Engineer',
        department: 'Data Platform',
        skills: ['Spark', 'Scala', 'ETL Pipelines', 'AWS'],
        experience: '7 years',
        mentees: 2,
        available: true,
        matchScore: 82,
        category: 'Data'
    }
];

export const getRecommendedMentors = (user) => {
    if (!user) return MENTORS;

    const targetRole = user.targetRole || 'Senior Software Engineer';
    const userSkills = Object.keys(user.currentSkills || {});

    // Heuristic matching logic
    return MENTORS.map(mentor => {
        let score = 50; // Base score
        let matchReasons = [];

        // Role/Department Match
        if (targetRole.includes('Manager') && mentor.title.includes('Manager')) {
            score += 20;
            matchReasons.push('Aligns with your management career path');
        } else if (targetRole.includes('Engineer') && mentor.category === 'Engineering') {
            score += 15;
            matchReasons.push('Strong engineering background');
        } else if (targetRole.includes('Product') && mentor.category === 'Product') {
            score += 20;
            matchReasons.push('Expert in your target field (Product)');
        } else if (targetRole.includes('Design') && mentor.category === 'Design') {
            score += 20;
            matchReasons.push('Design leadership experience');
        } else if (targetRole.includes('Data') && mentor.category === 'Data') {
            score += 20;
            matchReasons.push('Deep Data Science expertise');
        }

        // Skill Match (Mentor has skills user wants/might need)
        // For simplicity, we check if mentor has skills relevant to the user's gaps or target
        // Here we just check generic intersection or key role skills
        const relevantSkills = mentor.skills.filter(s =>
            targetRole.includes(s) || // e.g. "Machine Learning" in role
            !userSkills.includes(s) // Mentor has something user might not
        );

        if (relevantSkills.length > 0) {
            score += 10 + (relevantSkills.length * 2);
            if (relevantSkills.length > 2) matchReasons.push(`Can help you develop ${relevantSkills[0]} and ${relevantSkills[1]}`);
        }

        // Random jitter for variety in demo if scores are tied
        score += Math.floor(Math.random() * 5);

        // Cap at 98
        score = Math.min(score, 98);

        return {
            ...mentor,
            matchScore: score,
            matchReasons: matchReasons.length > 0 ? matchReasons : ['Industry veteran with relevant experience']
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
};
