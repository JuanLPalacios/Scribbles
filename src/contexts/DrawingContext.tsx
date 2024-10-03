import { LayerState2 } from '../types/LayerState';

export type DrawingState = {
    name: string;
    width: number;
    height: number;
    layers: LayerState2[];
};
export type DrawingAction =
    WorkLayer |
    LoadLayer |
    AddLayer |
    RemoveLayer |
    MoveLayer |
    Load |
    UpdateLayer;

type Load = {
    type: 'drawing/load';
    payload: DrawingState
};
type WorkLayer = {
    type: 'drawing/workLayer';
    payload: {
        at: number;
        layer: LayerState2;
    };
};
type LoadLayer = {
    type: 'drawing/loadLayer';
    payload: {
        at: number;
        imageData: ImageData;
    };
};
type AddLayer = {
    type: 'drawing/addLayer';
    payload: {
        at: number;
        layer: LayerState2;
    };
};
type RemoveLayer = {
    type: 'drawing/removeLayer';
    payload: number;
};
type MoveLayer = {
    type: 'drawing/moveLayer';
    payload: {
        at: number;
        to: number;
    };
};
type UpdateLayer = {
    type: 'drawing/updateLayer';
    payload: {
        at: number;
        layer: Partial<LayerState2>;
    };
};
export const invertDrawingAction = (drawing: DrawingState, action: DrawingAction): DrawingAction => {
    const { layers } = drawing;
    console.log(action.type, action.payload);
    switch (action.type) {
    case 'drawing/addLayer':
        return { type: 'drawing/removeLayer', payload: action.payload.at };
    case 'drawing/removeLayer':
        return { type: 'drawing/addLayer', payload: { at: action.payload, layer: layers[action.payload] } };
    case 'drawing/moveLayer':
        return { type: 'drawing/moveLayer', payload: { at: action.payload.to, to: action.payload.at } };
    case 'drawing/updateLayer':
        // FIXME: this needs to be typed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { type: 'drawing/updateLayer', payload: { at: action.payload.at, layer: Object.keys(action.payload.layer).reduce((prev, key) => ({ ...prev, [key]: (layers[action.payload.at] as any)[key] }), {}) } };
    case 'drawing/loadLayer':
        return { type: 'drawing/loadLayer', payload: action.payload };
    case 'drawing/workLayer':
        // eslint-disable-next-line no-case-declarations
        const layer = layers[action.payload.at];
        return { type: 'drawing/loadLayer', payload: { at: action.payload.at, imageData: layer.imageData } };
    default:
        throw action;
    }
};
export const drawingReducer = (drawing: DrawingState, action: DrawingAction): DrawingState => {
    console.log(action.type, action.payload);
    switch (action.type) {
    case 'drawing/load':
        return action.payload;
    }
    const { layers } = drawing;
    switch (action.type) {
    case 'drawing/addLayer':
        return drawing && {
            ...drawing, layers: [...layers.slice(0, action.payload.at),
                action.payload.layer,
                ...layers.slice(action.payload.at)
            ]
        };
    case 'drawing/removeLayer':
        return drawing && {
            ...drawing,
            layers: layers.filter((x, i) => action.payload !== i)
        };
    case 'drawing/moveLayer':
        return drawing &&
            {
                ...drawing,
                layers: [...layers.slice(0, action.payload.to + (action.payload.at < action.payload.to ? 1 : 0)).filter((_x, i) => action.payload.at !== i),
                    layers[action.payload.at],
                    ...layers.slice(action.payload.to + (action.payload.at < action.payload.to ? 1 : 0)).filter((_x, i) => action.payload.at !== (i + action.payload.to))
                ]
            };
    case 'drawing/updateLayer':
        return drawing && {
            ...drawing,
            layers: [...layers.slice(0, action.payload.at),
                { ...layers[action.payload.at], ...action.payload.layer },
                ...layers.slice(action.payload.at + 1)
            ]
        };
    case 'drawing/workLayer':
        return {
            ...drawing,
            layers: [...layers.slice(0, action.payload.at),
                action.payload.layer,
                ...layers.slice(action.payload.at + 1)
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
