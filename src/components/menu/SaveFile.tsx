import { useCallback, useEffect, useState } from 'react';
import '../../css/Menu.css';
import exportIcon from '../../icons/external-svgrepo-com.svg';
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
    useEffect(()=>{
        if(drawing) setName(drawing.data.name.split('.')[0]);
    }, [drawing]);
    return <>
        <li>
            <button className='round-btn' onClick={()=>setOpen(true)}>
                <img src={exportIcon} alt="Export to PNG" />
            </button>
            <div className="text">Export to PNG</div>
        </li>
        <ReactModal isOpen={isOpen} onRequestClose={()=>setOpen(false)} style={{ content: { width: '20rem' } }}>
            <div className="fields import-brush">
                <h2>Save Scribble</h2>
                <div>
                    <input type="text" name="name" title="name" value={name} onChange={e=>setName(e.target.value)}/>
                    <select name="extension" title="extension" value={extension} onChange={e=>setExtension(e.target.value)}>
                        <option value="scribble">.scribble</option>
                        <option value="png">.png</option>
                    </select>
                </div>
                <div className='actions'>
                    <button onClick={download}>download</button>
                    <button onClick={localSave}>save locally</button>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
});

