import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useEffect, useRef, useState } from 'react';
import Brush from './abstracts/Brush';
import Layer from './components/Layer';
import LayerAbtraction from './abstracts/Layer';
import React from 'react';

function App() {
  const width = 200; const
    height = 200;
  document.documentElement.style.setProperty('--doc-width', `${width}px`);
  document.documentElement.style.setProperty('--doc-height', `${height}px`);
  const layer = new LayerAbtraction(0, 0, width, height, 'Image');
  layer.selected = true;
  const [state, setState] = useState<{layers:LayerAbtraction[], selectedLayer:LayerAbtraction, color:string, alpha:number}>({
    layers: [
      layer,
    ],
    selectedLayer: layer,
    color: '#000000ff',
    alpha: 255,
  });
  const layerRef = useRef<{}[]>([]);
  const {
    layers, selectedLayer, color, alpha,
  } = state;
  const onUpdate = (newLayers) => {
    const selectedLayer = newLayers.find((x) => x.selected);
    setState({ ...state, layers: [...newLayers], selectedLayer });
  };
  useEffect(() => {
    const layersCanvas = layerRef.current;
    const renderedLayers = layers.map((layer, i) => (Object.assign(layer, layersCanvas[i])));
    setState({ ...state, layers: renderedLayers, selectedLayer: renderedLayers.find((x) => x.selected) });
  }, [layers.length]);
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas width={width} height={height} selectedLayer={selectedLayer} color={color} brush={new Brush(5)}>
          {layers.map((layer, i) => <Layer {...layer} ref={(layer) => layerRef.current[i] = layer} />)}
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
          <Toolbar />
          <LayerMenu layers={layers} onUpdate={onUpdate} onAddLayer={() => setState({ ...state, layers: [...layers, new LayerAbtraction(0, 0, width, height, 'hey')] })} />
        </div>
      </div>
    </div>
  );
}

export default App;
