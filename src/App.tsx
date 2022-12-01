import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useState } from 'react';
import Marker from './brushes/Marker';
import { LayerState } from './types/LayerState';
import { createLayer } from './hooks/createLayer';
import { MenuOptions } from './types/MenuOptions';

import { draw } from './tools/Draw';
import { erase } from './tools/Erase';
import { fill } from './tools/Fill';
import { transform } from './tools/Transform';
import { uid } from './lib/uid';

function App() {
    const width = 200; const
        height = 200;
    document.documentElement.style.setProperty('--doc-width', `${width}px`);
    document.documentElement.style.setProperty('--doc-height', `${height}px`);
    const [state, setState] = useState<MenuOptions>({
        layers: [
            createLayer(
                'Image',
                {
                    position:[0, 0],
                    size: [width, height]
                }
            ),
        ],
        selectedLayer: 0,
        brushes:[new Marker()],
        selectedBrush: 0,
        brushWidth:20,
        tools:[
            {key:uid(),tool:draw, name:'draw'},
            {key:uid(),tool:erase, name:'erase'},
            {key:uid(),tool:fill, name:'fill'},
            {key:uid(),tool:transform, name:'transform'}
        ],
        selectedTool: 0,
        color: '#000000ff',
        alpha: 255,
    });
    const {
        layers, selectedLayer, color, alpha, brushes, selectedBrush, tools, selectedTool
    } = state;
    const brush = brushes[selectedBrush];
    const {tool} = tools[selectedTool];
    const onUpdate = (newLayers: LayerState[], selectedLayer?: number) => {
        if(selectedLayer !== undefined)
            setState({ ...state, layers: [...newLayers], selectedLayer  });
        else
            setState({ ...state, layers: [...newLayers]  });
    };
    return (
        <div className="App">
            <Menu />
            <div className="content">
                <Canvas width={width} height={height} options={state} onChange={setState} />
                <div className="tools">
                    {color}
                    <label>
                        color
                        <div style={{ background: color, display: 'inline-block', inlineSize: 'fit-content' }}>
                            <input type="color" value={color.substring(0, 7)} onChange={(e) => setState({ ...state, color: e.target.value + alpha.toString(16) })} style={{ opacity: 0 }} />
                        </div>
                    </label>
                    <label>
                        alpha
                        <input type="range" value={alpha} min="0" max="255" onChange={(e) => setState({ ...state, color: color.substring(0, 7) + parseInt(e.target.value).toString(16), alpha: parseInt(e.target.value) })} />
                    </label>
                    <Toolbar toolButtons={tools}  selectedTool={selectedTool} onSelect={(selectedTool)=>setState({...state, selectedTool})} />
                    <LayerMenu layers={layers} selection={selectedLayer} onUpdate={onUpdate} onAddLayer={() => {
                        const newLayers:LayerState[] = [...layers,
                            createLayer(
                                'Image',
                                {
                                    position:[0, 0],
                                    size: [width, height]
                                }
                            )
                        ];
                        setState({ ...state, layers: newLayers });}} />
                </div>
            </div>
        </div>
    );
}

export default App;
