import { createStorageHook } from '../generators/createStorageHook';
import { useEffect, useMemo } from 'react';
import { useVersion } from './useVersion';
import { DrawingState } from '../contexts/DrawingContext';
import { uid } from '../lib/uid';
import { SDRW } from '../lib/sdrw';

export type StoredFile = {
    key: number;
    path: string;
    name: string;
    chunks: number;
};

export const useStoredFiles = createStorageHook<StoredFile[]>('resent-files', 'local', []);

export const useLastSession = createStorageHook<StoredFile>('last-session', 'local');

export function useResentScribbles() {
    const [storedFiles, setStoredFiles] = useStoredFiles();
    const [lastSession, setLastSession] = useLastSession();
    const updatedStoredFiles = useVersion<StoredFile[]>(storedFiles, '0.3.0', []);
    useEffect(() => {
        if (updatedStoredFiles != storedFiles)
            setStoredFiles(updatedStoredFiles);
    }, [setStoredFiles, storedFiles, updatedStoredFiles]);
    const actions = useMemo(()=>{
        const chunkSize = 10000;
        function addFile(storedFile:StoredFile){
            setStoredFiles([storedFile, ...updatedStoredFiles.filter(x=>x.name!=storedFile.name)]);
        }
        function getStoredFile(name:string, drawing:DrawingState) {
            return updatedStoredFiles.find(x => x.name == name) || { key: uid(), name, path: `${(drawing.name == name) ? 'local' : 'file'}:${name}`, chunks: 0 };
        }
        function saveInLocalStorage(prefix:string, dataURI:string) {
            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                const chunk = dataURI.substring(i*chunkSize, (i+1)*chunkSize);
                localStorage.setItem(`${prefix}-${i}`, chunk);
            }
            return Math.ceil(dataURI.length/chunkSize);
        }
        function removeFromLocalStorage(prefix:string, chunks:number) {
            for (let i = 0; i < chunks; i++) {
                localStorage.removeItem(`${prefix}-${i}`);
            }
        }
        return {
            addFile,
            saveDrawingState(drawing:DrawingState, name:string){
                SDRW.binary(drawing)
                    .then(blob=>new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }))
                    .then(dataURI=>{
                        const storedFile = getStoredFile(name, drawing);
                        const { key } = storedFile;
                        try {
                            removeFromLocalStorage(`file-${key}`, storedFile.chunks);
                            const chunks = saveInLocalStorage(`file-${key}`, dataURI);
                            addFile({ ...storedFile, chunks });
                        } catch (error) {
                            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                                localStorage.removeItem(`file-${key}-${i}`);
                            }
                            throw error;
                        }
                    });
            },
            saveLastSession(drawing:DrawingState, name:string){
                SDRW.binary(drawing)
                    .then(blob=>new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }))
                    .then(dataURI=>{
                        const storedFile = getStoredFile(name, drawing);
                        try {
                            removeFromLocalStorage('session', storedFile.chunks);
                            const chunks = saveInLocalStorage('session', dataURI);
                            setLastSession({ ...storedFile, chunks });
                        } catch (error) {
                            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                                localStorage.removeItem(`session-${i}`);
                            }
                            throw error;
                        }
                    });
            },
            loadDrawingState(storedFile:StoredFile){
                const { key, chunks } = storedFile;
                let dataURI = '';
                for (let i = 0; i < chunks; i++) {
                    dataURI += localStorage.getItem(`file-${key}-${i}`);
                }
                addFile(storedFile);
                return SDRW.jsonObj(dataURI.split(',')[1]);
            },
            loadLastSession(){
                if(!lastSession) return new Promise<undefined>((response)=>{ response(undefined); });
                const { chunks } = lastSession;
                let dataURI = '';
                for (let i = 0; i < chunks; i++) {
                    dataURI += localStorage.getItem(`session-${i}`);
                }
                return SDRW.jsonObj(dataURI.split(',')[1]);
            },
        };
    }, [lastSession, setLastSession, setStoredFiles, updatedStoredFiles]);
    return [updatedStoredFiles, actions] as const;
}
