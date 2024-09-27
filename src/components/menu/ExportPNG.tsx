import { useCallback } from 'react';
import '../../css/Menu.css';
import exportIcon from '../../icons/external-svgrepo-com.svg';
import { createLayer } from '../../generators/createLayer';
import { mergeLayers } from '../../lib/Graphics';
import { useEditor } from '../../hooks/useEditor';

export const ExportPNG = () => {
    const [editor] = useEditor();
    const exportPng = useCallback(() => {
        if(!editor.drawing) return false;
        const { data: { layers, width, height, name } } = editor.drawing;
        const mergged = createLayer('', { position: [0, 0], size: [width, height] });
        layers.forEach((layer) => mergeLayers(layer, mergged));
        const url = mergged.canvas.canvas.toDataURL();
        const a = document.createElement('a');
        a.download = name+'.png';
        a.href = url;
        a.click();
    }, [editor]);
    return <>
        <li>
            <button className='round-btn' onClick={exportPng}>
                <img src={exportIcon} alt="Export to PNG" />
            </button>
            <div className="text">Export to PNG</div>
        </li>
    </>;
};

