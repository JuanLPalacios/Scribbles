import {
  forwardRef, useEffect, useRef,
} from 'react';
import { Rect } from '../types/Rect';
import '../css/Layer.css';
import React from 'react';

const Layer = forwardRef<{canvas:HTMLCanvasElement|null, buffer:HTMLCanvasElement|null},{rect:Rect}>((props, ref) => {
  const layerRef = useRef<{canvas:HTMLCanvasElement|null, buffer:HTMLCanvasElement|null} | null>({canvas:null, buffer:null});
  const [
    x, y, width, height,
   ] = props.rect;
  useEffect(() => {
    const layer = layerRef.current;
    if(ref !== null)
      (ref as any)(layer);
  }, []);
  return (
    <div style={{ left: `${x}px`, top: `${y}px` }}>
      <canvas ref={(canvas) => {if(layerRef.current)layerRef.current.canvas = canvas}} {...{ width, height }} />
      <canvas ref={(buffer) => {if(layerRef.current)layerRef.current.buffer = buffer}} {...{ width, height }} />
    </div>
  );
});

export default Layer;
