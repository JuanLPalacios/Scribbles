import { GoogleDriveConfig } from '../hooks/useConfig';

// OAuth 2.0 Client Configuration (compiled into the application)
const GOOGLE_CLIENT_SECRET: string | undefined =
    (import.meta as { env?: { VITE_GOOGLE_DRIVE_CLIENT_SECRET?: string } }).env
        ?.VITE_GOOGLE_DRIVE_CLIENT_SECRET;

export const GOOGLE_OAUTH_CONFIG = {
    clientId: '222305151602-t8glv21h50fjm5coti9l574i9cpd3i1v.apps.googleusercontent.com',
    clientSecret: GOOGLE_CLIENT_SECRET,
    projectId: 'scribbles-482520',
} as const;

// API key is required for discovery before an OAuth token exists. Provide via Vite env.
const GOOGLE_API_KEY: string | undefined =
    (import.meta as { env?: { VITE_GOOGLE_DRIVE_API_KEY?: string } }).env
        ?.VITE_GOOGLE_DRIVE_API_KEY;

// Supported file types for Scribbles
export const SUPPORTED_FILE_EXTENSIONS = ['.scribble', '.png', '.jpg', '.jpeg'] as const;
export const SUPPORTED_MIME_TYPES = [
    'application/octet-stream', // .scribble files
    'image/png',
    'image/jpeg',
] as const;

export type SupportedFileType = typeof SUPPORTED_FILE_EXTENSIONS[number];

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size?: string;
}

interface GisWindow {
    google?: {
        accounts?: {
            oauth2?: {
                initTokenClient: (config: {
                    client_id: string;
                    scope: string;
                    prompt?: 'consent' | 'none';
                    callback: (response: {
                        access_token?: string;
                        expires_in?: number;
                        error?: string;
                    }) => void;
                }) => TokenClient;
                revoke: (token: string, done?: () => void) => void;
            };
        };
    };
}

interface TokenClient {
    requestAccessToken: (options?: { prompt?: 'consent' | 'none' }) => void;
    callback: (response: {
        access_token?: string;
        expires_in?: number;
        error?: string;
    }) => void;
}

interface GapiWindow {
    gapi?: {
        client?: {
            setToken: (token: { access_token: string }) => void;
            drive?: {
                files?: {
                    list: (config: Record<string, unknown>) => Promise<{ result: { files: DriveFile[] } }>;
                    get: (config: Record<string, unknown>) => Promise<{ result: DriveFile }>;
                };
            };
        };
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

// Store the current access token in memory
let currentAccessToken: string | null = null;
let tokenClient: TokenClient | null = null;

/**
 * Initialize Google Drive API using Google Identity Services (GIS)
 */
export async function initializeGoogleDriveAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
        const gisWindow = window as unknown as GisWindow;

        const initializeTokenClient = () => {
            const oauth2 = gisWindow.google?.accounts?.oauth2;
            if (!oauth2) {
                reject(new Error('Google Identity Services failed to load'));
                return;
            }

            tokenClient = oauth2.initTokenClient({
                client_id: GOOGLE_OAUTH_CONFIG.clientId,
                scope: GOOGLE_DRIVE_API_CONFIG.scopes.join(' '),
                prompt: 'consent',
                callback: () => {
                    /* callback assigned per request */
                },
            });

            // Load gapi client (for discovery) after GIS is ready
            loadGapiClientLibrary(resolve, reject);
        };

        if (gisWindow.google?.accounts?.oauth2) {
            initializeTokenClient();
            return;
        }

        // Load the GIS script if not already present
        if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeTokenClient;
            script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
            document.head.appendChild(script);
        } else {
            // Script tag exists but maybe not ready yet
            const checkReady = setInterval(() => {
                if (gisWindow.google?.accounts?.oauth2) {
                    clearInterval(checkReady);
                    initializeTokenClient();
                }
            }, 50);
            // Safety timeout
            setTimeout(() => clearInterval(checkReady), 3000);
        }
    });
}

