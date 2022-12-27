import './css/App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useContext } from 'react';

import { DrawingContext } from './contexts/DrawingState';
import { TopMenu } from './components/portals/TopMenu';
import { LeftMenu } from './components/portals/LeftMenu';
import { RightMenu } from './components/portals/RightMenu';
import { BottomMenu } from './components/portals/BottomMenu';

function App() {
    const [drawing] = useContext(DrawingContext);
    return (
        <>
            <div className="App">
                <TopMenu>
                    <Menu />
                    <h1 className='filename'>{drawing?.name}</h1>
                </TopMenu>
                <LeftMenu></LeftMenu>
                <Canvas/>
                <RightMenu>
                    <Toolbar />
                    <LayerMenu />
                </RightMenu>
                <BottomMenu></BottomMenu>
            </div>
        </>
    );
}

export default App;
