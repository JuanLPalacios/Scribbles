import './css/App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useContext } from 'react';
import { LayerState } from './types/LayerState';
import { createLayer } from './hooks/createLayer';
import { MenuContext } from './contexts/MenuOptions';

import { DrawingContext } from './contexts/DrawingState';
import { TopMenu } from './components/portals/TopMenu';
import { LeftMenu } from './components/portals/LeftMenu';
import { RightMenu } from './components/portals/RightMenu';
import { BottomMenu } from './components/portals/BottomMenu';

function App() {
    const prevWidth = 2000;
    const prevHeight = 2000;
    const [drawing, setDrawing] = useContext(DrawingContext);
    const [state, setState] = useContext(MenuContext);
    const {
        tools, selectedTool
    } = state;
    const { layers, selectedLayer } = drawing || { layers: [], selectedLayer: -1 };
    const onUpdate = (newLayers: LayerState[], selectedLayer?: number) => {
        if(selectedLayer !== undefined){
            setDrawing(drawing && { ...drawing, layers: [...newLayers], selectedLayer });
            setState({ ...state });
        }
        else
            setDrawing(drawing && { ...drawing, layers: [...newLayers] });
    };
    return (
        <>
            <div className="App">
                <TopMenu>
                    <Menu />
                    <h1>{drawing?.name}</h1>
                </TopMenu>
                <LeftMenu></LeftMenu>
                <Canvas/>
                <RightMenu>
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
                        setDrawing(drawing && { ...drawing, layers: newLayers });
                    }} />
                </RightMenu>
                <BottomMenu></BottomMenu>
            </div>
        </>
    );
}

export default App;
