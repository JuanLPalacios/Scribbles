import { useEffect, useMemo } from 'react';
import { useVersion } from './useVersion';
import { useStoredFiles } from './useStoredFiles';
import { DrawingState } from '../contexts/DrawingContext';
import { uid } from '../lib/uid';
import { SDRW } from '../lib/sdrw';

export type StoredFile = {
    key: number;
    path: string;
    name: string;
    chunks: number;
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
            },
            saveDrawingState(drawing:DrawingState, name:string){
                SDRW.binary(drawing)
                    .then(blob=>new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }))
                    .then(dataURI=>{
                        const chunkSize = 10000;
                        const storedFile = storedFiles.find(x=>x.name == name)||{ key: uid(), name, path: `${(drawing.name==name)?'local':'file'}:${name}`, chunks: 0 };
                        const { key } = storedFile;
                        try {
                            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                                const chunk = dataURI.substring(i*chunkSize, (i+1)*chunkSize);
                                localStorage.setItem(`file-${key}-${i}`, chunk);
                            }
                            const chunks = Math.ceil(dataURI.length/chunkSize);
                            setStoredFiles([{ ...storedFile, chunks }, ...storedFiles.filter(x=>x.name!=storedFile.name)]);
                        } catch (error) {
                            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                                localStorage.removeItem(`file-${key}-${i}`);
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
                setStoredFiles([storedFile, ...storedFiles.filter(x=>x.name!=storedFile.name)]);
                return SDRW.jsonObj(dataURI.split(',')[1]);
            },
        };
    }, [setStoredFiles, storedFiles]);
    return [storedFiles, actions] as const;
}
