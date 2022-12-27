import '../css/LayerMenu.css';
import stackIcon from '../icons/stack-svgrepo-com.svg';
import addIcon from '../icons/extension-add-svgrepo-com.svg';
import trashIcon from '../icons/trash-svgrepo-com.svg';
import pushUpIcon from '../icons/push-chevron-up-r-svgrepo-com.svg';
import pushDownIcon from '../icons/push-chevron-down-r-svgrepo-com.svg';
import eyeIcon from '../icons/eye-alt-svgrepo-com.svg';
import { useState, useContext, useEffect } from 'react';
import { LayerState } from '../types/LayerState';
import { Drawable } from './Drawable';
import { BlendMode, blendModes } from '../types/BlendMode';
import ReactModal from 'react-modal';
import { createLayer } from '../hooks/createLayer';
import { DrawingContext } from '../contexts/DrawingState';

function LayerMenu() {
    const [sideMenu, setSideMenu] = useState({
        isOpen: false,
    });
    const [newLayerPopup, setNewLayerPopup] = useState({
        isOpen: false,
        layerName: 'Image',
        isValid: true,
        errors: { layerName: new Array<string> }
    });
    const [drawing, setDrawing] = useContext(DrawingContext);
    useEffect(() => {
        const errors = { layerName: new Array<string>() };
        if(newLayerPopup.layerName.length<1)
            errors.layerName.push('Must have at least 1 character');
        if(newLayerPopup.layerName.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
            errors.layerName.push('Shuld not contain forbidden characters');
        setNewLayerPopup({ ...newLayerPopup, errors, isValid: Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0 });
    }, [newLayerPopup.layerName]);
    if(!drawing) return <></>;
    const { selectedLayer, layers } = drawing;
    const onAddLayer = () => {
        if(!drawing) return;
        const { width, height } = drawing;
        const newLayers:LayerState[] = [...layers,
            createLayer(
                newLayerPopup.layerName,
                {
                    position: [0, 0],
                    size: [width, height]
                }
            )
        ];
        setNewLayerPopup({ ...newLayerPopup, isOpen: false });
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
            <button className='layer-button round-btn' onClick={() => setSideMenu({ ...sideMenu, isOpen: true })}>
                <img src={stackIcon} alt="layers" />
            </button>
            {sideMenu &&
                <ReactModal
                    isOpen={sideMenu.isOpen}
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
                    onRequestClose={() => setSideMenu({ ...sideMenu, isOpen: false })}
                >
                    <div className="layer-options">
                        <div className="menu">
                            <div className='fields'>
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
                                            <Drawable
                                                canvas={layer.thumbnail?.canvas}
                                                className='thumbnail'
                                                key={`${layer.key}-thumb`}
                                            />
                                            <div>
                                                {layer.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='fields'>
                                <div className='actions'>
                                    <button onClick={() => setNewLayerPopup({ ...newLayerPopup, isOpen: true, layerName: 'Image' })}><img src={addIcon} alt="Add Layer" /></button>
                                    <button onClick={onRemoveLayer}><img src={trashIcon} alt="Delete Layer" /></button>
                                    <button onClick={() => onMove(1)}><img src={pushUpIcon} alt="Move Up" /></button>
                                    <button onClick={() => onMove(-1)}><img src={pushDownIcon} alt="Move Down" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ReactModal>
            }

            <ReactModal
                isOpen={newLayerPopup.isOpen}
                onRequestClose={() => setNewLayerPopup({ ...newLayerPopup, isOpen: false })}
                style={{ content: { width: '14rem' } }}
            >
                <div className="fields">
                    <h2>New Layer</h2>
                    <div className='errors'>
                        {newLayerPopup.errors.layerName.map((error, i) => <div key={'error.name-'+i} className='error'>Name: {error}</div>)}
                    </div>
                    <label>
                        name
                        <input type="text" name='name' value={newLayerPopup.layerName} onChange={(e) => setNewLayerPopup({ ...newLayerPopup, layerName: e.target.value })} />
                    </label>
                    <div className='actions'>
                        <button onClick={onAddLayer} disabled={!newLayerPopup.isValid}>create</button>
                        <button onClick={() => setNewLayerPopup({ ...newLayerPopup, isOpen: false })}>cancel</button>
                    </div>
                </div>
            </ReactModal>
        </div>
    );
}

export default LayerMenu;
