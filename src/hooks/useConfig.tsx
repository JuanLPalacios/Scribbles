import { useEffect, useMemo } from 'react';
import { createStorageHook } from '../generators/createStorageHook';
import { useVersion } from './useVersion';
import { detectSystemStabilization } from '../lib/detectSystemStabilization';

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
    brushSizeInput?: 'slider'|'list'
    alphaInput?: 'slider'|'list'
}

export const useStoredConfig = createStorageHook<Config>('config', 'local', { autoSave: 300000, doubleClickTimeOut: 1000, canvasColor: { r: 255, g: 255, b: 255, a: 1 }, strokeStabilization: detectSystemStabilization(), brushSizeInput: 'slider', alphaInput: 'slider' });

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