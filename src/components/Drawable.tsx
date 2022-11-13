import React, { ForwardedRef } from 'react';
import { forwardRef } from 'react';

interface Rect {
  x:number,
  y:number,
  width:number,
  height:number,
}

interface from {
  mixBlendMode:string
}

export const Drawable = forwardRef((props:Rect, ref:ForwardedRef<HTMLCanvasElement>) => {
  const { x, y, width, height } = props;
  return <canvas ref={ref} width={width} height={height} />;
});
