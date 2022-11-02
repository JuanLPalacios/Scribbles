import logo from './logo.svg';
import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Layer from './components/Layer';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';

function App() {
  return (
    <div className="App">
      <Menu />
      <div className="content">
        <Canvas>
          <Layer />
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
