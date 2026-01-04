import { monitorSafety, getCrisisResponse } from '@/lib/safety-monitor';

describe('Safety Monitoring - Unit Tests', () => {
    describe('monitorSafety function', () => {
        it('should detect high-severity crisis keywords - "suicide"', () => {
            const result = monitorSafety('I am thinking about suicide');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.detectedKeywords).toContain('suicide');
        });

        it('should detect high-severity crisis keywords - "kill myself"', () => {
            const result = monitorSafety('I want to kill myself');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.detectedKeywords).toContain('kill myself');
        });

        it('should detect high-severity crisis keywords - "end my life"', () => {
            const result = monitorSafety('I want to end my life');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.detectedKeywords).toContain('end my life');
        });

        it('should detect high-severity crisis keywords - "want to die"', () => {
            const result = monitorSafety('I just want to die');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.detectedKeywords).toContain('want to die');
        });

        it('should detect medium-severity keywords - "hurt myself"', () => {
            const result = monitorSafety('I want to hurt myself');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('medium');
            expect(result.detectedKeywords).toContain('hurt myself');
        });

        it('should detect medium-severity keywords - "self harm"', () => {
            const result = monitorSafety('I am thinking about self harm');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('medium');
            expect(result.detectedKeywords).toContain('self harm');
        });

        it('should NOT detect crisis in normal conversation', () => {
            const result = monitorSafety('Hi, how are you today?');

            expect(result.isCrisis).toBe(false);
            expect(result.severity).toBe(null);
            expect(result.detectedKeywords).toHaveLength(0);
        });

        it('should NOT detect crisis in sad but safe messages', () => {
            const result = monitorSafety('I am feeling sad today');

            expect(result.isCrisis).toBe(false);
            expect(result.severity).toBe('low');
        });

        it('should be case-insensitive', () => {
            const result = monitorSafety('I AM THINKING ABOUT SUICIDE');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
        });

        it('should detect multiple keywords', () => {
            const result = monitorSafety('I want to kill myself, I feel worthless');

            expect(result.isCrisis).toBe(true);
            expect(result.severity).toBe('high');
            expect(result.detectedKeywords.length).toBeGreaterThan(0);
        });
    });

    describe('getCrisisResponse function', () => {
        it('should return appropriate response for high severity', () => {
            const response = getCrisisResponse('high');

            expect(response).toContain('pain');
            expect(response).toContain('not alone');
            expect(response).toContain('🫂');
        });

        it('should return appropriate response for medium severity', () => {
            const response = getCrisisResponse('medium');

            expect(response).toContain('tough');
            expect(response).toContain('🫂');
        });

        it('should return appropriate response for low severity', () => {
            const response = getCrisisResponse('low');

            expect(response).toContain('struggling');
            expect(response).toContain('💙');
        });
    });
});
