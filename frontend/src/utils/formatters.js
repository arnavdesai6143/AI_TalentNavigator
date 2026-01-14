/**
 * Format job titles with proper capitalization and acronym handling
 * e.g., "senior ai engineer" -> "Senior AI Engineer"
 */
export const formatJobTitle = (title) => {
    if (!title) return '';

    // List of acronyms that should be fully capitalized
    const acronyms = ['AI', 'ML', 'QA', 'CEO', 'CTO', 'CFO', 'CIO', 'COO', 'VP', 'HR', 'IT', 'UI', 'UX', 'SRE', 'DevOps', 'LLM', 'RAG', 'API', 'AWS', 'GCP', 'PM'];

    // Words that should usually be lowercase unless they are the first word
    const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of'];

    return title.split(' ').map((word, index) => {
        // Remove extra spaces
        if (!word) return '';

        const upperWord = word.toUpperCase();

        // Check if it's a known acronym
        if (acronyms.includes(upperWord)) {
            return upperWord;
        }

        // Check for specific mixed-case terms
        if (upperWord === 'DEVOPS') return 'DevOps';

        // Handle minor words
        if (index > 0 && minorWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
        }

        // Default title case (capitalize first letter, rest lowercase)
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};
