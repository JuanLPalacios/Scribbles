import { createContext } from 'react';
import { DrawingState, DrawingAction, drawingReducer, antidReducer } from './DrawingState';

export type EditorState = {
    name?: string;
    drawing?: DrawingState;
    prev: DrawingAction[];
    next: DrawingAction[];
};

export type EditorAction =
    Do |
    Undo |
    Redo |
    ForceUpdate |
    Load;
type Do = {
    type: 'editor/do';
    payload: DrawingAction;
};
type Undo = {
    type: 'editor/undo';
};
type Redo = {
    type: 'editor/redo';
};
type ForceUpdate = {
    type: 'editor/forceUpdate';
    payload: Partial<Omit<EditorState, 'prev' | 'next'>>;
};
type Load = {
    type: 'editor/load';
    payload?: {
        name: string;
        drawing: DrawingState;
    };
};

export const reducer = (state: EditorState, action: EditorAction): EditorState => {
    const { next, prev, drawing } = state;
    switch (action.type) {
    case 'editor/do':
        return drawing ? { ...state, drawing: drawingReducer(drawing, action.payload), prev: [...prev, antidReducer(drawing, action.payload)], next: [] } : state;
    case 'editor/undo':
        return (drawing && (prev.length > 0)) ? { ...state, prev: prev.slice(0, prev.length - 1), next: [...next, antidReducer(drawing, prev[prev.length - 1])], drawing: drawingReducer(drawing, prev[prev.length - 1]) } : state;
    case 'editor/redo':
        return (drawing && (next.length > 0)) ? { ...state, next: next.slice(0, next.length - 1), prev: [...prev, antidReducer(drawing, next[next.length - 1])], drawing: drawingReducer(drawing, next[next.length - 1]) } : state;
    case 'editor/forceUpdate':
        return { ...state, ...action.payload };
    case 'editor/load':
        return action.payload ? { ...state, ...action.payload } : { ...state, name: undefined, drawing: undefined, prev: [], next: [] };
    default:
        throw new Error();
    }
};

export const EditorContext = createContext<[EditorState, React.Dispatch<EditorAction>]>([
    {
        prev: [],
        next: [],
    }, () => undefined
]);
