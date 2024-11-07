import { useMemo, useState } from 'react';
import '../css/QuickStart.css';
import fileIcon from '../icons/file-add-svgrepo-com.svg';
import folderIcon from '../icons/folder-open-svgrepo-com.svg';
import syncIcon from '../icons/sync-svgrepo-com.svg';
import { useEditor } from '../hooks/useEditor';
import { uid } from '../lib/uid';
import { useLastSession, useResentScribbles } from '../hooks/useResentScribbles';
import { useConfig } from '../hooks/useConfig';
import { useOpenFile } from '../hooks/useOpenFile';

export const QuickStart = () => {
    const [resentScribbles] = useResentScribbles();
    const [lastSession] = useLastSession();

    const [{ autoSave }] = useConfig();
    const [, { newFile, loadFile, loadSession, openFile }] = useEditor();
    const id = useMemo(()=>uid(), []);
    const [install, setReadyToInstall] = useState();
    const quickNewFile = () => {
        newFile({
            name: 'new Scribble',
            width: 1200,
            height: 800
        });
    };
    const openFileL = useOpenFile((files)=>{
        if(files.length==0)return;
        const file = files[0];
        openFile(file);
    }, [openFile],
    { accept: '.jpg, .jpeg, .png, .scribble' }
    );
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
                        <h2>Quick Start</h2>
                        <button onClick={quickNewFile}><img src={fileIcon} alt="" />Open blank scribble</button>
                        <button onClick={openFileL}><img src={folderIcon} alt="" />Open File</button>
                        {(autoSave!==0)&&(lastSession)&&<button onClick={loadSession}><img src={syncIcon} alt="" />Recover last session</button>}
                    </div>
                    <div>
                        <h2>Recent Files</h2>
                        {resentScribbles.slice(0, 5).map((resentScribble, i)=>
                            <button key={`${id}-${i}`} onClick={()=>loadFile(resentScribble)}>{resentScribble.name}</button>
                        )}
                    </div>

                </div>
                <div>
                    <h2>More Resources</h2>
                    {(!isInstalledPWA)&&install&&<button onClick={install}><b>Install App</b></button>}
                    <a href="https://github.com/JuanLPalacios/Scribbles/wiki">User Manual</a>
                    <a href="https://github.com/JuanLPalacios/Scribbles/wiki/Community-Resources#community-brushes">Community Brushes</a>
                </div>
            </div>
        </div>);
};
