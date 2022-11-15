import React from 'react';
import '../css/LayerMenu.css';
import Layer from '../abstracts/Layer';

interface LayerMenuProps {
  layers:Layer[],
  onUpdate:(layers:Layer[])=>void,
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
      <button onClick={onAddLayer}>+</button>
      <button onClick={onRemoveLayer}>-</button>
      <div className="list">
        {layers.map((layer, i) => (
          <div key={`${layer.key}-item`} className={layer.selected ? 'selected' : ''} onClick={() => onSelect(i)}>
            <canvas key={`${layer.key}-thumb`} ref={(thumb) => layer.thumbnail = thumb} />
            <div>
              {layer.name}
            </div>
            <div>{`${layer.key}-thumb`}</div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default LayerMenu;
