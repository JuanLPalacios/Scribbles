import { createStorageHook } from '../generators/createStorageHook';
import { useEffect, useMemo } from 'react';
import { useVersion } from './useVersion';
import { DrawingState } from '../contexts/DrawingContext';
import { uid } from '../lib/uid';
import { SDRW } from '../lib/sdrw';
import { renderDrawingThumbnail } from '../lib/Graphics';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';

export type StoredFile = {
    key: number;
    path: string;
    name: string;
    chunks: number;
    thumbnail?: string; // base64 data URL for thumbnail image
    thumbnailChunks?: number; // number of chunks for thumbnail storage
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

        // Reusable chunking utilities
        function saveChunkedData(prefix: string, data: string): number {
            for (let i = 0; i * chunkSize < data.length; i++) {
                const chunk = data.substring(i * chunkSize, (i + 1) * chunkSize);
                localStorage.setItem(`${prefix}-${i}`, chunk);
            }
            return Math.ceil(data.length / chunkSize);
        }

        function loadChunkedData(prefix: string, chunks: number): string {
            let data = '';
            for (let i = 0; i < chunks; i++) {
                data += localStorage.getItem(`${prefix}-${i}`) || '';
            }
            return data;
        }

        function removeChunkedData(prefix: string, chunks: number): void {
            for (let i = 0; i < chunks; i++) {
                localStorage.removeItem(`${prefix}-${i}`);
            }
        }

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
            saveDrawingState(editorDrawing:EditorDrawingState, name?:string){
                const { data: drawing, editorState: { layers: editorLayers, thumbnail: drawingThumbnail } } = editorDrawing;
                name = name || drawing.name;

                // Generate thumbnail first
                let thumbnailDataURL: string | undefined;
                if(editorLayers && editorLayers.length > 0 && drawingThumbnail){
                    try {
                        const items = drawing.layers.map((layer, i) => ({ layer, editorLayer: editorLayers[i] }));
                        renderDrawingThumbnail(items, drawingThumbnail);
                        thumbnailDataURL = drawingThumbnail.canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn('Failed to generate thumbnail:', e);
                    }
                }

                return SDRW.binary(drawing, thumbnailDataURL)
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

                            // Store thumbnail in chunks if present
                            let thumbnailChunks = 0;
                            if (thumbnailDataURL) {
                                removeChunkedData(`thumb-${key}`, storedFile.thumbnailChunks || 0);
                                thumbnailChunks = saveChunkedData(`thumb-${key}`, thumbnailDataURL);
                            }

                            addFile({ ...storedFile, chunks, thumbnailChunks });
                        } catch (error) {
                            for (let i = 0; i*chunkSize < dataURI.length; i++) {
                                localStorage.removeItem(`file-${key}-${i}`);
                            }
                            throw error;
                        }
                    });
            },
            saveLastSession(editorDrawing:EditorDrawingState, name?:string){
                const { data: drawing, editorState: { layers: editorLayers, thumbnail: drawingThumbnail } } = editorDrawing;
                name = name || drawing.name;

                // Generate thumbnail first
                let thumbnailDataURL: string | undefined;
                if(editorLayers && editorLayers.length > 0 && drawingThumbnail){
                    try {
                        const items = drawing.layers.map((layer, i) => ({ layer, editorLayer: editorLayers[i] }));
                        renderDrawingThumbnail(items, drawingThumbnail);
                        thumbnailDataURL = drawingThumbnail.canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn('Failed to generate thumbnail:', e);
                    }
                }

                SDRW.binary(drawing, thumbnailDataURL)
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

                            // Store thumbnail in chunks if present
                            let thumbnailChunks = 0;
                            if (thumbnailDataURL) {
                                removeChunkedData('thumb-session', storedFile.thumbnailChunks || 0);
                                thumbnailChunks = saveChunkedData('thumb-session', thumbnailDataURL);
                            }

                            setLastSession({ ...storedFile, chunks, thumbnailChunks });
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
            saveDriveThumbnail(fileId: string, fileName: string, thumbnailDataURL: string) {
                const path = `drive:${fileId}`;
                const existing = updatedStoredFiles.find(x => x.path === path);

                if (existing) {
                    // Remove old thumbnail chunks
                    if (existing.thumbnailChunks) {
                        removeChunkedData(`thumb-${existing.key}`, existing.thumbnailChunks);
                    }
                    // Store new thumbnail in chunks
                    const thumbnailChunks = saveChunkedData(`thumb-${existing.key}`, thumbnailDataURL);
                    // Update existing entry with thumbnail chunks
                    const updated = updatedStoredFiles.map(x =>
                        x.path === path ? { ...x, thumbnailChunks } : x
                    );
                    setStoredFiles(updated);
                } else {
                    // Create new entry for Drive file
                    const key = uid();
                    const thumbnailChunks = saveChunkedData(`thumb-${key}`, thumbnailDataURL);
                    const storedFile: StoredFile = {
                        key,
                        path,
                        name: fileName,
                        chunks: 0,
                        thumbnailChunks
                    };
                    setStoredFiles([storedFile, ...updatedStoredFiles]);
                }
            },
            getDriveThumbnail(fileId: string): string | undefined {
                const path = `drive:${fileId}`;
                const file = updatedStoredFiles.find(x => x.path === path);
                if (!file || !file.thumbnailChunks) return undefined;
                return loadChunkedData(`thumb-${file.key}`, file.thumbnailChunks);
            },
            getThumbnail(file: StoredFile): string | undefined {
                if (!file.thumbnailChunks) return undefined;
                return loadChunkedData(`thumb-${file.key}`, file.thumbnailChunks);
            },
        };
    }, [lastSession, setLastSession, setStoredFiles, updatedStoredFiles]);
    return [updatedStoredFiles, actions] as const;
}
