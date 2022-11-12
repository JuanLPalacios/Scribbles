import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useEffect, useRef, useState } from 'react';
import Brush from './abstracts/Brush';
import Layer from './components/Layer';

function App() {
  const width = 2200, height = 2200;
  document.querySelector(':root').style.setProperty('--doc-width', `${width}px`);
  document.querySelector(':root').style.setProperty('--doc-height', `${height}px`);
  const [state, setState] = useState({
    layers:[
      {key:0,x:0,y:0, width, height, selected:true},
    ],
    selectedLayer:null,
    color:'#000000ff',
    alpha:255,
  });
  const layerRef = useRef([]);
  const {layers, selectedLayer, color, alpha} = state;
  const onUpdate = (newLayers) => {
    const selectedLayer = newLayers.find(x=>x.selected)
    setState({...state, layers: [...newLayers] , selectedLayer });
  }
  useEffect(() => {
    const layersCanvas = layerRef.current
    setState({...state, layers: layers.map((layer, i) => ({...layer, canvas: layersCanvas[i], ctx: layersCanvas[i].getContext('2d')})) , selectedLayer:{canvas:layersCanvas[layers.findIndex(x=>x.selected)], ctx:layersCanvas[layers.findIndex(x=>x.selected)].getContext('2d')}})
  }, [layers.length])
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas width={width} height={height} selectedLayer={selectedLayer} color={color} brush={new Brush(5)}>
          {layers.map((layer, i) => <Layer {...layer} ref={layer => layerRef.current[i] = layer}/>)}
        </Canvas>
        <div className="tools">
        {color}
          <div style={{background:color, display:'inline-block', inlineSize: 'fit-content'}}>
            <input type="color" value={color.substring(0,7)} onChange={(e)=>setState({...state, color:e.target.value+alpha.toString(16)})} style={{opacity:0}} />
          </div>
          <input type="range" value={alpha} min="0" max="255" onChange={(e)=>setState({...state, color:color.substring(0,7)+parseInt(e.target.value).toString(16), alpha:parseInt(e.target.value)})} />
          <Toolbar>
          </Toolbar>
          <LayerMenu layers={layers} onUpdate={onUpdate} onAddLayer={()=>setState({...state, layers:[...layers, {key:Date.now(),x:0,y:0, width, height}]})} />
        </div>
      </div>
    </div>
  );
}

export default App;
