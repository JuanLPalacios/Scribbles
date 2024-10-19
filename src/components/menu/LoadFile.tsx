import { useCallback, useState } from 'react';
import '../../css/Menu.css';
import exportIcon from '../../icons/external-svgrepo-com.svg';
import { useEditor } from '../../hooks/useEditor';
import ReactModal from 'react-modal';
import { useOpenFile } from '../../hooks/useOpenFile';

export const LoadFile = () => {
    const [editor, { openFile }] = useEditor();
    const [isOpen, setOpen] = useState(false);
    const loadFile = useOpenFile((files)=>{
        if(files.length==0)return;
        const file = files[0];
        openFile(file);
    }, [openFile],
    { accept: '.jpg, .jpeg, .png, .scribble' }
    );
    const loadLocal = useCallback(async () => {
        if(!editor.drawing) return false;
        // saveto local
    }, [editor]);
    return <>
        <li>
            <button className='round-btn' onClick={()=>setOpen(true)}>
                <img src={exportIcon} alt="Export to PNG" />
            </button>
            <div className="text">Load Scribble</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={()=>setOpen(false)} style={{ content: { width: '20rem' } }}>
            <div className="fields import-brush">
                <h2>Load Scribble</h2>
                <div>
                </div>
                <div className='actions'>
                    <button onClick={loadFile}>Open File</button>
                    <button onClick={loadLocal}>Load Local Scribble</button>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

