import { ReactNode, createContext } from 'react';
import { GoogleDriveConfig } from '../hooks/useConfig';

export type GoogleDriveContextType = {
    config: GoogleDriveConfig | undefined;
    isConnected: boolean;
    updateConfig: (config: GoogleDriveConfig) => void;
    clearAuth: () => void;
};

export const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveContextProvider = ({
    children,
    config,
    onConfigUpdate,
}: {
    children: ReactNode;
    config: GoogleDriveConfig | undefined;
    onConfigUpdate: (config: GoogleDriveConfig) => void;
}) => {
    const isConnected = Boolean(
        config?.enabled && config?.accessToken && !isTokenExpired(config)
    );

    const updateConfig = (newConfig: GoogleDriveConfig) => {
        onConfigUpdate(newConfig);
    };

    const clearAuth = () => {
        if (config) {
            onConfigUpdate({
                ...config,
                enabled: false,
                accessToken: undefined,
                refreshToken: undefined,
                tokenExpiry: undefined,
            });
        }
    };

    const value: GoogleDriveContextType = {
        config,
        isConnected,
        updateConfig,
        clearAuth,
    };

    return (
        <GoogleDriveContext.Provider value={value}>
            {children}
        </GoogleDriveContext.Provider>
    );
};

/**
 * Check if the stored Google Drive token has expired
 */
function isTokenExpired(config: GoogleDriveConfig): boolean {
    if (!config.tokenExpiry) return true;
    return Date.now() > config.tokenExpiry;
}
