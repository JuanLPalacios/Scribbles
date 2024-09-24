import { useContext, useMemo } from 'react';
import { createLayer } from '../generators/createLayer';
import { EditorContext } from '../contexts/EditorContext';

export const useEditor = () => {
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
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
    }), [])] as const;
};

