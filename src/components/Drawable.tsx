import React, { useState, useRef, useEffect } from 'react';
import { forwardRef } from 'react';
import { DrawableState } from '../types/DrawableState';


export const Drawable = ({canvas}:{canvas:HTMLCanvasElement|undefined}) => {
  const [rendered, setRendered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!rendered && canvas && ref.current){
      ref.current?.appendChild(canvas);
      setRendered(true)
    }
  },[canvas, ref.current, rendered])
  return <div ref={ref} >
  </div>
  ;
};
