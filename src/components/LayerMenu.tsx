import '../css/LayerMenu.css';
import stackIcon from '../icons/stack-svgrepo-com.svg';
import addIcon from '../icons/extension-add-svgrepo-com.svg';
import trashIcon from '../icons/trash-svgrepo-com.svg';
import pushUpIcon from '../icons/push-chevron-up-r-svgrepo-com.svg';
import pushDownIcon from '../icons/push-chevron-down-r-svgrepo-com.svg';
import eyeIcon from '../icons/eye-alt-svgrepo-com.svg';
import { useState, useEffect, useMemo } from 'react';
import { Drawable } from './Drawable';
import { BlendMode, blendModes } from '../types/BlendMode';
import ReactModal from 'react-modal';
import { useDrawing } from '../hooks/useDrawing';

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
    const [d, editorDispatch] = useDrawing();
    useEffect(() => {
        const errors = { layerName: new Array<string>() };
        if(newLayerPopup.layerName.length<1)
            errors.layerName.push('Must have at least 1 character');
        if(newLayerPopup.layerName.match(/[.,#%&{}\\<>*?/$!'":@+`|=]/gi))
            errors.layerName.push('Should not contain forbidden characters');
        setNewLayerPopup({ ...newLayerPopup, errors, isValid: Object.values(errors).reduce((total, value)=> total + value.length, 0) === 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newLayerPopup.layerName]);
    const { moveLayerDown, moveLayerUp } = editorDispatch||{};
    const { onAddLayer, onModeChange, onOpacityChange, onOpacityChangePrev, onRemoveLayer, onSelect, onVisibilityChange } = useMemo(()=>{
        if(!d)return{};
        const { editor: { selectedLayer } } = d;
        const { addLayer, removeLayer, updateLayer, forceUpdate, selectLayer } = editorDispatch;
        return{
            onAddLayer(){
                setNewLayerPopup({ ...newLayerPopup, isOpen: false });
                addLayer(newLayerPopup.layerName);
            },
            onRemoveLayer(){
                removeLayer(selectedLayer);
            },
            onOpacityChangePrev(opacity:number){
                const layer = layers[selectedLayer];
                layer.opacity = opacity;
                forceUpdate({ data: { ...data } });
            },
            onSelect(index:number){
                selectLayer(index);
            },
            onOpacityChange(opacity:number){
                updateLayer({ opacity });
            },
            onVisibilityChange(index:number, visible:boolean){
                updateLayer(index, { visible });
            },
            onModeChange(mixBlendMode:BlendMode){
                updateLayer({ mixBlendMode });
            },
        };
    }, []);
    if(!d) return <></>;
    const { data, editor: { layers: editorLayers, selectedLayer } } = d;
    const { layers } = data;
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
                                    <select value={layers[selectedLayer]?.mixBlendMode} onChange={(e) => { if(onModeChange)onModeChange(e.target.value as BlendMode); }}>
                                        {blendModes.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </label>
                                <label>
                                opacity
                                    <input type="range" value={layers[selectedLayer]?.opacity} min="0" max="1" step="0.004" onChange={(e) => {
                                        if(onOpacityChangePrev)onOpacityChangePrev(parseFloat(e.target.value));
                                    }} onMouseUp={(e) => {
                                        if(onOpacityChange)onOpacityChange(layers[selectedLayer]?.opacity);
                                    }} />
                                </label>
                            </div>
                            <div className="scroller">
                                <div className="list">
                                    {layers.map((layer, i)=>({ layer, editorLayer: editorLayers[i] })).map(({ layer, editorLayer }, i) => (
                                        <div
                                            key={`${editorLayer.key}-item`}
                                            className={`layer ${selectedLayer === i ? 'selected' : ''}`}
                                            onClick={() => { if(onSelect)onSelect(i);
                                            }}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={layer.visible}
                                                    value="visible"
                                                    onChange={()=>{ if(onVisibilityChange)onVisibilityChange(i, !layer.visible); }} />
                                                <div className='checkbox'>
                                                    <img src={eyeIcon} alt="visible" />
                                                </div>
                                            </label>
                                            <Drawable
                                                canvas={editorLayer.thumbnail?.canvas}
                                                className='thumbnail'
                                                key={`${editorLayer.key}-thumb`}
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
                                    <button onClick={moveLayerUp} disabled={!moveLayerUp}><img src={pushUpIcon} alt="Move Up" /></button>
                                    <button onClick={moveLayerDown} disabled={!moveLayerDown}><img src={pushDownIcon} alt="Move Down" /></button>
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
