import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import '../css/Layer.css';
import { CanvasContext } from './Canvas';

const Layer = forwardRef((props, ref) => {
  const {x, y, width, height} = props
  const {brush} = useContext(CanvasContext)
  useEffect(()=>{
    //brush.setContext(layerContext)
    }, [brush])
  return (
    <canvas ref={ref} {...{width,height}} style={{left:x+'px', top:y+'px'}} />
  );
})

export default Layer;
