import { useState, useCallback } from 'react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import {
    initializeGoogleDriveAPI,
    signInToGoogleDrive,
    signOutFromGoogleDrive,
} from '../../lib/GoogleDriveApi';

export const GoogleDriveConfig = () => {
    const { isConnected, updateConfig, clearAuth } = useGoogleDrive();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Ensure GIS + gapi are loaded
            await initializeGoogleDriveAPI();

            // Sign in to Google
            const authResponse = await signInToGoogleDrive();

            // Update config with tokens only
            const newConfig = {
                enabled: true,
                accessToken: authResponse.accessToken,
                refreshToken: authResponse.refreshToken,
                tokenExpiry: authResponse.tokenExpiry,
            };

            updateConfig(newConfig);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Connection failed';
            setError(errorMessage);
            console.error('Google Drive connection error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [updateConfig]);

    const handleDisconnect = useCallback(async () => {
        try {
            await signOutFromGoogleDrive();
            clearAuth();
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Disconnection failed';
            setError(errorMessage);
            console.error('Google Drive disconnection error:', err);
        }
    }, [clearAuth]);

    return (
        <div className="GoogleDriveConfig" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
            <h3>Google Drive Sync</h3>
            {isConnected ? (
                <div style={{ padding: '1rem', backgroundColor: '#f0f8f0', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <strong>✓ Connected</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
                        Your drawings can be saved to and loaded from Google Drive.
                    </div>
                    <button
                        onClick={handleDisconnect}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Connect to Google Drive to sync your drawings across devices.
                    </p>

                    {error && (
                        <div
                            style={{
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                backgroundColor: '#ffe0e0',
                                color: '#d32f2f',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: isLoading ? '#ccc' : '#4a90e2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isLoading ? 'Connecting...' : 'Connect to Google Drive'}
                    </button>
                </div>
            )}
        </div>
    );
};
