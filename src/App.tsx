import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useEffect, useRef, useState } from 'react';
import Layer from './components/Layer';
import React from 'react';
import Marker from './tools/Marker';
import { LayerState } from './types/LayerState';
import { createLayer } from './hooks/createLayer';

function App() {
  const width = 200; const
    height = 200;
  document.documentElement.style.setProperty('--doc-width', `${width}px`);
  document.documentElement.style.setProperty('--doc-height', `${height}px`);
  const layer:LayerState = {
    key: Date.now(),
    rect:{
      position:[0, 0],
      size: [width, height]
    }, 
    name:'Image',
    visible:true,
    selected:true,
  };
  layer.selected = true;
  const [state, setState] = useState<{layers:LayerState[], selectedLayer:number, color:string, alpha:number}>({
    layers: [
      createLayer(layer),
    ],
    selectedLayer: 0,
    color: '#000000ff',
    alpha: 255,
  });
  const brush = new Marker();
  const {
    layers, selectedLayer, color, alpha,
  } = state;
  const onUpdate = (newLayers: LayerState[]) => {
    const selectedLayer = newLayers.findIndex((x) => x.selected);
    setState({ ...state, layers: [...newLayers], selectedLayer });
  };
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas width={width} height={height} selectedLayer={layers[selectedLayer]} color={color} brush={brush}>
          {layers.map((layer, i) => <Layer values={layer} key={layer.key} />)}
        </Canvas>
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
          <Toolbar brush={brush} />
          <LayerMenu layers={layers} onUpdate={onUpdate} onAddLayer={() => {
            const newLayers:LayerState[] = [...layers,
              createLayer({
                key: Date.now(),
                rect:{
                  position:[0, 0],
                  size: [width, height]
                },
                name:'Image',
                visible:true,
                selected:false,
              })
            ];
            setState({ ...state, layers: newLayers })}} />
        </div>
      </div>
    </div>
  );
}

export default App;
