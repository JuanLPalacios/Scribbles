import { useMemo } from 'react';
import { createLayer2 } from '../generators/createLayer2';
import { LayerState2 } from '../types/LayerState';
import { DrawingState } from '../contexts/DrawingContext';
import { useEditor } from './useEditor';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';

export const useDrawing = () => {
    const [editorState, { editDrawing }] = useEditor();
    const { drawing } = editorState;
    if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
    const drawingActions = useMemo(() => {
        if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
        const { data, editorState: editor } = drawing;
        const { selectedLayer, next, prev } = editor;
        const { width, height, layers } = data;
        return {
            undo: (prev.length > 0) ? () => { editDrawing({ type: 'editor-drawing/undo' }); } : undefined,
            redo: (next.length > 0) ? () => { editDrawing({ type: 'editor-drawing/redo' }); } : undefined,
            moveLayerUp: (layers.length > selectedLayer + 1) ? () => {
                editDrawing({
                    type: 'editor-drawing/do',
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
                editDrawing({
                    type: 'editor-drawing/do',
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
                editDrawing({
                    type: 'editor-drawing/do',
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
                editDrawing({
                    type: 'editor-drawing/do',
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
                editDrawing({
                    type: 'editor-drawing/selectLayer',
                    payload
                });
            },
            removeLayer(payload: number) {
                editDrawing({
                    type: 'editor-drawing/do',
                    payload: {
                        type: 'drawing/removeLayer',
                        payload
                    }
                });
            },
            updateLayer(...[index, layer]:[number, Partial<LayerState2>]|[Partial<LayerState2>]) {
                layer = layer || index as Partial<LayerState2>;
                index = (typeof index == 'number')?index:selectedLayer;
                editDrawing({
                    type: 'editor-drawing/do',
                    payload: {
                        type: 'drawing/updateLayer',
                        payload: {
                            at: index,
                            layer
                        }
                    }
                });
            },
            forceUpdate({ data, editorState }: {data?:Partial<DrawingState>, editorState?:Partial<EditorDrawingState['editorState']>}) {
                editDrawing({
                    type: 'editor-drawing/forceUpdate',
                    payload: {
                        data: { ...drawing.data, ...data },
                        editorState: { ...drawing.editorState, ...editorState }
                    }
                });
            },
            workLayer(layer: LayerState2) {
                editDrawing({
                    type: 'editor-drawing/do',
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
    }, [editDrawing, drawing]);
    return [drawing, drawingActions] as const;
};
