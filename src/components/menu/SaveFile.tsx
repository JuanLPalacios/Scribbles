import { useCallback, useEffect, useState } from 'react';
import '../../css/Menu.css';
import saveIcon from '../../icons/save-svgrepo-com.svg';
import ReactModal from 'react-modal';
import { useDrawing } from '../../hooks/useDrawing';
import { DrawingRequired } from '../../hoc/DrawingRequired';
import { useShortcut } from '../../hooks/useShortcut';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';

export const SaveFile = DrawingRequired(() => {
    const [drawing, { exportPNG, downloadFile, localSave, saveToGoogleDrive }] = useDrawing();
    const { isConnected } = useGoogleDrive();
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [extension, setExtension] = useState('png');
    const [isSavingToDrive, setIsSavingToDrive] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
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
    const handleSaveToGoogleDrive = useCallback(async () => {
        setSaveError(null);
        setIsSavingToDrive(true);
        try {
            await saveToGoogleDrive();
            close();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setSaveError(errorMsg);
            console.error('Save to Google Drive error:', error);
        } finally {
            setIsSavingToDrive(false);
        }
    }, [saveToGoogleDrive, close]);
    useEffect(()=>{
        if(drawing) setName(drawing.data.name.split('.')[0]);
    }, [drawing]);
    useShortcut(downloadFile, ['CTRL+ALT+S', 'SHIFT+ALT+S']);
    useShortcut(localSave, ['CTRL+S', 'SHIFT+S']);
    useShortcut(exportPNG, ['CTRL+E', 'SHIFT+E']);
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
                {saveError && (
                    <div style={{ padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#ffe0e0', color: '#d32f2f', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {saveError}
                    </div>
                )}
                <div className='actions'>
                    <button onClick={()=>localSave().then(close)}>save locally</button>
                    {isConnected && (
                        <button onClick={handleSaveToGoogleDrive} disabled={isSavingToDrive}>
                            {isSavingToDrive ? 'saving...' : 'save to drive'}
                        </button>
                    )}
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
});

