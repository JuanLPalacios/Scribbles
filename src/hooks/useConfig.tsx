import { useEffect, useMemo } from 'react';
import { createStorageHook } from '../generators/createStorageHook';
import { useVersion } from './useVersion';

export type GoogleDriveConfig = {
    enabled: boolean;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
}

type Config = {
    autoSave: number
    doubleClickTimeOut: number
    googleDrive?: GoogleDriveConfig
    canvasColor?: {
        r: number
        g: number
        b: number
        a: number
    }
    strokeStabilization?: number
}

export const useStoredConfig = createStorageHook<Config>('config', 'local', { autoSave: 300000, doubleClickTimeOut: 1000, canvasColor: { r: 255, g: 255, b: 255, a: 1 }, strokeStabilization: 1 });

export const useConfig = ()=>{
    const [config, setConfig] = useStoredConfig();
    const updatedStoredFiles = useVersion<Config>(config, '0.3.0', []);
    useEffect(() => {
        if (updatedStoredFiles != config)
            setConfig(updatedStoredFiles);
    }, [setConfig, config, updatedStoredFiles]);
    const memo = useMemo(():[Config, (value: Config) => void]=>[config, setConfig], [config, setConfig]);
    return memo;
};