import { createDrawable } from '../generators/createDrawable';
import { createEditorLayer } from '../generators/createEditorLayer';
import { DrawableState } from '../types/DrawableState';
import { Handle } from '../types/Handle';
import { EditorLayerState } from '../types/LayerState';
import { DrawingAction, DrawingState, drawingReducer, invertDrawingAction } from './DrawingContext';

export type EditorDrawingState = {
    editorState:{
        layers: EditorLayerState[];
        prev: DrawingAction[];
        next: DrawingAction[];
        selectedLayer: number;
        buffer: DrawableState;
        handles: Handle[];
        transform: DOMMatrix
    },
    data:DrawingState,
};

export type EditorDrawingAction =
    Do |
    Undo |
    Redo |
    SelectLayer |
    ForceUpdate |
    Load|
    Transform|
    Rename|
    Edit;
type Do = {
    type: 'editor-drawing/do';
    payload: DrawingAction;
};
type Undo = {
    type: 'editor-drawing/undo';
};
type Redo = {
    type: 'editor-drawing/redo';
};
type ForceUpdate = {
    type: 'editor-drawing/forceUpdate';
    payload: Partial<EditorDrawingState>;
};
type SelectLayer = {
    type: 'editor-drawing/selectLayer';
    payload: number;
};
type Load = {
    type: 'editor-drawing/load';
    payload?: DrawingState;
};
type Edit = {
    type: 'editor-drawing/edit';
    payload?: DrawingAction;
};
type Rename = {
    type: 'editor-drawing/rename';
    payload: string;
};
type Transform = {
    type: 'editor-drawing/transform';
    payload: DOMMatrix;
};

const updateLayers = (state:EditorDrawingState):EditorDrawingState => {
    const { editorState, data: { layers } } = state;
    const { layers: editorLayers } = editorState;
    if(layers.length<=editorLayers.length)return state;
    return {
        ...state,
        editorState: {
            ...editorState,
            layers: state.data.layers.map((x, i)=>(i in editorLayers)?editorLayers[i]:createEditorLayer(x)),
        }
    };
};

export const editorDrawingReducer = (state: EditorDrawingState|undefined, action: EditorDrawingAction): EditorDrawingState|undefined => {
    switch (action.type) {
    case 'editor-drawing/load':
        return action.payload ? updateLayers({
            ...state,
            data: action.payload,
            editorState: {
                layers: [],
                next: [],
                prev: [],
                handles: [],
                selectedLayer: 0,
                buffer: createDrawable({ size: [action.payload.width, action.payload.height], options: { willReadFrequently: true } }),
                transform: new DOMMatrix()
            }

        }):undefined;
    }
    if(!state) return state;
    const { editorState, data } = state || {};
    const { next=[], prev=[] } = editorState || {};
    const { payload } = { payload: undefined, ...action };
    console.log(action.type, payload);
    switch (action.type) {
    case 'editor-drawing/do':
        return state ? updateLayers({
            ...state,
            data: drawingReducer(data, action.payload),
            editorState: {
                ...editorState,
                prev: [...prev, invertDrawingAction(data, action.payload)],
                next: []
            }
        }) : undefined;
    case 'editor-drawing/undo':
        return (prev.length > 0) ? updateLayers({
            ...state,
            data: drawingReducer(data, prev[prev.length - 1]),
            editorState: {
                ...editorState,
                prev: prev.slice(0, prev.length - 1),
                next: [...next, invertDrawingAction(data, prev[prev.length - 1])],
            }
        }) : state;
    case 'editor-drawing/redo':
        return (next.length > 0) ? updateLayers({
            ...state,
            data: drawingReducer(data, next[next.length - 1]),
            editorState: {
                ...editorState,
                next: next.slice(0, next.length - 1),
                prev: [...prev, invertDrawingAction(data, next[next.length - 1])],
            }
        }) : state;
    case 'editor-drawing/selectLayer':
        return {
            ...state,
            data,
            editorState: {
                ...editorState,
                selectedLayer: action.payload
            }
        };
    case 'editor-drawing/transform':
        return {
            ...state,
            data,
            editorState: {
                ...editorState,
                transform: action.payload
            }
        };
    case 'editor-drawing/rename':
        return updateLayers({
            ...state,
            data: {
                ...data,
                name: action.payload
            },
        });
    case 'editor-drawing/forceUpdate':
        return updateLayers({
            ...state,
            ...action.payload
        });
    default:
        throw new Error();
    }
};
