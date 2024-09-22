import { useContext, useMemo } from 'react';
import { EditorContext } from '../contexts/DrawingState';
import { createLayer } from '../generators/createLayer';

export const useBrush = () => {
    const [editor, dispatch] = useContext(EditorContext);
    return [editor, useMemo(()=>({
        openFile(file:File){
        },
        newFile({ name, width, height }:{name:string, width:number, height:number}){
            dispatch({
                type: 'editor/load',
                payload: {
                    name,
                    drawing: {
                        width,
                        height,
                        layers: [
                            createLayer(
                                'layer 1',
                                {
                                    position: [0, 0],
                                    size: [width, height]
                                }
                            ),
                        ],
                        selectedLayer: 0
                    }
                }
            });
        },
    }), [])];
};

