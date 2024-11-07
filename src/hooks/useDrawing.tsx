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
import { LoadingState } from '../types/LoadingState';
import { useLoadingOverlay } from './useLoadingOverlay';

export const useDrawing = () => {
    const [, setLoadingState] = useLoadingOverlay();
    const [, { saveDrawingState }] = useResentScribbles();
    const [editorState, { editDrawing }] = useEditor();
    const { drawing } = editorState;
    if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
    const drawingActions = useMemo(() => {
        if (!drawing) throw new Error('useDrawing should only be used inside components or hook where a drawing presence is guaranteed');
        const { data, editorState: editor } = drawing;
        const { selectedLayer, next, prev } = editor;
        const { width, height, layers } = data;
        function uniqueLayerName(name:string) {
            if(!layers.find(x=>x.name==name))return name;
            let num = 2;
            while (layers.find(x=>x.name==name+` (${num})`)) {
                num++;
            }
            return name+` (${num})`;
        }
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
            mergeDownLayer: (0 <= selectedLayer - 1) ? () => {
                editDrawing({
                    type: 'editor-drawing/do',
                    payload: {
                        type: 'drawing/mergeDownLayer',
                        payload: selectedLayer
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
                            layer: createLayer2(uniqueLayerName(layerName), [width, height])
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
                if(layer.name!==undefined)layer.name = uniqueLayerName(layer.name);
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
                setLoadingState(LoadingState.Saving);
                const { data: { name } } = drawing;
                saveDrawingState(data, name);
                const blob = await SDRW.binary(data);
                saveAs(blob, `${name}.scribble`);
                setLoadingState(LoadingState.None);
            },
            exportPNG(){
                setLoadingState(LoadingState.Saving);
                const { data: { layers, width, height, name } } = drawing;
                saveDrawingState(data, name);
                let merged = createLayer2('', [width, height]);
                layers.forEach((layer) => {
                    merged = mergeLayers(layer, merged);
                });
                getBlobFromLayer(
                    merged,
                    blob=>{
                        setLoadingState(LoadingState.None);
                        if(blob)
                            saveAs(blob, (name.endsWith('.png')||name.endsWith('.PNG'))?name:`${name}.png`);
                    });
            },
            localSave(){
                setLoadingState(LoadingState.Saving);
                const { data: { name } } = drawing;
                return saveDrawingState(data, name)
                    .catch(e=>console.error(e))
                    .finally(()=>setLoadingState(LoadingState.None));
            },
        };
    }, [drawing, editDrawing, saveDrawingState, setLoadingState]);
    return [drawing, drawingActions] as const;
};
