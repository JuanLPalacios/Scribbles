import '../css/LayerMenu.css';
import stackIcon from '../icons/stack-svgrepo-com.svg';
import { LayerState } from '../types/LayerState';
import { Drawable } from './Drawable';
import { BlendMode, blendModes } from '../types/BlendMode';

interface LayerMenuProps {
  layers:LayerState[],
  selection:number
  onUpdate:(layers:LayerState[], index?:number)=>void,
  onAddLayer:()=>void
}

function LayerMenu({ layers, selection, onUpdate, onAddLayer }:LayerMenuProps) {
    const onRemoveLayer = () => {
        onUpdate([...layers.filter((x, i) => selection !== i)], selection%(layers.length -1));
    };
    const onOpacityChange = (opacity:number) => {
        const layer = layers[selection];
        layer.opacity = opacity;
        onUpdate([...layers]);
    };
    const onModeChange = (mixBlendMode:BlendMode) => {
        const layer = layers[selection];
        layer.mixBlendMode = mixBlendMode;
        onUpdate([...layers]);
    };
    const onMove = (change:number) => {
        const newPosirion = selection + change;
        if(newPosirion < 0) return;
        if(newPosirion >= layers.length) return;
        const layer = layers[selection];
        const otherLayer = layers[newPosirion];
        onUpdate(Object.assign([...layers], { [selection]: otherLayer, [newPosirion]: layer }), newPosirion);
    };
    return (
        <div className="LayerMenu">
            <button className='layer-button'>
                <img src={stackIcon} alt="layers" />
            </button>
            <div className="menu">
                <div className='actions'>
                    <label>
                        blend mode
                        <select value={layers[selection]?.mixBlendMode} onChange={(e) => onModeChange(e.target.value as BlendMode)}>
                            {blendModes.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </label>
                    <label>
                        opacity
                        <input type="range" value={layers[selection]?.opacity} min="0" max="1" step="0.004" onChange={(e) => {
                            onOpacityChange(parseFloat(e.target.value));
                        }} />
                    </label>
                </div>
                <div className="scroller">
                    <div className="list">
                        {layers.map((layer, i) => (
                            <div key={`${layer.key}-item`} className={`layer ${selection === i ? 'selected' : ''}`} onClick={() => onUpdate(layers, i)}>
                                <label>
                                    <div className='checkbox'>
                                        visible
                                    </div>
                                    <input type="checkbox" checked={layer.visible} value="visible" onChange={()=>{
                                        layer.visible=!layer.visible;
                                        onUpdate([...layers]);
                                    }} />
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
                    <button onClick={onAddLayer}>+</button>
                    <button onClick={onRemoveLayer}>-</button>
                    <button onClick={() => onMove(1)}>move up</button>
                    <button onClick={() => onMove(-1)}>move down</button>
                </div>
            </div>
        </div>
    );
}

export default LayerMenu;
