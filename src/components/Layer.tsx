import {
  forwardRef, useEffect, useRef,
} from 'react';
import { Rect } from '../types/Rect';
import '../css/Layer.css';
import React from 'react';
import { Drawable, DrawableState } from './Drawable';
import { buffer } from 'stream/consumers';

export interface LayerState {
  key: number;
  rect: Rect;
  name: string;
  canvas:DrawableState
  buffers: DrawableState[];
  thumbnail: DrawableState;
  selected:boolean
}


const Layer = forwardRef<LayerState,LayerState>((props, ref) => {
  const layerRef = useRef<LayerState>(props);
  const [
    x, y, width, height,
   ] = props.rect;
  useEffect(() => {
    const layer = layerRef.current;
    if(ref !== null)
      (ref as any)(layer);
  }, []);

  function resizeThumbnail() {
    if (!props.thumbnail) return;
    if (!props.canvas) return;
    const width = props.thumbnail.rect[2];
    const height = props.thumbnail.rect[2] * (props.canvas.rect[3] / props.canvas.rect[2]);
    throw 'rezise hook not implemented';
  }
  
  function renderThumbnail() {
    if (!props.thumbnail.canvas) return;
    if (!props.canvas.canvas) return;
    props.thumbnail.ctx?.drawImage(props.canvas.canvas, 0, 0, props.thumbnail.canvas.width, props.thumbnail.canvas.height);
  }

  const setCanvas = (canvas:DrawableState | undefined) => {
    if (!canvas) return;
    if(typeof ref === 'function')
      ref({...props, canvas});
    resizeThumbnail();
  }

  const setBuffer = (buffer:DrawableState | undefined) => {
    if (!buffer) return;
    const buffers = [buffer];
    throw 'setBuffers hook not implemented';
  }

  const setThumbnail = (thubnail:DrawableState | undefined) => {
    if (!thubnail) return;
    if (props.thumbnail === thubnail) return;
    props.thumbnail = thubnail;
    resizeThumbnail();
    renderThumbnail();
  }

  return (
    <div style={{ left: `${x}px`, top: `${y}px` }}>
      <Drawable rect={props.rect} ref={setCanvas} />
      <Drawable rect={props.rect} ref={setBuffer} />
    </div>
  );
});

export default Layer;
