/**
 * Enhanced emergency protocol system for handling crisis situations
 * Includes GPS location fetching with database fallback and 5-second timeout
 */

interface EmergencyProtocolParams {
    userId: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
    detectedKeywords: string[];
    onHelpButtonNeeded?: () => void;
}

interface LocationCoordinates {
    lat: number;
    lng: number;
}

/**
 * Fetches user's current GPS location with 5-second timeout
 * @returns Promise with coordinates or null if unavailable/timeout
 */
async function fetchUserLocation(): Promise<LocationCoordinates | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('[EMERGENCY PROTOCOL] Geolocation not supported');
            resolve(null);
            return;
        }

        // 5-second timeout safeguard
        const timeoutId = setTimeout(() => {
            console.warn('[EMERGENCY PROTOCOL] Location fetch timeout (5s)');
            resolve(null);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Save location to database for future fallback
                fetch('/api/user/save-location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(coords),
                }).catch((err) => console.warn('[EMERGENCY PROTOCOL] Failed to cache location:', err));

                resolve(coords);
            },
            (error) => {
                clearTimeout(timeoutId);
                console.warn('[EMERGENCY PROTOCOL] Location access denied:', error.message);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    });
}

/**
 * Fetches cached location from database as fallback
 * @param userId - User ID to fetch location for
 * @returns Promise with cached coordinates or null
 */
async function fetchCachedLocation(userId: string): Promise<LocationCoordinates | null> {
    try {
        const response = await fetch(`/api/user/get-location?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.lat && data.lng) {
            console.log('[EMERGENCY PROTOCOL] Using cached location from database');
            return { lat: data.lat, lng: data.lng };
        }
        return null;
    } catch (error) {
        console.error('[EMERGENCY PROTOCOL] Failed to fetch cached location:', error);
        return null;
    }
}

/**
 * Triggers emergency protocol when crisis is detected
 * Sends alert to guardians or helpline and logs incident
 * @param params - Emergency protocol parameters
 */
export async function triggerEmergencyProtocol(
    params: EmergencyProtocolParams
): Promise<void> {
    const { userId, message, severity, detectedKeywords, onHelpButtonNeeded } = params;

    try {
        // Log the crisis incident
        console.log('[CRISIS DETECTED]', {
            userId,
            severity,
            keywords: detectedKeywords,
            timestamp: new Date().toISOString(),
        });

        // Only trigger emergency alert for high severity
        if (severity === 'high') {
            // Try to fetch current location with 5-second timeout
            let location = await fetchUserLocation();

            // If current location fails, try cached location from database
            if (!location) {
                console.log('[EMERGENCY PROTOCOL] Current location unavailable, trying cached location...');
                location = await fetchCachedLocation(userId);
            }

            if (!location) {
                console.log('[EMERGENCY PROTOCOL] No location available (current or cached)');
            }

            // Call safety alert API in the background
            fetch('/api/safety-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    crisisSnippet: message,
                    userLocation: location || { lat: 0, lng: 0 },
                }),
            })
                .then(async (response) => {
                    const data = await response.json();

                    // If no guardian email, trigger help button
                    if (data.noGuardian && onHelpButtonNeeded) {
                        onHelpButtonNeeded();
                    }

                    console.log('[EMERGENCY PROTOCOL] Alert sent successfully');
                })
                .catch((error) => {
                    console.error('[EMERGENCY PROTOCOL] Failed to send alert:', error);
                });

            console.log('[EMERGENCY PROTOCOL] High-severity crisis - alert initiated');
        } else {
            console.log('[EMERGENCY PROTOCOL] Medium/Low severity - monitoring only');
        }
    } catch (error) {
        console.error('[EMERGENCY PROTOCOL] Error:', error);
    }
}
