import React, { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { Rect } from '../types/Rect';

export interface DrawableState {
  canvas:HTMLCanvasElement | null,
  ctx:CanvasRenderingContext2D | null | undefined
}

export const Drawable = forwardRef((props:{rect:Rect}, ref:ForwardedRef<DrawableState>) => {
  const [,, width, height ] = props.rect;
  return <canvas
    ref={(canvas) => {
      if(typeof ref === 'function')
        ref({canvas, ctx:canvas?.getContext('2d')})
    }}
    width={width}
    height={height}
  />;
});
