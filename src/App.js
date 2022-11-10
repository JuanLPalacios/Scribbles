import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useState } from 'react';
import Layer from './abstracts/Layer';
import Brush from './abstracts/Brush';

function App() {
  const layer = new Layer(0,0, 200, 200);
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
        <Canvas width={200} height={200} selectedLayer={selectedLayer} color={color} brush={new Brush(5)}>
          {layers.map((layer) => layer.canvasElement)}
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
