import { createContext, ReactNode, useReducer } from 'react';
import { DrawingState } from './DrawingContext';
import { EditorDrawingAction, editorDrawingReducer, EditorDrawingState } from './EditorDrawingContext';
import { createDrawable } from '../generators/createDrawable';
import { createEditorLayer } from '../generators/createEditorLayer';

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
            drawing: {
                data: action.payload,
                editorState: {
                    layers: action.payload.layers.map(createEditorLayer),
                    next: [],
                    prev: [],
                    handles: [],
                    selectedLayer: 0,
                    buffer: createDrawable({ size: [action.payload.width, action.payload.height] })
                }
            }
        } : { ...state, drawing: undefined };
    case 'editor/edit':
        return {
            ...state,
            drawing: state.drawing? editorDrawingReducer(state.drawing, action.payload):undefined,
        };
    }
}

export const EditorContextProvider = (props: { children: ReactNode; }) => {
    const useDrawing = useReducer(reducer, {});
    return <EditorContext.Provider value={useDrawing}>
        {props.children}
    </EditorContext.Provider>;
};
