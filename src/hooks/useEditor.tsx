import { useContext, useMemo } from 'react';
import { createLayer } from '../generators/createLayer';
import { EditorContext } from '../contexts/EditorContext';
import { EditorDrawingAction } from '../contexts/EditorDrawingContext';
import { StoredFile, useResentScribbles } from './useResentScribbles';
import { uid } from '../lib/uid';

export const useEditor = () => {
    const [, { addFile }] = useResentScribbles();
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
            const fileRef = { key: uid(), name: file.name, path: 'file:'+file.name };
            const { name } = fileRef;
            const [width, height] = [1200, 800];
            addFile(fileRef);
            dispatch({
                type: 'editor/load',
                payload: {
                    name,
                    width,
                    height,
                    layers: [
                        createLayer(
                            'layer 1',
                            {
                                position: [0, 0],
                                size: [width, height]
                            }
                        )
                    ]
                }
            });
        },
        loadFile(fileRef:StoredFile){
            const { path, name } = fileRef;
            const [width, height] = [1200, 800];
            addFile(fileRef);
            dispatch({
                type: 'editor/load',
                payload: JSON.parse(localStorage.getItem(path)||'')||{
                    name,
                    width,
                    height,
                    layers: [
                        createLayer(
                            'layer 1',
                            {
                                position: [0, 0],
                                size: [width, height]
                            }
                        )
                    ]
                }
            });
        },
        newFile({ name, width, height }:{name:string, width:number, height:number}){
            dispatch({
                type: 'editor/load',
                payload: {
                    name,
                    width,
                    height,
                    layers: [
                        createLayer(
                            'layer 1',
                            {
                                position: [0, 0],
                                size: [width, height]
                            }
                        )
                    ]
                }
            });
        },
        editDrawing(payload:EditorDrawingAction){
            dispatch({
                type: 'editor/edit',
                payload
            });
        },
    }), [addFile, dispatch])] as const;
};

