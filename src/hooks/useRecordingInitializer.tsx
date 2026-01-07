/**
 * Hook to initialize recording with drawing, tool, and brush context.
 * This separate hook avoids circular dependencies by not wrapping hook imports.
 * Call this in a component that has access to useEditor, useToolOptions, useBrushesOptions.
 */

import { useCallback, useEffect } from 'react';
import { useDemoRecorder } from './useDemoRecorder';
import { useEditor } from './useEditor';
import { useToolOptions } from './useToolOptions';
import { useBrushesOptions } from './useBrushesOptions';

export const useRecordingInitializer = () => {
    const [demoState, demoActions] = useDemoRecorder();
    const [editor] = useEditor();
    const [toolOptions] = useToolOptions();
    const [brushesOptions] = useBrushesOptions();

    // Watch for recording state and create initEvent when recording starts
    useEffect(() => {
        if (demoState.state !== 'recording' || demoState.events.length > 0) {
            return; // Already has events or not in recording state
        }

        const drawing = editor.drawing;
        if (!drawing) return;

        const currentTool = toolOptions.tools[toolOptions.selectedTool];
        const currentBrush = brushesOptions.brushesPacks[brushesOptions.selectedBrush];

        const initEvent = {
            timestamp: 0,
            type: 'init' as const,
            data: {
                drawing: drawing.data,
                tool: currentTool.name || 'draw',
                brushId: currentBrush?.brush?.name || 'solid',
                color: '#000000',
            },
        };

        // Record the init event
        demoActions.recordEvent(initEvent);
    }, [demoState.state, demoState.events.length, editor.drawing, toolOptions, brushesOptions, demoActions]);
};
