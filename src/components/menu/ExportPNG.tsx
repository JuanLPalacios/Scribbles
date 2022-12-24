import { useCallback, useContext } from 'react';
import '../../css/Menu.css';
import exportIcon from '../..//icons/external-svgrepo-com.svg';
import { createLayer } from '../../hooks/createLayer';
import { DrawingContext } from '../../contexts/DrawingState';
import { mergeLayers } from '../../lib/Graphics';

export const ExportPNG = () => {
    const [drawing] = useContext(DrawingContext);
    const exportPng = useCallback(() => {
        if(!drawing) return false;
        const { layers, width, height, name } = drawing;
        const mergged = createLayer('', { position: [0, 0], size: [width, height] });
        layers.forEach((layer) => mergeLayers(layer, mergged));
        const url = mergged.canvas.canvas.toDataURL();
        const a = document.createElement('a');
        a.download = name+'.png';
        a.href = url;
        a.click();
    }, [drawing]);
    return <>
        <li><button className='round-btn' onClick={exportPng}>
            <img src={exportIcon} alt="Export to PNG" />
        </button></li>
    </>;
};

