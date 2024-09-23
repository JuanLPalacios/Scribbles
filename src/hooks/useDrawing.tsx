import { useContext, useMemo } from "react";
import { EditorContext } from "../contexts/EditorContext";
import { createLayer2 } from "../generators/createLayer2";
import { LayerState2 } from "../types/LayerState";


export const useDrawing = () => {
    const [editorState, dispatch] = useContext(EditorContext);
    const { drawing } = editorState;
    const drawingActions = useMemo(() => {
        if (!drawing) return;
        const { data, editor } = drawing;
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
            removeLayer(payload: number) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/removeLayer',
                        payload
                    }
                });
            },
            updateLayer(layer: Partial<LayerState2>) {
                dispatch({
                    type: 'editor/do',
                    payload: {
                        type: 'drawing/updateLayer',
                        payload: {
                            at: selectedLayer,
                            layer
                        }
                    }
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
    return (drawing && drawingActions) ? [drawing, drawingActions] as const : [undefined, undefined] as const;
};
