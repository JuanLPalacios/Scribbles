import { useCallback } from 'react';
import '../css/Menu.css';
import { createLayer } from '../hooks/createLayer';
import { mergeLayers } from '../lib/Graphics';
import { MenuOptions } from '../types/MenuOptions';

interface MenuProps {
    options:MenuOptions,
    onChange:(options:MenuOptions)=>void
}

function Menu({ options, onChange }:MenuProps) {
    const exportPng = useCallback(() => {
        if(!options.drawing) return false;
        const { layers, width, height, name } = options.drawing;
        const mergged = createLayer('', { position: [0, 0], size: [width, height] });
        layers.forEach((layer) => mergeLayers(layer, mergged));
        const url = mergged.canvas.canvas.toDataURL();
        const a = document.createElement('a');
        a.download = name+'.png';
        a.href = url;
        a.click();
    }, [options.drawing]);
    const newfile = useCallback(() => {
        const prevName = 'Drawing',
            prevWidth = 2000,
            prevHeight = 2000;
        onChange({ ...options, drawing: {
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
            ]
        } });
    }, []);
    const changeProps = useCallback(() => {
        throw new Error('Function not implemented.');
    }, []);
    return (
        <ul className="Menu">
            <li><button>File</button>
                <ul>
                    <li><button onClick={newfile}>New scrible</button></li>
                    <li><button onClick={exportPng}>Export to PNG</button></li>
                    <li><button onClick={changeProps}>Properties</button></li>
                </ul>
            </li>
        </ul>
    );
}

export default Menu;

