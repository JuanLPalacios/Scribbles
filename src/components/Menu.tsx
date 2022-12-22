import { useCallback, useContext } from 'react';
import '../css/Menu.css';
import fileIcon from '../icons/file-svgrepo-com.svg';
import addFileIcon from '../icons/file-add-svgrepo-com.svg';
import exportIcon from '../icons/external-svgrepo-com.svg';
import optionsIcon from '../icons/options-svgrepo-com.svg';
import { createLayer } from '../hooks/createLayer';
import { mergeLayers } from '../lib/Graphics';
import { MenuOptions } from '../contexts/MenuOptions';
import { DrawingContext } from '../contexts/DrawingState';

interface MenuProps {
    options:MenuOptions,
    onChange:(options:MenuOptions)=>void
}

function Menu({ onChange }:MenuProps) {
    const [drawing, setDrawing] = useContext(DrawingContext);
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
    const newfile = useCallback(() => {
        const prevName = 'Drawing',
            prevWidth = 600,
            prevHeight = 600;
        if(setDrawing)setDrawing({
            name: prevName,
            width: prevWidth,
            height: prevHeight,
            layers: [
                createLayer(
                    'Image',
                    {
                        position: [0, 0],
                        size: [prevWidth, prevHeight]
                    }
                ),
            ],
            selectedLayer: 0
        });
    }, []);
    const changeProps = useCallback(() => {
        throw new Error('Function not implemented.');
    }, []);
    return (
        <ul className="Menu">
            <li className='dropdown'>
                <button>
                    <img src={fileIcon} alt="File" />
                </button>
                <ul>
                    <li><button onClick={newfile}>
                        <img src={addFileIcon} alt="New scribble" />
                    </button></li>
                    <li><button onClick={exportPng}>
                        <img src={exportIcon} alt="Export to PNG" />
                    </button></li>
                    <li><button onClick={changeProps}>
                        <img src={optionsIcon} alt="Properties" />
                    </button></li>
                </ul>
            </li>
        </ul>
    );
}

export default Menu;

