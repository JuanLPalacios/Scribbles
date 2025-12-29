import { useState, useCallback } from 'react';
import { DriveFile, loadSupportedFilesFromDrive } from '../lib/GoogleDriveApi';
import { useGoogleDrive } from './useGoogleDrive';

export interface DriveFileListState {
    files: DriveFile[];
    loading: boolean;
    error: string | null;
}

export const useGoogleDriveFileList = () => {
    const { config, isConnected } = useGoogleDrive();
    const [state, setState] = useState<DriveFileListState>({
        files: [],
        loading: false,
        error: null,
    });

    const loadFiles = useCallback(async () => {
        if (!isConnected || !config?.accessToken) {
            setState({
                files: [],
                loading: false,
                error: 'Not connected to Google Drive',
            });
            return;
        }

        setState((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));

        try {
            const files = await loadSupportedFilesFromDrive(config.accessToken);
            setState({
                files,
                loading: false,
                error: null,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to load files';
            setState({
                files: [],
                loading: false,
                error: errorMessage,
            });
        }
    }, [isConnected, config?.accessToken]);

    const refresh = useCallback(() => {
        loadFiles();
    }, [loadFiles]);

    return {
        ...state,
        loadFiles,
        refresh,
    };
};
