import React, { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { DrawableState } from '../types/DrawableState';


export const Drawable = forwardRef((props:DrawableState, ref:ForwardedRef<DrawableState>) => {
  const [ width, height ] = props.size;
  return <canvas
    ref={(canvas) => {
      if(typeof ref === 'function')
        ref({...props, canvas, ctx:canvas?.getContext('2d')})
    }}
    width={width}
    height={height}
  />;
});
