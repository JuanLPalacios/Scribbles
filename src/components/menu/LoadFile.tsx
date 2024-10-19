import { useEffect, useMemo, useState } from 'react';
import '../../css/Menu.css';
import '../../css/menu/LoadFile.css';
import exportIcon from '../../icons/external-svgrepo-com.svg';
import { useEditor } from '../../hooks/useEditor';
import ReactModal from 'react-modal';
import { useOpenFile } from '../../hooks/useOpenFile';
import { useResentScribbles } from '../../hooks/useResentScribbles';
import { uid } from '../../lib/uid';

export const LoadFile = () => {
    const [editor, { openFile, loadFile }] = useEditor();
    const [isOpen, setOpen] = useState(false);
    const [resentScribbles] = useResentScribbles();
    const id = useMemo(()=>uid(), []);
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
    return <>
        <li>
            <button className='round-btn' onClick={()=>setOpen(true)}>
                <img src={exportIcon} alt="Export to PNG" />
            </button>
            <div className="text">Load Scribble</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={()=>setOpen(false)} style={{ content: { width: '20rem' } }}>
            <div className="LoadFile fields import-brush">
                <h2>Load Scribble</h2>
                <div className='table'>
                    {resentScribbles.map((resentScribble, i)=><>
                        <div key={`${id}-name-${i}`}>{resentScribble.name}</div>
                        <button key={`${id}-button-${i}`} onClick={()=>loadFile(resentScribble)}>Load</button>

                    </>
                    )}
                </div>
                <div className='actions'>
                    <button onClick={openFileL}>Open File</button>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

