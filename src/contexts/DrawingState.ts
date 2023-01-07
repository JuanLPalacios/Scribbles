import { DrawableState } from '../types/DrawableState';
import { LayerState } from '../types/LayerState';

export type DrawingState = {
    width:number,
    height:number,
    layers:LayerState[]
    selectedLayer:number
};

export type DrawingAction =
    | WorkLayer
    | Loadlayer
    | SelectLayer
    | AddLayer
    | RemoveLayer
    | MoveLayer
    | UpdateLayer;

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
        canvas:ImageData
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

export const antidReducer = (drawing:DrawingState, action: DrawingAction):DrawingAction => {
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
        return {  type: 'drawing/loadlayer', payload: { at: action.payload.at, canvas: layers[action.payload.at].canvas.ctx!.getImageData(0, 0, width, height) } };
    default:
        throw action;
    }
};

export const drawingReducer = (drawing:DrawingState, action: DrawingAction):DrawingState => {
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
    case 'drawing/loadlayer':
        layers[action.payload.at].canvas.ctx!.putImageData(
            action.payload.canvas,
            0, 0);
        return { ...drawing };
    default:
        throw new Error();
    }
};