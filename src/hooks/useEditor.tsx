import { useContext, useMemo } from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { EditorDrawingAction } from '../contexts/EditorDrawingContext';
import { StoredFile, useResentScribbles } from './useResentScribbles';
import { SDRW } from '../lib/sdrw';
import { loadImageAsDrawingState } from '../generators/loadImageAsDrawingState';
import { createLayer2 } from '../generators/createLayer2';

export const useEditor = () => {
    const [, { loadDrawingState, saveDrawingState }] = useResentScribbles();
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
            const extension = file.name.split('.').pop();
            switch (extension) {
            case 'jpeg':
            case 'jpg':
            case 'png':
                loadImageAsDrawingState(file)
                    .then(payload=>{
                        saveDrawingState(payload, payload.name);
                        dispatch({
                            type: 'editor/load',
                            payload
                        });
                    })
                    .catch(e=>console.error(e));
                break;
            case 'scribble':
                SDRW.jsonObj(file)
                    .then(payload=>{
                        saveDrawingState(payload, payload.name);
                        dispatch({
                            type: 'editor/load',
                            payload
                        });
                    })
                    .catch(e=>console.error(e));
                break;
            }
        },
        loadFile(fileRef:StoredFile){
            loadDrawingState(fileRef).then(payload=>{
                dispatch({
                    type: 'editor/load',
                    payload
                });
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
                        createLayer2(
                            'layer 1',
                            [width, height]
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
    }), [dispatch, loadDrawingState, saveDrawingState])] as const;
};

