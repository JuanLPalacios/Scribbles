import {
  forwardRef, useEffect, useRef,useCallback
} from 'react';
import { Rect } from '../types/Rect';
import '../css/Layer.css';
import React from 'react';
import { Drawable } from './Drawable';
import { buffer } from 'stream/consumers';
import { LayerState } from '../types/LayerState';

const Layer = forwardRef<LayerState,LayerState>((props, ref) => {
  const layerRef = useRef<LayerState>(props);
  const {key, rect, name, canvas, buffer, thumbnail, selected} = props;
  const {
    position:[x, y],
    size: [ width, height ]
  } = rect;
  

  return (
    <div style={{ left: `${x}px`, top: `${y}px` }}>
      <Drawable {...canvas} />
      <Drawable {...buffer} />
    </div>
  );
});

export default Layer;
