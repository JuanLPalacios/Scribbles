import React from 'react';
import '../css/LayerMenu.css';
import Layer from '../abstracts/Layer';
import { LayerState } from '../types/LayerState';
import { Drawable } from './Drawable';

interface LayerMenuProps {
  layers:LayerState[],
  onUpdate:(layers:LayerState[])=>void,
  onAddLayer:()=>void
}

function LayerMenu({ layers, onUpdate, onAddLayer }:LayerMenuProps) {
  
  const onSelect = (i:number) => {
    if (!layers[i].selected) {
      (layers.find((x) => x.selected) || {selected:true}).selected = false;
      layers[i].selected = true;
      onUpdate([...layers]);
    }
  };
  const onRemoveLayer = () => {
    const selection = layers.findIndex((x) => x.selected);
    layers[(selection + 1) % layers.length].selected = true;
    onUpdate([...layers.filter((x, i) => selection !== i)]);
  };
  return (
    <div className="LayerMenu">
      <div className="scroller">
        <div className="list">
          {layers.map((layer, i) => (
            <div key={`${layer.key}-item`} className={`layer ${layer.selected ? 'selected' : ''}`} onClick={() => onSelect(i)}>
              <label>
                <div className='checkbox'>
                  visible
                </div>
                <input type="checkbox" checked={layer.visible} value="visible" onChange={(e)=>{
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
      </div>
    </div>
  );
}

export default LayerMenu;
