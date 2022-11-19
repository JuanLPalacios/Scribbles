import {
  forwardRef} from 'react';
import '../css/Layer.css';
import { Drawable } from './Drawable';
import { LayerState } from '../types/LayerState';
import { useLayer } from '../hooks/useLayer';

const Layer = forwardRef<LayerState,LayerState>((props) => {
  const [state, setState] = useLayer(props);
  const {rect, canvas, buffer} = state;
  const {
    position:[x, y]
  } = rect;
  

  return (
    <div style={{ left: `${x}px`, top: `${y}px` }}>
      <Drawable {...canvas} />
      <Drawable {...buffer} />
    </div>
  );
});

export default Layer;
