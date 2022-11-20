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
    selected:true,
  };
  layer.selected = true;
  const [state, setState] = useState<{layers:Array<[LayerState, React.Dispatch<React.SetStateAction<LayerState>> | null]>, selectedLayer:number, color:string, alpha:number}>({
    layers: [
      [layer,null],
    ],
    selectedLayer: 0,
    color: '#000000ff',
    alpha: 255,
  });
  const brush = new Marker();
  const layerRef = useRef<any[]>(state.layers);
  const {
    layers, selectedLayer, color, alpha,
  } = state;
  const onUpdate = (newLayers: [any, any][]) => {
    const selectedLayer = newLayers.findIndex((x) => x[0].selected);
    layerRef.current = newLayers;
    setState({ ...state, layers: [...newLayers], selectedLayer });
  };
  useEffect(() => {
    if(layers.reduce((total, layer)=>total+(layer[0].canvas?.canvas?1:0),0) === layerRef.current.length) return;
    
    const layersStates = layerRef.current;
    setState({ ...state, layers: layersStates, selectedLayer: layersStates.findIndex((x) => x[0].selected) });
  }, [layerRef.current]);
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas width={width} height={height} selectedLayer={layers[selectedLayer]} color={color} brush={brush}>
          {layers.map((layer, i) => <Layer {...layer[0]} key={layer[0].key} ref={(layer) => layerRef.current = Object.assign([], layerRef.current, {[i]: layer})} />)}
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
            const newLayers:[LayerState,any][] = [...layers, [
              {
                key: Date.now(),
                rect:{
                  position:[0, 0],
                  size: [width, height]
                },
                name:'Image',
                selected:false,
              }, null]
            ];
            layerRef.current = newLayers;
            setState({ ...state, layers: newLayers })}} />
        </div>
      </div>
    </div>
  );
}

export default App;
