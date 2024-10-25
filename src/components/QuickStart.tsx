import { useMemo, useState } from 'react';
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
    const [install, setReadyToInstall] = useState();
    const quickNewFile = () => {
        newFile({
            name: 'new Scribble',
            width: 1200,
            height: 800
        });
    };
    const isInstalledPWA = window.matchMedia('(display-mode: window-controls-overlay)').matches || window.matchMedia('(display-mode: standalone)').matches;

    if(!isInstalledPWA){
        window.addEventListener('beforeinstallprompt', (e:Event) => {
            e.preventDefault();
            setReadyToInstall(()=> { if(('prompt' in e)&&(typeof e.prompt == 'function'))e.prompt(); });
        });
    }

    return (
        <div className="QuickStart">
            <div className='QuickStart-modal'>
                <div>
                    <div>
                        <h1>Quick Start</h1>
                        <button onClick={quickNewFile}>Open blank scribble</button>
                        loadFile
                        {(autoSave!==0)&&(lastSession)&&<button onClick={loadSession}>Recover last session</button>}
                    </div>
                    <div>
                        <h1>Recent Files</h1>
                        {resentScribbles.slice(0, 5).map((resentScribble, i)=>
                            <button key={`${id}-${i}`} onClick={()=>loadFile(resentScribble)}>{resentScribble.name}</button>
                        )}
                    </div>

                </div>
                <div>
                    <h1>More Resources</h1>
                    {
                    //(!isInstalledPWA)&&install&&
                        <button onClick={install}>Install App</button>
                    }
                    <a href="http://">User Manual</a>
                </div>
            </div>
        </div>);
};
