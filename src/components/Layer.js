import {
  forwardRef, useContext, useEffect, useRef, useState,
} from 'react';
import '../css/Layer.css';
import { CanvasContext } from './Canvas';

const Layer = forwardRef((props, ref) => {
  const layerRef = useRef({});
  const {
    x, y, width, height,
  } = props;
  const { brush } = useContext(CanvasContext);
  useEffect(() => {
    const layer = layerRef.current;
    ref({ ...layer });
  }, []);
  return (
    <>
      <canvas ref={(canvas) => layerRef.current.canvas = canvas} {...{ width, height }} style={{ left: `${x}px`, top: `${y}px` }} />
      <canvas ref={(buffer) => layerRef.current.buffer = buffer} {...{ width, height }} style={{ left: `${x}px`, top: `${y}px` }} />
    </>
  );
});

export default Layer;
