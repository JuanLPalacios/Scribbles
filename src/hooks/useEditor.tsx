import { useContext, useMemo } from 'react';
import { createLayer } from '../generators/createLayer';
import { EditorContext } from '../contexts/EditorContext';
import { EditorDrawingAction } from '../contexts/EditorDrawingContext';
import { StoredFile, useResentScribbles } from './useResentScribbles';
import { uid } from '../lib/uid';
import { SDRW } from '../lib/sdrw';
import { DrawingState } from '../contexts/DrawingContext';

export const useEditor = () => {
    const [, { addFile }] = useResentScribbles();
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
            const fileRef = { key: uid(), name: file.name, path: 'file:'+file.name };
            const { name } = fileRef;
            addFile(fileRef);
            const extension = file.name.split('.').pop();
            switch (extension) {
            case 'jpeg':
            case 'jpg':
            case 'png':
                loadImageAsDrawingState(file)
                    .then(payload=>{
                        dispatch({
                            type: 'editor/load',
                            payload
                        });
                    })
                    .catch(e=>console.error(e));
                break;
            case 'scribble':
                SDRW.jsonObj(file)
                    .then(drawingData=>{
                        dispatch({
                            type: 'editor/load',
                            payload: { ...drawingData, name }
                        });
                    })
                    .catch(e=>console.error(e));
                break;
            }
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
        downloadFile(){
            // TODO: refactor download be here
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

async function loadImageAsDrawingState(file: File):Promise<DrawingState> {
    throw new Error('Function not implemented.');
}

