import React from 'react';
import '../css/LayerMenu.css';
import Layer from '../abstracts/Layer';
import { LayerState } from '../types/LayerState';
import { Drawable } from './Drawable';

interface LayerMenuProps {
  layers:Array<[LayerState, React.Dispatch<React.SetStateAction<LayerState>> | null]>,
  onUpdate:(layers:Array<[LayerState, React.Dispatch<React.SetStateAction<LayerState>> | null]>)=>void,
  onAddLayer:()=>void
}

function LayerMenu({ layers, onUpdate, onAddLayer }:LayerMenuProps) {
  const onSelect = (i:number) => {
    if (!layers[i][0].selected) {
      (layers.find((x) => x[0].selected) || [{selected:true}])[0].selected = false;
      layers[i][0].selected = true;
      onUpdate([...layers]);
    }
  };
  const onRemoveLayer = () => {
    const selection = layers.findIndex((x) => x[0].selected);
    layers[(selection + 1) % layers.length][0].selected = true;
    onUpdate([...layers.filter((x, i) => selection !== i)]);
  };
  return (
    <div className="LayerMenu">
      <button onClick={onAddLayer}>+</button>
      <button onClick={onRemoveLayer}>-</button>
      <div className="list">
        {layers.map((layer, i) => (
          <div key={`${layer[0].key}-item`} className={layer[0].selected ? 'selected' : ''} onClick={() => onSelect(i)}>
            <Drawable {...layer[0].thumbnail} key={`${layer[0].key}-thumb`} />
            <div>
              {layer[0].name}
            </div>
            <div>{`${layer[0].key}-thumb`}</div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default LayerMenu;
