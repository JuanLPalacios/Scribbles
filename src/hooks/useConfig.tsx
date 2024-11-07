import { useEffect, useMemo } from 'react';
import { createStorageHook } from '../generators/createStorageHook';
import { useVersion } from './useVersion';
type Config = {
    autoSave: number
    doubleClickTimeOut: number
}

export const useStoredConfig = createStorageHook<Config>('config', 'local', { autoSave: 300000, doubleClickTimeOut: 1000 });

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