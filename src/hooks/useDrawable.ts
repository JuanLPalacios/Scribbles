import { useState, useEffect, useRef } from "react";
import { DrawableState } from "../types/DrawableState";
import { RefStateHook } from "../types/RefStateHook";

export const useDrawable:RefStateHook<DrawableState> = (initial) => {
    const ref = useRef<DrawableState>(initial);
    const [state, setState] = useState(initial)
    useEffect(() => {
      if(ref.current.canvas && ref.current.ctx){
        setState({...state, ...ref.current});
      }
    }, [ref.current.canvas, ref.current.ctx]);
    return [{...state, ref}, setState];
  }