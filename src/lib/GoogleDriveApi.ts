import { GoogleDriveConfig } from '../hooks/useConfig';

interface GapiWindow {
    gapi?: {
        load: (name: string, callback: () => void) => void;
        client?: {
            init: (config: Record<string, unknown>) => Promise<void>;
        };
        auth2?: {
            getAuthInstance: () => GapiAuthInstance | undefined;
        };
    };
}

interface GapiAuthInstance {
    isSignedIn: { get: () => boolean };
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    currentUser: { get: () => GapiUser };
}

interface GapiUser {
    getAuthResponse: (includeAuthorizationData: boolean) => {
        access_token: string;
        id_token: string;
        expires_at: number;
    };
}

/**
 * Google Drive API configuration
 */
export const GOOGLE_DRIVE_API_CONFIG = {
    discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    ],
    scopes: [
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file',
    ],
} as const;

/**
 * Initialize Google Drive API
 */
export async function initializeGoogleDriveAPI(clientId: string, apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if gapi is already loaded
        const gapi = (window as unknown as GapiWindow).gapi;
        if (gapi?.load) {
            loadGapiClient(clientId, apiKey, resolve, reject);
        } else {
            // Load the gapi script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => loadGapiClient(clientId, apiKey, resolve, reject);
            script.onerror = reject;
            document.head.appendChild(script);
        }
    });
}

function loadGapiClient(
    clientId: string,
    apiKey: string,
    resolve: () => void,
    reject: (error: Error) => void
) {
    const gapi = (window as unknown as GapiWindow).gapi;
    if (!gapi) {
        reject(new Error('Google API failed to load'));
        return;
    }

    gapi.load('client:auth2', () => {
        gapi.client
            ?.init({
                apiKey,
                clientId,
                discoveryDocs: GOOGLE_DRIVE_API_CONFIG.discoveryDocs,
                scope: GOOGLE_DRIVE_API_CONFIG.scopes.join(' '),
            })
            .then(resolve)
            .catch(reject);
    });
}

/**
 * Sign in to Google Drive
 */
export async function signInToGoogleDrive(): Promise<{
    accessToken: string;
    refreshToken?: string;
    tokenExpiry: number;
}> {
    const gapi = (window as unknown as GapiWindow).gapi;
    const auth = gapi?.auth2?.getAuthInstance();

    if (!auth) {
        throw new Error('Google auth not initialized');
    }

    const isSignedIn = auth.isSignedIn.get();
    if (!isSignedIn) {
        await auth.signIn();
    }

    const user = auth.currentUser.get();
    const authResponse = user.getAuthResponse(true);

    return {
        accessToken: authResponse.access_token,
        refreshToken: authResponse.id_token,
        tokenExpiry: authResponse.expires_at,
    };
}

/**
 * Sign out from Google Drive
 */
export async function signOutFromGoogleDrive(): Promise<void> {
    const gapi = (window as unknown as GapiWindow).gapi;
    const auth = gapi?.auth2?.getAuthInstance();

    if (auth) {
        await auth.signOut();
    }
}

/**
 * Check if user is currently signed in
 */
export function isSignedInToGoogleDrive(): boolean {
    const gapi = (window as unknown as GapiWindow).gapi;
    const auth = gapi?.auth2?.getAuthInstance();
    return auth?.isSignedIn?.get() ?? false;
}

/**
 * Create or update a file in Google Drive
 */
export async function uploadFileToDrive(
    fileName: string,
    fileContent: Blob,
    accessToken: string,
    folderId?: string
): Promise<string> {
    const metadata = {
        name: fileName,
        parents: folderId ? [folderId] : ['appDataFolder'],
        mimeType: 'application/octet-stream',
    };

    const form = new FormData();
    form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', fileContent);

    const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: form,
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
}

/**
 * Download a file from Google Drive
 */
export async function downloadFileFromDrive(
    fileId: string,
    accessToken: string
): Promise<Blob> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
}

/**
 * List files in Google Drive app data folder
 */
export async function listFilesFromDrive(
    accessToken: string,
    query?: string
): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    const defaultQuery = 'trashed=false and \'appDataFolder\' in parents';
    const finalQuery = query ? `${defaultQuery} and ${query}` : defaultQuery;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(finalQuery)}&spaces=appDataFolder&fields=files(id,name,modifiedTime)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const result = await response.json() as { files?: Array<{ id: string; name: string; modifiedTime: string }> };
    return result.files || [];
}

/**
 * Delete a file from Google Drive
 */
export async function deleteFileFromDrive(
    fileId: string,
    accessToken: string
): Promise<void> {
    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
    }
}

/**
 * Validate Google Drive configuration
 */
export function validateGoogleDriveConfig(config: GoogleDriveConfig): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!config.clientId?.trim()) {
        errors.push('Client ID is required');
    }

    if (!config.apiKey?.trim()) {
        errors.push('API Key is required');
    }

    if (config.enabled && !config.accessToken) {
        errors.push('Access token is missing');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
