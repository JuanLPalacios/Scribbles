import { createContext, ReactNode, useReducer } from 'react';
import { LayerState2, EditorLayerState } from '../types/LayerState';
import { createEditorLayer } from '../generators/createEditorLayer';

export type DrawingState = {
    name:string,
    width:number,
    height:number,
    layers:LayerState2[]
};

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
    selectedLayer:number
}

export type EditorAction =
    Do |
    Undo |
    Redo |
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
    payload: Partial<Omit<EditorDrawingState, 'prev' | 'next' >>
}

type Load = {
    type: 'editor/load',
    payload?:DrawingState
}

type DrawingAction =
    WorkLayer |
    LoadLayer |
    SelectLayer |
    AddLayer |
    RemoveLayer |
    MoveLayer |
    UpdateLayer;

type WorkLayer = {
    type: 'drawing/workLayer',
    payload:{
        at:number,
        layer:LayerState2
    }
}

type LoadLayer = {
    type: 'drawing/loadLayer',
    payload:{
        at:number,
        imageData:ImageData
    }
}

type SelectLayer = {
    type: 'drawing/selectLayer',
    payload:number
}

type AddLayer = {
    type: 'drawing/addLayer',
    payload:{
        at:number,
        layer:LayerState2
    }
}

type RemoveLayer = {
    type: 'drawing/removeLayer',
    payload:{
        at:number
    }
}

type MoveLayer = {
    type: 'drawing/moveLayer',
    payload:{
        at:number
        to:number
    }
}

type UpdateLayer = {
    type: 'drawing/updateLayer',
    payload:{
        at:number,
        layer: Partial<Omit<LayerState2, 'canvas' >>
    }
}

const antiDeduce = (drawing:DrawingState, action: DrawingAction):DrawingAction => {
    const { width, height, layers, selectedLayer } = drawing;
    console.log(action.type, action.payload);
    switch (action.type) {
    case 'drawing/addLayer':
        return { type: 'drawing/removeLayer', payload: { at: action.payload.at } };
    case 'drawing/removeLayer':
        return {  type: 'drawing/addLayer', payload: { at: action.payload.at, layer: layers[action.payload.at] } };
    case 'drawing/moveLayer':
        return {  type: 'drawing/moveLayer', payload: { at: action.payload.to, to: action.payload.at } };
    case 'drawing/updateLayer':
        // FIXME: this needs to be typed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return {  type: 'drawing/updateLayer', payload: { at: action.payload.at, layer: Object.keys(action.payload.layer).reduce((prev, key) => ({ ...prev, [key]: (layers[action.payload.at] as any)[key] }), {}) } };
    case 'drawing/selectLayer':
        return {  type: 'drawing/selectLayer', payload: selectedLayer };
    case 'drawing/loadLayer':
        return {  type: 'drawing/loadLayer', payload: action.payload };
    case 'drawing/workLayer':
        // eslint-disable-next-line no-case-declarations
        const layer = layers[action.payload.at];
        if(!layer.canvas.ctx)throw new Error();
        // eslint-disable-next-line no-case-declarations
        const imageData = layer.canvas.ctx.getImageData(0, 0, width, height);
        return {  type: 'drawing/loadLayer', payload: { at: action.payload.at, imageData } };
    default:
        throw action;
    }
};

// eslint-disable-next-line react-refresh/only-export-components
export const reducer = (state:EditorState, action: EditorAction):EditorState => {
    const { drawing } = state;
    if(!drawing){
        switch (action.type) {
            case 'editor/load':
                return action.payload? { ...state, drawing:{ data:action.payload, editor:{layers:action.payload.layers.map(createEditorLayer), next:[], prev:[], selectedLayer:0 } } } : { ...state, drawing: undefined };
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
        return drawing? { ...state, drawing: { data: deduce(data, action.payload), editor:{prev: [...prev, antiDeduce(data, action.payload)], next: []} } : state ;
    case 'editor/undo':
        return (data && (prev.length > 0)) ? { ...state, prev: prev.slice(0, prev.length -1), next: [...next, antiDeduce(data, prev[prev.length-1])], drawing: deduce(data, prev[prev.length-1]) } : state;
    case 'editor/redo':
        return (data && (next.length > 0)) ? { ...state, next: next.slice(0, next.length -1), prev: [...prev, antiDeduce(data, next[next.length-1])], drawing: deduce(data, next[next.length-1]) } : state;
    case 'editor/forceUpdate':
        return { ...state, ...action.payload };
    case 'editor/load':
        return action.payload? { ...state, ...action.payload } : { ...state, name: undefined, drawing: undefined, prev: [], next: [] };
    default:
        throw new Error();
    }
};

const deduce = (drawing:DrawingState, action: DrawingAction):DrawingState => {
    const { layers, selectedLayer } = drawing;
    console.log(action.type, action.payload);
    switch (action.type) {
    case 'drawing/addLayer':
        return drawing && { ...drawing, layers: [...layers.slice(0, action.payload.at),
            action.payload.layer,
            ...layers.slice(action.payload.at)
        ] };
    case 'drawing/removeLayer':
        return drawing && { ...drawing, layers: layers.filter((x, i) => selectedLayer !== i), selectedLayer: selectedLayer%(layers.length -1) };
    case 'drawing/moveLayer':
        return drawing &&
        { ...drawing,
            layers: [...layers.slice(0, action.payload.to + (action.payload.at < action.payload.to ?1:0)).filter((x, i) => action.payload.at !== i),
                layers[action.payload.at],
                ...layers.slice(action.payload.to + (action.payload.at < action.payload.to ?1:0)).filter((x, i) => action.payload.at !== (i + action.payload.to))
            ],
            selectedLayer: (selectedLayer !== action.payload.at ?selectedLayer + (selectedLayer > action.payload.to ?1:0) - (selectedLayer > action.payload.at ?1:0):action.payload.to)
        };
    case 'drawing/updateLayer':
        return drawing && { ...drawing,
            layers: [...layers.slice(0, action.payload.at),
                { ...layers[action.payload.at], ...action.payload.layer },
                ...layers.slice(action.payload.at+1)
            ]
        };
    case 'drawing/selectLayer':
        return { ...drawing, selectedLayer: action.payload };
    case 'drawing/workLayer':
        return { ...drawing,
            layers: [...layers.slice(0, action.payload.at),
                action.payload.layer,
                ...layers.slice(action.payload.at+1)
            ]
        };
    case 'drawing/loadLayer':
        // eslint-disable-next-line no-case-declarations
        const { imageData, at } = action.payload, layer = layers[at];
        layers[at] = { ...layer, imageData };
        return { ...drawing };
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