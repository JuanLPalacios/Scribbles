import { useState, useEffect } from 'react';
import '../css/QuickStart.css';
import '../css/components/FileList.css';
import fileIcon from '../icons/file-add-svgrepo-com.svg';
import folderIcon from '../icons/folder-open-svgrepo-com.svg';
import syncIcon from '../icons/sync-svgrepo-com.svg';
import listIcon from '../icons/layout-list-svgrepo-com.svg';
import gridIcon from '../icons/layout-grid-svgrepo-com.svg';
import { useEditor } from '../hooks/useEditor';
import { useLastSession, useResentScribbles } from '../hooks/useResentScribbles';
import { useConfig } from '../hooks/useConfig';
import { useOpenFile } from '../hooks/useOpenFile';
import { createStorageHook } from '../generators/createStorageHook';
import { FileList } from './FileList';

type PromptEvent = Event & { prompt?: () => void };

// Persistent view preference for QuickStart (list vs thumbnails)
const useQuickStartView = createStorageHook<{ mode: 'list'|'thumbs' }>('quickstart-view', 'local', { mode: 'list' });

export const QuickStart = () => {
    const [resentScribbles] = useResentScribbles();
    const [lastSession] = useLastSession();
    const [quickStartView, setQuickStartView] = useQuickStartView();

    const [{ autoSave }] = useConfig();
    const [, { newFile, loadFile, loadSession, openFile }] = useEditor();
    const [install, setReadyToInstall] = useState<(() => void) | undefined>();
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

    useEffect(() => {
        if(!isInstalledPWA){
            const handler = (e: Event) => {
                e.preventDefault();
                setReadyToInstall(()=> () => {
                    const promptEvent = e as PromptEvent;
                    if(typeof promptEvent.prompt === 'function') {
                        promptEvent.prompt();
                    }
                });
            };
            window.addEventListener('beforeinstallprompt', handler);
            return () => {
                window.removeEventListener('beforeinstallprompt', handler);
            };
        }
    }, [isInstalledPWA]);

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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                            <h2>Recent Files</h2>
                            <div className="FileList-viewToggle" style={{ display: 'flex', gap: 8 }}>
                                <button onClick={()=>setQuickStartView({ mode: 'list' })} disabled={quickStartView.mode==='list'} title="List view"><img src={listIcon} alt="List view" /></button>
                                <button onClick={()=>setQuickStartView({ mode: 'thumbs' })} disabled={quickStartView.mode==='thumbs'} title="Thumbnails view"><img src={gridIcon} alt="Thumbnails view" /></button>
                            </div>
                        </div>
                        <FileList
                            files={resentScribbles}
                            mode={quickStartView.mode}
                            onFileClick={loadFile}
                            limit={quickStartView.mode === 'list' ? 5 : 12}
                            variant="quickstart"
                        />
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
