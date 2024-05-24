import '../css/QuickStart.css';
import { useContext } from 'react';
import { createLayer } from '../generators/createLayer';
import { EditorContext } from '../contexts/DrawingState';

export const QuickStart = () => {
    const [, editorDispatch] = useContext(EditorContext);
    const newFile = () => {
        editorDispatch({
            type: 'editor/load',
            payload: {
                name: 'new Scribble',
                drawing: {
                    width: 600,
                    height: 600,
                    layers: [
                        createLayer(
                            'Image',
                            {
                                position: [0, 0],
                                size: [600, 600]
                            }
                        ),
                    ],
                    selectedLayer: 0
                }
            }
        });
    };

    return <div className='QuickStart'>
        <h1>Quick Start</h1>
        <button onClick={newFile}>open New Scribble</button>
    </div>;
};
