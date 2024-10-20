import { createContext, ReactNode, useEffect, useMemo, useReducer, useRef } from 'react';
import { DrawingState } from './DrawingContext';
import { EditorDrawingAction, editorDrawingReducer, EditorDrawingState } from './EditorDrawingContext';
import { useConfig } from '../hooks/useConfig';
import { useResentScribbles } from '../hooks/useResentScribbles';

export type EditorState = {
    drawing?: EditorDrawingState
}

export type EditorAction =
    Load|
    Edit;

    type Load = {
        type: 'editor/load';
        payload?: DrawingState;
    };
    type Edit = {
        type: 'editor/edit';
        payload: EditorDrawingAction;
    };

export const EditorContext = createContext<[EditorState, React.Dispatch<EditorAction>]>([
    {}, () => undefined
]);

function reducer(state:EditorState, action:EditorAction):EditorState{
    switch (action.type) {
    case 'editor/load':
        return action.payload? {
            ...state,
            drawing: editorDrawingReducer(state.drawing, { type: 'editor-drawing/load', payload: action.payload })
        } : { ...state, drawing: undefined };
    case 'editor/edit':
        return {
            ...state,
            drawing: state.drawing? editorDrawingReducer(state.drawing, action.payload):undefined,
        };
    }
}

export const EditorContextProvider = (props: { children: ReactNode; }) => {
    const [{ autoSave }] = useConfig();
    const useDrawing = useReducer(reducer, {});
    const [, { saveLastSession }] = useResentScribbles();
    const { drawing } = useDrawing[0];
    const drawingRef = useRef<EditorDrawingState>();
    useMemo(()=>{
        drawingRef.current = drawing;
    }, [drawing]);
    useEffect(()=>{
        if(autoSave==0)return () => {};
        const autoSaveIntervalId = setInterval(() => {
            if(!drawingRef.current)return () => {};
            const { data } = drawingRef.current;
            const { name } = data;
            saveLastSession(data, name);
        }, autoSave);
        return () => clearInterval(autoSaveIntervalId);
    }, [autoSave, saveLastSession]);
    return <EditorContext.Provider value={useDrawing}>
        {props.children}
    </EditorContext.Provider>;
};
