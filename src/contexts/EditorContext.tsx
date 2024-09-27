import { createContext, ReactNode, useReducer } from 'react';
import { EditorLayerState } from '../types/LayerState';
import { createEditorLayer } from '../generators/createEditorLayer';
import { DrawingState, DrawingAction, drawingReducer, invertDrawingAction } from './DrawingContext';
import { DrawableState } from '../types/DrawableState';
import { createDrawable } from '../generators/createDrawable';

export type EditorState = {
    drawing?: {
        editor:EditorDrawingState,
        data:DrawingState,
    }
}

export type EditorDrawingState = {
    layers: EditorLayerState[],
    prev:DrawingAction[],
    next:DrawingAction[],
    selectedLayer:number,
    buffer: DrawableState
}

export type EditorAction =
Do |
    Undo |
    Redo |
    SelectLayer |
    ForceUpdate |
    Load;

type Do = {
    type: 'editor/do',
    payload:DrawingAction
}

type Undo = {
    type: 'editor/undo'
}

type Redo = {
    type: 'editor/redo'
}

type ForceUpdate = {
    type: 'editor/forceUpdate',
    payload: {data?:Partial<DrawingState>, editor?:Partial<EditorDrawingState>}
}

type Load = {
    type: 'editor/load',
    payload?:DrawingState
}

type SelectLayer = {
    type: 'editor/selectLayer',
    payload:number
}

// eslint-disable-next-line react-refresh/only-export-components
export const reducer = (state:EditorState, action: EditorAction):EditorState => {
    const { drawing } = state;
    switch (action.type) {
    case 'editor/load':
        return action.payload? { ...state, drawing: { data: action.payload, editor: { layers: action.payload.layers.map(createEditorLayer), next: [], prev: [], selectedLayer: 0, buffer: createDrawable({ size: [action.payload.width, action.payload.height] }) } } } : { ...state, drawing: undefined };
    }
    if(!drawing){
        switch (action.type) {
        case 'editor/undo':
        case 'editor/redo':
        case 'editor/forceUpdate':
        case 'editor/do':
            return state;
        default:
            throw new Error();
        }
    }
    const { editor, data } = drawing||{};
    const { next, prev } = editor||{};
    const { payload } = { payload: undefined, ...action };
    console.log(action.type, payload);
    switch (action.type) {
    case 'editor/do':
        return drawing? {
            ...state,
            drawing: {
                data: drawingReducer(data, action.payload),
                editor: {
                    ...editor,
                    prev: [...prev, invertDrawingAction(data, action.payload)],
                    next: []
                }
            }
        } : state;
    case 'editor/undo':
        return (prev.length > 0) ? {
            ...state,
            drawing: {
                data: drawingReducer(data, prev[prev.length-1]),
                editor: {
                    ...editor,
                    prev: prev.slice(0, prev.length -1),
                    next: [...next, invertDrawingAction(data, prev[prev.length-1])],
                }
            }
        } : state;
    case 'editor/redo':
        return (next.length > 0) ? {
            ...state,
            drawing: {
                data: drawingReducer(data, next[next.length-1]),
                editor: {
                    ...editor,
                    next: next.slice(0, next.length -1),
                    prev: [...prev, invertDrawingAction(data, next[next.length-1])],
                }
            }
        } : state;
    case 'editor/selectLayer':
        return {
            ...state,
            drawing: {
                data,
                editor: {
                    ...editor,
                    selectedLayer: action.payload
                }
            }
        };
    case 'editor/forceUpdate':
        return { ...state,
            drawing: {
                data: {
                    ...data,
                    ...action.payload.data
                },
                editor: {
                    ...editor,
                    ...action.payload.editor
                }
            }
        };
    default:
        throw new Error();
    }
};

export const EditorContext = createContext<[EditorState, React.Dispatch<EditorAction>]>([
    {}, ()=>undefined]);

export const EditorContextProvider = (props: { children: ReactNode; }) => {
    const useDrawing = useReducer(reducer, {});
    return<EditorContext.Provider value={useDrawing}>
        {props.children}
    </EditorContext.Provider>;
};