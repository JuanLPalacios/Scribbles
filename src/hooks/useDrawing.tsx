import { useMemo } from 'react';
import { createLayer2 } from '../generators/createLayer2';
import { LayerState2 } from '../types/LayerState';
import { DrawingState } from '../contexts/DrawingContext';
import { useEditor } from './useEditor';
import { EditorDrawingState } from '../contexts/EditorDrawingContext';
import { getBlobFromLayer, mergeLayers, renderDrawingThumbnail } from '../lib/Graphics';
import { saveAs } from 'file-saver';
import { SDRW } from '../lib/sdrw';
import { useResentScribbles } from './useResentScribbles';
import { LoadingState } from '../types/LoadingState';
import { useLoadingOverlay } from './useLoadingOverlay';
import { useGoogleDrive } from './useGoogleDrive';
import { uploadFileToDrive } from '../lib/GoogleDriveApi';

export const useDrawing = () => {
    const [, setLoadingState] = useLoadingOverlay();
    const [, { saveDrawingState }] = useResentScribbles();
    const [editorState, { editDrawing }] = useEditor();
    const { isConnected, config } = useGoogleDrive();
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
                const { data: { name }, editorState: { layers: editorLayers, thumbnail } } = drawing;

                // Generate thumbnail
                let thumbnailDataURL: string | undefined;
                if(editorLayers && editorLayers.length > 0 && thumbnail){
                    try {
                        const items = drawing.data.layers.map((layer, i) => ({ layer, editorLayer: editorLayers[i] }));
                        renderDrawingThumbnail(items, thumbnail);
                        thumbnailDataURL = thumbnail.canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn('Failed to generate thumbnail:', e);
                    }
                }

                saveDrawingState(drawing, name);
                const blob = await SDRW.binary(drawing.data, thumbnailDataURL);
                saveAs(blob, `${name}.scribble`);
                setLoadingState(LoadingState.None);
            },
            exportPNG(){
                setLoadingState(LoadingState.Saving);
                const { data: { layers, width, height, name } } = drawing;
                saveDrawingState(drawing, name);
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
                return saveDrawingState(drawing, name)
                    .catch(e=>console.error(e))
                    .finally(()=>setLoadingState(LoadingState.None));
            },
            async saveToGoogleDrive(){
                if (!isConnected || !config?.accessToken) {
                    throw new Error('Not connected to Google Drive');
                }

                setLoadingState(LoadingState.Saving);
                try {
                    const { data: { name }, editorState: { layers: editorLayers, thumbnail } } = drawing;

                    // Generate thumbnail
                    let thumbnailDataURL: string | undefined;
                    if(editorLayers && editorLayers.length > 0 && thumbnail){
                        try {
                            const items = drawing.data.layers.map((layer, i) => ({ layer, editorLayer: editorLayers[i] }));
                            renderDrawingThumbnail(items, thumbnail);
                            thumbnailDataURL = thumbnail.canvas.toDataURL('image/png');
                        } catch (e) {
                            console.warn('Failed to generate thumbnail:', e);
                        }
                    }

                    // Save locally too
                    saveDrawingState(drawing, name);
                    
                    // Generate blob
                    const blob = await SDRW.binary(drawing.data, thumbnailDataURL);
                    
                    // Upload to Google Drive
                    const fileName = name.endsWith('.scribble') ? name : `${name}.scribble`;
                    await uploadFileToDrive(fileName, blob, config.accessToken);
                } catch (error) {
                    console.error('Failed to save to Google Drive:', error);
                    throw error;
                } finally {
                    setLoadingState(LoadingState.None);
                }
            },
        };
    }, [drawing, editDrawing, saveDrawingState, setLoadingState, isConnected, config?.accessToken]);
    return [drawing, drawingActions] as const;
};
