import { useContext, useMemo } from 'react';
import { EditorContext } from '../contexts/EditorContext';
import { EditorDrawingAction } from '../contexts/EditorDrawingContext';
import { StoredFile, useResentScribbles } from './useResentScribbles';
import { SDRW } from '../lib/sdrw';
import { loadImageAsDrawingState } from '../generators/loadImageAsDrawingState';
import { createLayer2 } from '../generators/createLayer2';
import { useLoadingOverlay } from './useLoadingOverlay';
import { LoadingState } from '../types/LoadingState';

export const useEditor = () => {
    const [, setLoadingState] = useLoadingOverlay();
    const [, { loadDrawingState, saveDrawingState, loadLastSession }] = useResentScribbles();
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
            setLoadingState(LoadingState.Loading);
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
                    .catch(e=>console.error(e))
                    .finally(()=>setLoadingState(LoadingState.None));
                break;
            case 'zip':
            case 'scribble':
                SDRW.jsonObj(file)
                    .then(payload=>{
                        saveDrawingState(payload, payload.name);
                        dispatch({
                            type: 'editor/load',
                            payload
                        });
                    })
                    .catch(e=>console.error(e))
                    .finally(()=>setLoadingState(LoadingState.None));
                break;
            }
        },
        loadFile(fileRef:StoredFile){
            setLoadingState(LoadingState.Loading);
            loadDrawingState(fileRef)
                .then(payload=>{
                    dispatch({
                        type: 'editor/load',
                        payload
                    });
                })
                .finally(()=>setLoadingState(LoadingState.None));
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
        loadSession(){
            setLoadingState(LoadingState.Loading);
            loadLastSession()
                .then(payload=>{
                    if(payload)dispatch({
                        type: 'editor/load',
                        payload
                    });
                })
                .finally(()=>setLoadingState(LoadingState.None));
        },
    }), [dispatch, loadDrawingState, loadLastSession, saveDrawingState, setLoadingState])] as const;
};

