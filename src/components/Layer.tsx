import {
  forwardRef} from 'react';
import '../css/Layer.css';
import { Drawable } from './Drawable';
import { LayerState } from '../types/LayerState';
import { useLayer } from '../hooks/useLayer';

const Layer = forwardRef<[LayerState, React.Dispatch<React.SetStateAction<LayerState>>],LayerState>((props, ref) => {
  const [state, setState] = useLayer(props);
  const {rect, canvas, buffer} = state;
  const {
    position:[x, y]
  } = rect;
  
  if(typeof ref == 'function'){
    ref([state, setState]);
  }else if(ref){
    ref.current = [state, setState];
  }

  return (
    <div style={{ left: `${x}px`, top: `${y}px` }}>
      <Drawable {...canvas || {size:[0,0]}} ref={canvas?.ref} />
      <Drawable {...buffer || {size:[0,0]}} ref={buffer?.ref}/>
    </div>
  );
});

export default Layer;
