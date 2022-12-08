import './App.css';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerMenu from './components/LayerMenu';
import { useContext } from 'react';
import { LayerState } from './types/LayerState';
import { createLayer } from './hooks/createLayer';
import { MenuContext } from './contexts/MenuOptions';

import ReactModal from 'react-modal';
import { ModalContext } from './contexts/ModalState';
import { DrawingContext } from './contexts/DrawingState';

function App() {
    const prevWidth = 2000;
    const prevHeight = 2000;
    const [modal] = useContext(ModalContext);
    const [drawing, setDrawing] = useContext(DrawingContext);
    const [state, setState] = useContext(MenuContext);
    const {
        selectedLayer, color, alpha, tools, selectedTool
    } = state;
    const { layers } = drawing || { layers: [] };
    const onUpdate = (newLayers: LayerState[], selectedLayer?: number) => {
        if(selectedLayer !== undefined){
            setDrawing(drawing && { ...drawing, layers: [...newLayers] });
            setState({ ...state, selectedLayer });
        }
        else
            setDrawing(drawing && { ...drawing, layers: [...newLayers] });
    };
    return (
        <>
            {modal &&
                <ReactModal
                    isOpen={modal.isOpen}
                    onRequestClose={modal.onRequestClose}
                    onAfterClose={modal.onAfterClose}
                    onAfterOpen={modal.onAfterOpen}
                >
                    {modal.contents}
                </ReactModal>
            }
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
                            setDrawing(drawing && { ...drawing, layers: newLayers });
                        }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
