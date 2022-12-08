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
import { AppContext } from './AppContext';

function App() {
    const prevWidth = 200;
    const prevHeight = 200;
    document.documentElement.style.setProperty('--doc-width', `${prevWidth}px`);
    document.documentElement.style.setProperty('--doc-height', `${prevHeight}px`);
    const [state, setState] = useState<MenuOptions>({
        selectedLayer: 0,
        brushes: [new Marker()],
        selectedBrush: 0,
        brushWidth: 20,
        tools: [
            { key: uid(), tool: draw, name: 'draw' },
            { key: uid(), tool: erase, name: 'erase' },
            { key: uid(), tool: fill, name: 'fill' },
            { key: uid(), tool: transform, name: 'transform' }
        ],
        selectedTool: 0,
        color: '#000000ff',
        alpha: 255,
    });
    const {
        drawing, selectedLayer, color, alpha, tools, selectedTool
    } = state;
    const { layers } = drawing || { layers: [] };
    const onUpdate = (newLayers: LayerState[], selectedLayer?: number) => {
        if(selectedLayer !== undefined)
            setState({ ...state, drawing: drawing && { ...drawing, layers: [...newLayers] }, selectedLayer  });
        else
            setState({ ...state, drawing: drawing && { ...drawing, layers: [...newLayers] }  });
    };
    return (
        <AppContext.Provider value={undefined}>
            <div className="App">
                <Menu options={state} onChange={setState} />
                <div className="content">
                    <Canvas options={state} onChange={setState} />
                    <div className="tools">
                        {color+ ('0'+alpha.toString(16)).substring(alpha.toString(16).length-1)}
                        <label>
                        color
                            <div style={{ background: color + ('0'+alpha.toString(16)).substring(alpha.toString(16).length-1), display: 'inline-block', inlineSize: 'fit-content' }}>
                                <input type="color" value={color} onChange={(e) => setState({ ...state, color: e.target.value })} style={{ opacity: 0 }} />
                            </div>
                        </label>
                        <label>
                        alpha
                            <input type="range" value={alpha} min="0" max="255" onChange={(e) => setState({ ...state, alpha: parseInt(e.target.value) })} />
                        </label>
                        <Toolbar toolButtons={tools}  selectedTool={selectedTool} onSelect={(selectedTool)=>setState({ ...state, selectedTool })} />
                        <LayerMenu layers={layers} selection={selectedLayer} onUpdate={onUpdate} onAddLayer={() => {
                            const newLayers:LayerState[] = [...layers,
                                createLayer(
                                    'Image',
                                    {
                                        position: [0, 0],
                                        size: [prevWidth, prevHeight]
                                    }
                                )
                            ];
                            setState({ ...state, drawing: drawing && { ...drawing, layers: newLayers } });
                        }} />
                    </div>
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;
