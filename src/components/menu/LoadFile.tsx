import { useCallback, useEffect, useState } from 'react';
import '../../css/Menu.css';
import '../../css/menu/LoadFile.css';
import '../../css/components/FileList.css';
import folderIcon from '../../icons/folder-open-svgrepo-com.svg';
import listIcon from '../../icons/layout-list-svgrepo-com.svg';
import gridIcon from '../../icons/layout-grid-svgrepo-com.svg';
import { useEditor } from '../../hooks/useEditor';
import ReactModal from 'react-modal';
import { useOpenFile } from '../../hooks/useOpenFile';
import { createStorageHook } from '../../generators/createStorageHook';
import { useResentScribbles } from '../../hooks/useResentScribbles';
import { useShortcut } from '../../hooks/useShortcut';
import { FileList } from '../FileList';

// Persistent view preference for Load modal (list vs thumbnails)
const useLoadView = createStorageHook<{ mode: 'list'|'thumbs' }>('load-view', 'local', { mode: 'list' });

export const LoadFile = () => {
    const [editor, { openFile, loadFile }] = useEditor();
    const [isOpen, setOpen] = useState(false);
    const [resentScribbles] = useResentScribbles();
    const [loadView, setLoadView] = useLoadView();
    const openModal = useCallback(()=>setOpen(true), []);
    const openFileL = useOpenFile((files)=>{
        if(files.length==0)return;
        const file = files[0];
        openFile(file);
    }, [openFile],
    { accept: '.jpg, .jpeg, .png, .scribble' }
    );
    useEffect(()=>{
        setOpen(false);
    }, [editor.drawing]);
    useShortcut(openModal, ['CTRL+L', 'SHIFT+L']);
    useShortcut(openFileL, ['CTRL+O', 'SHIFT+O']);
    return <>
        <li>
            <button className='round-btn' onClick={openModal}>
                <img src={folderIcon} alt="Export to PNG" />
            </button>
            <div className="text">Load Scribble</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={()=>setOpen(false)} style={{ content: { width: '20rem' } }}>
            <div className="LoadFile fields import-brush">
                <h2>Load Scribble</h2>
                <div className='actions right'>
                    <button onClick={openFileL}>Open File</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                    <h4>Local saves</h4>
                    <div className="FileList-viewToggle" style={{ display: 'flex', gap: 8 }}>
                        <button onClick={()=>setLoadView({ mode: 'list' })} disabled={loadView.mode==='list'} title="List view"><img src={listIcon} alt="List view" /></button>
                        <button onClick={()=>setLoadView({ mode: 'thumbs' })} disabled={loadView.mode==='thumbs'} title="Thumbnails view"><img src={gridIcon} alt="Thumbnails view" /></button>
                    </div>
                </div>
                <FileList
                    files={resentScribbles}
                    mode={loadView.mode}
                    onFileClick={loadFile}
                    variant="modal"
                />
                <div className='actions'>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

