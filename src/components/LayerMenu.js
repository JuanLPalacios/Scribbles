import '../css/LayerMenu.css';

function LayerMenu({ layers, onUpdate, onAddLayer }) {
  const onSelect = (i) => {
    if (!layers[i].selected) {
      layers.find((x) => x.selected).selected = false;
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
          <div key={`${layer.key}-item`} className={layer.selected && 'selected'} onClick={() => onSelect(i)}>
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
