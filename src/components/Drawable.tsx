import React, { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { DrawableState } from '../types/DrawableState';


export const Drawable = forwardRef((props:DrawableState, ref:ForwardedRef<DrawableState>) => {
  const [ width, height ] = props.size;
  return <canvas
    ref={(canvas) => {
      if(!ref) return;
      const state = {...props, canvas, ctx:canvas?.getContext('2d')} 
      if(typeof ref === 'function')
        ref(state);
      else
        ref.current = state;
    }}
    width={width}
    height={height}
  />;
});
