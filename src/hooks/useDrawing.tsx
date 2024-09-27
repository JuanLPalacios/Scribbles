import { useContext, useMemo } from 'react';
import { EditorContext, EditorDrawingState } from '../contexts/EditorDrawingState';
import { createLayer2 } from '../generators/createLayer2';
import { LayerState2 } from '../types/LayerState';
import { DrawingState } from '../contexts/DrawingContext';

export const useDrawing = () => {
    const [editorState, dispatch] = useContext(EditorContext);
    const { drawing } = editorState;
    if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
    const drawingActions = useMemo(() => {
        if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
        const { data, editorState: editor } = drawing;
        const { selectedLayer, next, prev } = editor;
        const { width, height, layers } = data;
        return {
            undo: (prev.length > 0) ? () => { dispatch({ type: 'editor/undo' }); } : undefined,
            redo: (next.length > 0) ? () => { dispatch({ type: 'editor/redo' }); } : undefined,
            moveLayerUp: (layers.length > selectedLayer + 1) ? () => {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/moveLayer',
                        payload: {
                            at: selectedLayer,
                            to: selectedLayer + 1
                        }
                    }
                });
            } : undefined,
            moveLayerDown: (0 <= selectedLayer - 1) ? () => {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/moveLayer',
                        payload: {
                            at: selectedLayer,
                            to: selectedLayer - 1
                        }
                    }
                });
            } : undefined,
            addLayer(layerName: string) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/addLayer',
                        payload: {
                            at: selectedLayer,
                            layer: createLayer2(layerName, { position: [0, 0], size: [width, height] })
                        }
                    }
                });
            },
            loadLayer(imageData: ImageData) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/loadLayer',
                        payload: {
                            at: selectedLayer,
                            imageData
                        }
                    }
                });
            },
            selectLayer(payload: number) {
                dispatch({
                    type: 'editor/selectLayer',
                    payload
                });
            },
            removeLayer(payload: number) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/removeLayer',
                        payload
                    }
                });
            },
            updateLayer(...[index, layer]:[number, Partial<LayerState2>]|[Partial<LayerState2>]) {
                layer = layer || index as Partial<LayerState2>;
                index = (typeof index == 'number')?index:selectedLayer;
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/updateLayer',
                        payload: {
                            at: index,
                            layer
                        }
                    }
                });
            },
            forceUpdate(drawing: {data?:Partial<DrawingState>, editor?:Partial<EditorDrawingState>}) {
                dispatch({
                    type: 'editor/forceUpdate',
                    payload: drawing
                });
            },
            workLayer(layer: LayerState2) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/workLayer',
                        payload: {
                            at: selectedLayer,
                            layer
                        }
                    }
                });
            },
        };
    }, [dispatch, drawing]);
    return [drawing, drawingActions] as const;
};
