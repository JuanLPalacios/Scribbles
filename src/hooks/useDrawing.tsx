import { useMemo } from 'react';
import { createLayer2 } from '../generators/createLayer2';
import { LayerState2 } from '../types/LayerState';
import { DrawingState } from '../contexts/DrawingContext';
import { useEditor } from './useEditor';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';
import { getBlobFromLayer, mergeLayers } from '../lib/Graphics';
import { saveAs } from 'file-saver';
import { SDRW } from '../lib/sdrw';
import { useResentScribbles } from './useResentScribbles';

export const useDrawing = () => {
    const [, { saveDrawingState }] = useResentScribbles();
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
                            layer: createLayer2(layerName, [width, height])
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
            setTransform(payload: DOMMatrix) {
                editDrawing({
                    type: 'editor-drawing/transform',
                    payload
                });
            },
            rename(name: string) {
                editDrawing({
                    type: 'editor-drawing/rename',
                    payload: name
                });
            },
            async downloadFile(){
                const { data: { name } } = drawing;
                saveDrawingState(data, name);
                const blob = await SDRW.binary(data);
                saveAs(blob, `${name}.scribble`);
            },
            exportPNG(){
                const { data: { layers, width, height, name } } = drawing;
                saveDrawingState(data, name);
                let merged = createLayer2('', [width, height]);
                layers.forEach((layer) => {
                    merged = mergeLayers(layer, merged);
                });
                getBlobFromLayer(
                    merged,
                    blob=>{
                        if(blob)
                            saveAs(blob, (name.endsWith('.png')||name.endsWith('.PNG'))?name:`${name}.png`);
                    });
            },
            localSave(){
                const { data: { name } } = drawing;
                saveDrawingState(data, name);
            },
        };
    }, [drawing, editDrawing, saveDrawingState]);
    return [drawing, drawingActions] as const;
};
