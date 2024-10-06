import { useEffect, useMemo } from 'react';
import { useVersion } from './useVersion';
import { useStoredFiles } from './useStoredFiles';

export type StoredFile = {
    key: number;
    path: string;
    name: string;
};

export function useResentScribbles() {
    const [storedFiles, setStoredFiles] = useStoredFiles();
    const updatedStoredFiles = useVersion<StoredFile[]>(storedFiles, '0.3.0', []);
    useEffect(() => {
        if (updatedStoredFiles != storedFiles)
            setStoredFiles(updatedStoredFiles);
    }, [setStoredFiles, storedFiles, updatedStoredFiles]);
    const actions = useMemo(()=>{
        return {
            addFile(storedFile:StoredFile){
                setStoredFiles([storedFile, ...storedFiles.filter(x=>x.name!=storedFile.name)]);
            }
        };
    }, [setStoredFiles, storedFiles]);
    return [storedFiles, actions] as const;
}
