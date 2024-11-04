import { useCallback, useEffect, useState } from 'react';
import '../../css/Menu.css';
import saveIcon from '../../icons/save-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { useDrawing } from '../../hooks/useDrawing';
import { DrawingRequired } from '../../hoc/DrawingRequired';

export const SaveFile = DrawingRequired(() => {
    const [drawing, { exportPNG, downloadFile, localSave }] = useDrawing();
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [extension, setExtension] = useState('png');
    const download = useCallback(async () => {
        switch (extension) {
        case 'png':
            exportPNG();
            break;
        case 'scribble':
            downloadFile();
            break;
        }
    }, [downloadFile, exportPNG, extension]);
    const close = useCallback(()=>setOpen(false), []);
    useEffect(()=>{
        if(drawing) setName(drawing.data.name.split('.')[0]);
    }, [drawing]);
    return <>
        <li>
            <button className='round-btn' onClick={()=>setOpen(true)}>
                <img src={saveIcon} alt="Save/Export" />
            </button>
            <div className="text">Save/Export</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={close} style={{ content: { width: '350px' } }}>
            <div className="fields import-brush">
                <h2>Save Scribble</h2>
                <div>
                    <input type="text" name="name" title="name" value={name} onChange={e=>setName(e.target.value)}/>
                    <select name="extension" title="extension" value={extension} onChange={e=>setExtension(e.target.value)}>
                        <option value="scribble">.scribble</option>
                        <option value="png">.png</option>
                    </select>
                    <button onClick={download}>download</button>
                </div>
                <div className='actions'>
                    <button onClick={()=>localSave().then(close)}>save locally</button>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
});

