/**
 * Safety monitoring system for detecting crisis situations in user messages
 */

export interface SafetyCheckResult {
    isCrisis: boolean;
    severity: 'high' | 'medium' | 'low' | null;
    detectedKeywords: string[];
}

const CRISIS_KEYWORDS = {
    high: [
        'suicide',
        'kill myself',
        'end my life',
        'want to die',
        'better off dead',
        'no reason to live',
        'ending it all',
        'take my life',
    ],
    medium: [
        'hurt myself',
        'self harm',
        'cut myself',
        'worthless',
        'give up',
        'can\'t go on',
        'no point',
    ],
    low: [
        'hopeless',
        'alone',
        'nobody cares',
        'hate myself',
    ],
};

/**
 * Monitors user input for crisis-related keywords
 * @param userInput - The message from the user
 * @returns Safety check result with crisis detection info
 */
export function monitorSafety(userInput: string): SafetyCheckResult {
    const lowerInput = userInput.toLowerCase();
    const detectedKeywords: string[] = [];
    let severity: 'high' | 'medium' | 'low' | null = null;

    // Check high severity keywords
    for (const keyword of CRISIS_KEYWORDS.high) {
        if (lowerInput.includes(keyword)) {
            detectedKeywords.push(keyword);
            severity = 'high';
        }
    }

    // Check medium severity if no high severity found
    if (!severity) {
        for (const keyword of CRISIS_KEYWORDS.medium) {
            if (lowerInput.includes(keyword)) {
                detectedKeywords.push(keyword);
                severity = 'medium';
            }
        }
    }

    // Check low severity if no higher severity found
    if (!severity) {
        for (const keyword of CRISIS_KEYWORDS.low) {
            if (lowerInput.includes(keyword)) {
                detectedKeywords.push(keyword);
                severity = 'low';
            }
        }
    }

    return {
        isCrisis: severity === 'high' || severity === 'medium',
        severity,
        detectedKeywords,
    };
}

/**
 * Gets an empathetic crisis response based on severity
 */
export function getCrisisResponse(severity: 'high' | 'medium' | 'low'): string {
    if (severity === 'high') {
        return "I'm hearing a lot of pain in your words, and I want you to know I'm right here with you. You're not alone, buddy. Let's breathe together for a second. 🫂 Your life has value, and I'm here to support you through this. Would you like to talk about what you're feeling?";
    }

    if (severity === 'medium') {
        return "Hey, I'm noticing you're going through something really tough right now 🫂 I'm here for you, and I want you to know that these feelings won't last forever. You're stronger than you think. Can you tell me more about what's happening? 💙";
    }

    return "I can hear that you're struggling, friend 💙 It takes courage to share these feelings. I'm here to listen without judgment. What's weighing on your heart? ✨";
}
