import { useMemo } from 'react';
import { useDemoRecorder } from '../hooks/useDemoRecorder';

/**
 * Wraps useEditor to manage recording lifecycle with file operations
 */

export const useRecordableEditor = () => {
    const { useEditor } = require('../hooks/useEditor');
    const editorResult = useEditor();
    const [editor, editorActions] = editorResult;
    const [, demoActions] = useDemoRecorder();

    return useMemo(() => {
        return [
            editor,
            {
                ...editorActions,
                newFile: (params: { name: string; width: number; height: number; }) => {
                    demoActions.startRecording();
                    editorActions.newFile(params);
                },
                openFile: (file: File) => {
                    demoActions.stopPlayback();
                    editorActions.openFile(file);
                    demoActions.startRecording();
                },
                loadFile: (fileRef: any) => {
                    demoActions.stopPlayback();
                    editorActions.loadFile(fileRef);
                    demoActions.startRecording();
                },
                loadSession: () => {
                    demoActions.stopPlayback();
                    editorActions.loadSession();
                    demoActions.startRecording();
                },
            }
        ] as const;
    }, [editor, editorActions, demoActions]);
};