function loadGapiClientLibrary(
    resolve: () => void,
    reject: (error: Error) => void
) {
    // Load gapi.client for Drive API access
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        const gapi = (window as unknown as GapiWindow).gapi;
        if (!gapi) {
            reject(new Error('Google API failed to load'));
            return;
        }

        gapi.load('client', () => {
            const apiKey = GOOGLE_API_KEY?.trim();
            if (!apiKey) {
                reject(
                    new Error(
                        'Google Drive API key is missing. Set VITE_GOOGLE_DRIVE_API_KEY in your environment.'
                    )
                );
                return;
            }

            gapi.client
                ?.init({
                    apiKey,
                    discoveryDocs: GOOGLE_DRIVE_API_CONFIG.discoveryDocs,
                })
                .then(() => resolve())
                .catch((error) => {
                    console.error('gapi.client.init error:', error);
                    reject(error);
                });
        });
    };
    script.onerror = () => {
        reject(new Error('Failed to load Google API client'));
    };

    // Only add script if not already present
    if (!document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        document.head.appendChild(script);
    } else {
        resolve();
    }
}

/**
 * Sign in to Google Drive using Google Identity Services token response
 */
export async function signInToGoogleDrive(): Promise<{
    accessToken: string;
    refreshToken?: string;
    tokenExpiry: number;
}> {
    if (!tokenClient) {
        throw new Error('Google Identity Services not initialized');
    }

    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = (tokenResponse) => {
                if (tokenResponse.error) {
                    reject(new Error(tokenResponse.error));
                    return;
                }

                if (!tokenResponse.access_token) {
                    reject(new Error('Sign-in failed: no access token received'));
                    return;
                }

                currentAccessToken = tokenResponse.access_token;
                resolve({
                    accessToken: tokenResponse.access_token,
                    refreshToken: undefined,
                    tokenExpiry: Date.now() + (tokenResponse.expires_in ?? 3600) * 1000,
                });
            };

            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
        }
    });
}

/**
 * Sign out from Google Drive
 */
export async function signOutFromGoogleDrive(): Promise<void> {
    const gisWindow = window as unknown as GisWindow;
    if (currentAccessToken && gisWindow.google?.accounts?.oauth2?.revoke) {
        gisWindow.google.accounts.oauth2.revoke(currentAccessToken, () => {
            currentAccessToken = null;
        });
    } else {
        currentAccessToken = null;
    }
}

/**
 * Check if user is currently signed in
 */
export function isSignedInToGoogleDrive(): boolean {
    return currentAccessToken !== null;
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
): Promise<DriveFile[]> {
    const defaultQuery = 'trashed=false and \'appDataFolder\' in parents';
    const finalQuery = query ? `${defaultQuery} and ${query}` : defaultQuery;

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(finalQuery)}&spaces=appDataFolder&fields=files(id,name,mimeType,modifiedTime,size)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const result = await response.json() as { files?: DriveFile[] };
    return result.files || [];
}

/**
 * Check if a file extension is supported
 */
export function isSupportedFileExtension(filename: string): boolean {
    return SUPPORTED_FILE_EXTENSIONS.some((ext) =>
        filename.toLowerCase().endsWith(ext)
    );
}

/**
 * Check if a MIME type is supported
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.some((type) => mimeType.includes(type));
}

/**
 * Check if a file is supported based on name and/or MIME type
 */
export function isSupportedFile(file: DriveFile): boolean {
    return isSupportedFileExtension(file.name) || isSupportedMimeType(file.mimeType);
}

/**
 * Load and filter files from Google Drive (only supported types)
 */
export async function loadSupportedFilesFromDrive(
    accessToken: string
): Promise<DriveFile[]> {
    const allFiles = await listFilesFromDrive(accessToken);
    return allFiles.filter(isSupportedFile);
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

    if (config.enabled && !config.accessToken) {
        errors.push('Access token is missing');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
