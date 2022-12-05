import {useCallback} from 'react';
import '../css/Menu.css';
import { createLayer } from '../hooks/createLayer';
import { mergeLayers } from '../lib/Graphics';
import { MenuOptions } from '../types/MenuOptions';

interface MenuProps {
    options:MenuOptions,
    onChange:(options:MenuOptions)=>void
}


function Menu({options,onChange}:MenuProps) {
    const {layers, width, height, name} = options;
    const exportPng = useCallback(() => {
        const mergged = createLayer('', {position:[0,0], size:[width,height]});
        layers.forEach((layer) => mergeLayers(layer,mergged));
        const url = mergged.canvas.canvas.toDataURL();
        const a = document.createElement('a');
        a.download = name+'.png';
        a.href = url;
        //a.textContent = 'Download PNG';
        //document.body.appendChild(a);
        a.click();
    },[layers, width, height, name]);
    const newfile = useCallback(() => {
        throw new Error('Function not implemented.');
    },[]);
    const changeProps = useCallback(() => {
        throw new Error('Function not implemented.');
    },[]);
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

