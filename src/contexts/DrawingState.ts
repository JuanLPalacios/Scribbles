import { createContext } from 'react';
import { createDrawable } from '../generators/createDrawable';
import { DrawableState } from '../types/DrawableState';
import { LayerState } from '../types/LayerState';

export type DrawingState = {
    width:number,
    height:number,
    layers:LayerState[]
    selectedLayer:number
};

export type EditorState = {
    name?:string,
    drawing?: DrawingState,
    prev:DrawingAction[],
    next:DrawingAction[]
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
    payload: Partial<Omit<EditorState, 'prev' | 'next' >>
}

type Load = {
    type: 'editor/load',
    payload?:{
        name:string
        drawing:DrawingState
    }
}

type DrawingAction =
    WorkLayer |
    Loadlayer |
    SelectLayer |
    AddLayer |
    RemoveLayer |
    MoveLayer |
    UpdateLayer;

type WorkLayer = {
    type: 'drawing/workLayer',
    payload:{
        at:number,
        layer:LayerState
    }
}

type Loadlayer = {
    type: 'drawing/loadlayer',
    payload:{
        at:number,
        canvas:DrawableState
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
        layer:LayerState
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
        layer: Partial<Omit<LayerState, 'canvas' >>
    }
}

const antidreducer = (drawing:DrawingState, action: DrawingAction):DrawingAction => {
    const { width, height, layers, selectedLayer } = drawing;
    switch (action.type) {
    case 'drawing/addLayer':
        return { type: 'drawing/removeLayer', payload: { at: action.payload.at } };
    case 'drawing/removeLayer':
        return {  type: 'drawing/addLayer', payload: { at: action.payload.at, layer: layers[action.payload.at] } };
    case 'drawing/moveLayer':
        return {  type: 'drawing/moveLayer', payload: { at: action.payload.to, to: action.payload.at } };
    case 'drawing/updateLayer':
        return {  type: 'drawing/updateLayer', payload: { at: action.payload.at, layer: Object.keys(action.payload.layer).reduce((prev, key) => ({ ...prev, [key]: (layers[action.payload.at] as any)[key] }), {}) } };
    case 'drawing/selectLayer':
        return {  type: 'drawing/selectLayer', payload: selectedLayer };
    case 'drawing/workLayer':
    case 'drawing/loadlayer':
        // eslint-disable-next-line no-case-declarations
        const canvas = createDrawable({ size: [width, height] });
        if(canvas.ctx) canvas.ctx.globalCompositeOperation = 'copy';
        canvas.ctx?.drawImage(layers[action.payload.at].canvas.canvas, 0, 0);
        return {  type: 'drawing/loadlayer', payload: { at: action.payload.at, canvas } };
    default:
        throw action;
    }
};

export const reducer = (state:EditorState, action: EditorAction):EditorState => {
    const { next, prev, drawing } = state;
    switch (action.type) {
    case 'editor/do':
        return drawing? { ...state, drawing: dreducer(drawing, action.payload), prev: [...prev, antidreducer(drawing, action.payload)], next: [] } : state ;
    case 'editor/undo':
        return (drawing && (prev.length > 0)) ? { ...state, prev: prev.slice(0, prev.length -1), next: [...next, antidreducer(drawing, prev[prev.length-1])], drawing: dreducer(drawing, prev[prev.length-1]) } : state;
    case 'editor/redo':
        return (drawing && (next.length > 0)) ? { ...state, next: next.slice(0, next.length -1), prev: [...prev, antidreducer(drawing, next[next.length-1])], drawing: dreducer(drawing, next[next.length-1]) } : state;
    case 'editor/forceUpdate':
        return { ...state, ...action.payload };
    case 'editor/load':
        return action.payload? { ...state, ...action.payload } : { ...state, name: undefined, drawing: undefined, prev: [], next: [] };
    default:
        throw new Error();
    }
};

const dreducer = (drawing:DrawingState, action: DrawingAction):DrawingState => {
    const { layers, selectedLayer } = drawing;
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
            layers: [...layers.slice(0, action.payload.to).filter((x, i) => action.payload.at !== i),
                layers[action.payload.at],
                ...layers.slice(action.payload.to).filter((x, i) => action.payload.at !== (i + action.payload.to))
            ],
            selectedLayer: selectedLayer + (selectedLayer > action.payload.to ?1:0) - (selectedLayer > action.payload.at ?1:0)
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
    case 'drawing/loadlayer':
        // eslint-disable-next-line no-case-declarations
        const ctx = layers[action.payload.at].canvas.ctx;
        if(ctx) ctx.globalCompositeOperation = 'copy';
        ctx?.drawImage(action.payload.canvas.canvas, 0, 0);
        if(ctx) ctx.globalCompositeOperation = 'source-over';
        return { ...drawing };
    default:
        throw new Error();
    }
};

export const EditorContext = createContext<[EditorState, React.Dispatch<EditorAction>]>([
    {
        prev: [],
        next: [],
    }, ()=>undefined]);