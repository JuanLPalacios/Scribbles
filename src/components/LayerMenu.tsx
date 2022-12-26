import '../css/LayerMenu.css';
import stackIcon from '../icons/stack-svgrepo-com.svg';
import addIcon from '../icons/extension-add-svgrepo-com.svg';
import trashIcon from '../icons/trash-svgrepo-com.svg';
import pushUpIcon from '../icons/push-chevron-up-r-svgrepo-com.svg';
import pushDownIcon from '../icons/push-chevron-down-r-svgrepo-com.svg';
import eyeIcon from '../icons/eye-alt-svgrepo-com.svg';
import { useState, useContext } from 'react';
import { LayerState } from '../types/LayerState';
import { Drawable } from './Drawable';
import { BlendMode, blendModes } from '../types/BlendMode';
import ReactModal from 'react-modal';
import { createLayer } from '../hooks/createLayer';
import { DrawingContext } from '../contexts/DrawingState';

function LayerMenu() {
    const [modal, setState] = useState({
        isOpen: false,
    });
    const [drawing, setDrawing] = useContext(DrawingContext);
    if(!drawing) return <></>;
    const { selectedLayer, layers } = drawing;
    const onAddLayer = () => {
        if(!drawing) return;
        const { width, height } = drawing;
        const newLayers:LayerState[] = [...layers,
            createLayer(
                'Image',
                {
                    position: [0, 0],
                    size: [width, height]
                }
            )
        ];
        setDrawing(drawing && { ...drawing, layers: newLayers });
    };
    const onRemoveLayer = () => {
        onUpdate([...layers.filter((x, i) => selectedLayer !== i)], selectedLayer%(layers.length -1));
    };
    const onOpacityChange = (opacity:number) => {
        const layer = layers[selectedLayer];
        layer.opacity = opacity;
        onUpdate([...layers]);
    };
    const onModeChange = (mixBlendMode:BlendMode) => {
        const layer = layers[selectedLayer];
        layer.mixBlendMode = mixBlendMode;
        onUpdate([...layers]);
    };
    const onMove = (change:number) => {
        const newPosirion = selectedLayer + change;
        if(newPosirion < 0) return;
        if(newPosirion >= layers.length) return;
        const layer = layers[selectedLayer];
        const otherLayer = layers[newPosirion];
        onUpdate(Object.assign([...layers], { [selectedLayer]: otherLayer, [newPosirion]: layer }), newPosirion);
    };
    const onUpdate = (newLayers: LayerState[], selectedLayer?: number) => {
        if(selectedLayer !== undefined){
            setDrawing(drawing && { ...drawing, layers: [...newLayers], selectedLayer });
        }
        else
            setDrawing(drawing && { ...drawing, layers: [...newLayers] });
    };

    return (
        <div className="LayerMenu">
            <button className='layer-button round-btn' onClick={() => setState({ ...modal, isOpen: true })}>
                <img src={stackIcon} alt="layers" />
            </button>
            {modal &&
                <ReactModal
                    isOpen={modal.isOpen}
                    style={{ content: {
                        display: 'flex',
                        flexDirection: 'column',
                        margin: 'auto',
                        top: 0,
                        left: 'auto',
                        bottom: 0,
                        right: 0,
                        marginRight: 0,
                        transform: 'none',
                    } }}
                    onRequestClose={() => setState({ ...modal, isOpen: false })}
                >
                    <div className="layer-options">
                        <div className="menu">
                            <div className='actions'>
                                <label>
                                blend mode
                                    <select value={layers[selectedLayer]?.mixBlendMode} onChange={(e) => onModeChange(e.target.value as BlendMode)}>
                                        {blendModes.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </label>
                                <label>
                                opacity
                                    <input type="range" value={layers[selectedLayer]?.opacity} min="0" max="1" step="0.004" onChange={(e) => {
                                        onOpacityChange(parseFloat(e.target.value));
                                    }} />
                                </label>
                            </div>
                            <div className="scroller">
                                <div className="list">
                                    {layers.map((layer, i) => (
                                        <div key={`${layer.key}-item`} className={`layer ${selectedLayer === i ? 'selected' : ''}`} onClick={() => onUpdate(layers, i)}>
                                            <label>
                                                <input type="checkbox" checked={layer.visible} value="visible" onChange={()=>{
                                                    layer.visible=!layer.visible;
                                                    onUpdate([...layers]);
                                                }} />
                                                <div className='checkbox'>
                                                    <img src={eyeIcon} alt="visible" />
                                                </div>
                                            </label>
                                            <div className='thumbnail'>
                                                <Drawable
                                                    canvas={layer.thumbnail?.canvas}
                                                    key={`${layer.key}-thumb`}
                                                />
                                            </div>
                                            <div>
                                                {layer.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='actions'>
                                <button onClick={onAddLayer}><img src={addIcon} alt="Add Layer" /></button>
                                <button onClick={onRemoveLayer}><img src={trashIcon} alt="Delete Layer" /></button>
                                <button onClick={() => onMove(1)}><img src={pushUpIcon} alt="Move Up" /></button>
                                <button onClick={() => onMove(-1)}><img src={pushDownIcon} alt="Move Down" /></button>
                            </div>
                        </div>
                    </div>
                </ReactModal>
            }
        </div>
    );
}

export default LayerMenu;
