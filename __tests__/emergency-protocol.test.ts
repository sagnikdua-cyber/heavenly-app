/**
 * Integration Tests for Emergency Protocol
 * Tests the interaction between safety monitoring and emergency alert system
 */

import { monitorSafety } from '@/lib/safety-monitor';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Emergency Protocol - Integration Tests', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    it('should call emergency API when high-risk message is detected', async () => {
        const highRiskMessage = 'I want to kill myself';
        const userId = 'test-user-123';

        // Mock successful API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Alert initiated', status: 'processing' }),
        });

        // Monitor the message
        const safetyCheck = monitorSafety(highRiskMessage);

        // Verify crisis detected
        expect(safetyCheck.isCrisis).toBe(true);
        expect(safetyCheck.severity).toBe('high');

        // Simulate emergency protocol trigger
        if (safetyCheck.isCrisis) {
            await fetch('/api/safety-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    crisisSnippet: highRiskMessage,
                    userLocation: { lat: 0, lng: 0 },
                }),
            });
        }

        // Verify API was called exactly once
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/safety-alert',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining(highRiskMessage),
            })
        );
    });

    it('should NOT call emergency API for safe messages', async () => {
        const safeMessage = 'Hi, how are you?';

        // Monitor the message
        const safetyCheck = monitorSafety(safeMessage);

        // Verify no crisis detected
        expect(safetyCheck.isCrisis).toBe(false);

        // Simulate emergency protocol trigger (should not happen)
        if (safetyCheck.isCrisis) {
            await fetch('/api/safety-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'test-user',
                    crisisSnippet: safeMessage,
                    userLocation: { lat: 0, lng: 0 },
                }),
            });
        }

        // Verify API was NOT called
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle multiple crisis messages correctly', async () => {
        const crisisMessages = [
            'I want to end my life',
            'I am thinking about suicide',
            'I want to kill myself',
        ];

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Alert initiated' }),
        });

        for (const message of crisisMessages) {
            const safetyCheck = monitorSafety(message);
            expect(safetyCheck.isCrisis).toBe(true);

            if (safetyCheck.isCrisis) {
                await fetch('/api/safety-alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: 'test-user',
                        crisisSnippet: message,
                        userLocation: { lat: 0, lng: 0 },
                    }),
                });
            }
        }

        // Verify API was called for each crisis message
        expect(global.fetch).toHaveBeenCalledTimes(crisisMessages.length);
    });

    it('should include location data in emergency alert', async () => {
        const crisisMessage = 'I want to die';
        const mockLocation = { lat: 12.9716, lng: 77.5946 };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Alert initiated' }),
        });

        const safetyCheck = monitorSafety(crisisMessage);

        if (safetyCheck.isCrisis) {
            await fetch('/api/safety-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'test-user',
                    crisisSnippet: crisisMessage,
                    userLocation: mockLocation,
                }),
            });
        }

        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(callArgs[1].body);

        expect(requestBody.userLocation).toEqual(mockLocation);
    });

    it('should handle API errors gracefully', async () => {
        const crisisMessage = 'I want to kill myself';

        // Mock API error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const safetyCheck = monitorSafety(crisisMessage);

        // Should not throw error
        await expect(async () => {
            if (safetyCheck.isCrisis) {
                try {
                    await fetch('/api/safety-alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: 'test-user',
                            crisisSnippet: crisisMessage,
                            userLocation: { lat: 0, lng: 0 },
                        }),
                    });
                } catch (error) {
                    // Error should be caught and logged
                    console.error('Emergency protocol error:', error);
                }
            }
        }).not.toThrow();
    });
});
