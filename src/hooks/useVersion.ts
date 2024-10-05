import { useEffect, useMemo } from 'react';
import { useStorage } from './useStorage';

const TARGET_VERSION_REGEX = /^([^\d])(\d+)\.(\d+)\.(\d+)/g;

export function useVersion<T>(value:T, targetVersion:string, updateFunctions:{version:string, update:(v:any)=>[string, any]}[]) {
    const [ver, setVer] = useStorage<{ version: string }>('version', 'local', { version: '0.3.0' });
    let updated = false;
    const updatedValue = useMemo<T>(()=>{
        if(fits(ver.version, targetVersion))return value;
        let updatedValue = value;
        let currentVersion = ver.version;
        updateFunctions.forEach(({ update, version })=>{
            if(fits(currentVersion, version))
                [currentVersion, updatedValue] = update(updatedValue);
        });
        if(!fits(currentVersion, targetVersion)) throw new Error('version failed to bee updated');
        updated = true;
        return updatedValue;
    }, [targetVersion, updateFunctions, value, ver.version]);
    useEffect(()=>{
        if(updated){
            const [, , ...previous] = Array.from(ver.version.match(TARGET_VERSION_REGEX)||[]);
            const [, , ...current] = Array.from(targetVersion.match(TARGET_VERSION_REGEX)||[]);
            if(versionAsNumber(...current)>versionAsNumber(...previous))
                setVer({ ...ver, version: current.join('.') });
        }
    }, []);
    return updatedValue;
}

function fits(version: string, targetVersion: string) {
    const [, condition, ...target] = Array.from(targetVersion.match(TARGET_VERSION_REGEX)||[]);
    const [, , ...ver] = Array.from(version.match(TARGET_VERSION_REGEX)||[]);
    switch (condition) {
    case '':
        return version == targetVersion;
    case '^':
        return versionAsNumber(...target)>=versionAsNumber(...ver);
    default:
        break;
    }
}

function versionAsNumber(...values: string[]) {
    return values.map((x, i)=>parseInt(x)*(100**(i-values.length-1))).reduce((sum, value)=>sum+value, 0);
}
