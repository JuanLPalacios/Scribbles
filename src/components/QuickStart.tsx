import { useMemo } from 'react';
import '../css/QuickStart.css';
import { useEditor } from '../hooks/useEditor';
import { uid } from '../lib/uid';
import { useLastSession, useResentScribbles } from '../hooks/useResentScribbles';
import { useConfig } from '../hooks/useConfig';

export const QuickStart = () => {
    const [resentScribbles] = useResentScribbles();
    const [lastSession] = useLastSession();

    const [{ autoSave }] = useConfig();
    const [, { newFile, loadFile, loadSession }] = useEditor();
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
                {(autoSave!==0)&&(lastSession)&&<button onClick={loadSession}>Recover last session</button>}
                {resentScribbles.slice(0, 5).map((resentScribble, i)=>
                    <button key={`${id}-${i}`} onClick={()=>loadFile(resentScribble)}>{resentScribble.name}</button>
                )}
            </div>
        </div>);
};
