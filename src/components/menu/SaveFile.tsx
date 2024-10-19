import { useCallback, useEffect, useState } from 'react';
import '../../css/Menu.css';
import exportIcon from '../../icons/external-svgrepo-com.svg';
import { createLayer } from '../../generators/createLayer';
import { mergeLayers } from '../../lib/Graphics';
import { useEditor } from '../../hooks/useEditor';
import { SDRW } from '../../lib/sdrw';
import { saveAs } from 'file-saver';
import ReactModal from 'react-modal';

export const SaveFile = () => {
    const [editor] = useEditor();
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [extension, setExtension] = useState('png');
    const exportPng = useCallback(async () => {
        if(!editor.drawing) return false;
        const { data: { layers, width, height, name } } = editor.drawing;
        const merged = createLayer('', { position: [0, 0], size: [width, height] });
        layers.forEach((layer) => mergeLayers(layer, merged));
        const url = merged.canvas.canvas.toDataURL();
        const a = document.createElement('a');
        a.download = name+'.png';
        a.href = url;
        a.click();
    }, [editor]);
    const exportScribble = useCallback(async () => {
        if(!editor.drawing) return false;
        const { data: { name } } = editor.drawing;
        const blob = await SDRW.binary(editor.drawing.data);
        saveAs(blob, `${name}.scribble`);
    }, [editor]);
    const downloadFile = useCallback(async () => {
        switch (extension) {
        case 'png':
            exportPng();
            break;
        case 'scribble':
            exportScribble();
            break;
        }
        // saveto local
    }, [exportPng, exportScribble, extension]);
    const saveFile = useCallback(async () => {
        if(!editor.drawing) return false;
        // saveto local
    }, [editor]);
    useEffect(()=>{
        if(editor.drawing) setName(editor.drawing.data.name);
    }, [editor.drawing]);
    return <>
        <li>
            <button className='round-btn' onClick={()=>setOpen(true)} disabled={!editor.drawing}>
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
                    <button onClick={downloadFile}>download</button>
                    <button onClick={saveFile}>save locally</button>
                    <button onClick={()=>setOpen(false)}>cancel</button>
                </div>
            </div>
        </ReactModal>
    </>;
};

