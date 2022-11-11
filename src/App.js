import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useState } from 'react';
import Brush from './abstracts/Brush';
import Layer from './components/Layer';

function App() {
  const width = 2200, height = 2200;
  const layer = {key:0,x:0,y:0, width, height};
  const [state, setState] = useState({
    layers:[layer],
    selectedLayer:layer,
    color:'#00000000',
  });
  const {layers, selectedLayer, color} = state;
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas width={width} height={height} selectedLayer={selectedLayer} color={color} brush={new Brush(5)}>
          {layers.map((layer) => <Layer {...layer} />)}
        </Canvas>
        <div className="tools">
          <Toolbar>
          </Toolbar>
          <LayerMenu />
        </div>
      </div>
    </div>
  );
}

export default App;
