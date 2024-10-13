import { useMemo } from 'react';
import '../css/QuickStart.css';
import { useEditor } from '../hooks/useEditor';
import { uid } from '../lib/uid';
import { useResentScribbles } from '../hooks/useResentScribbles';

export const QuickStart = () => {
    const [resentScribbles] = useResentScribbles();
    const [, { newFile, loadFile }] = useEditor();
    const id = useMemo(()=>uid(), []);
    const quickNewFile = () => {
        newFile({
            name: 'new Scribble',
            width: 1200,
            height: 800
        });
    };

    return (
        <div className="QuickStart">
            <div className='QuickStart-modal'>
                <h1>Quick Start</h1>
                <button onClick={quickNewFile}>Open blank scribble</button>
                <button onClick={quickNewFile}>Recover last session</button>
                {resentScribbles.map((resentScribble, i)=>
                    <button key={`${id}-${i}`} onClick={()=>loadFile(resentScribble)}>{resentScribble.name}</button>
                )}
            </div>
        </div>);
};
