import { useState, useEffect, useRef, useCallback } from "react";
import { LayerState } from "../types/LayerState";
import { Point } from "../types/Point";
import { useDrawable } from "./useDrawable";

export const useLayers = (initial:LayerState) => {
    const ref = useRef<LayerState>(initial);
    const [state, setState] = useState({...initial, ref})
    
    const {key, rect, name, canvas: prevCanvas, buffer: prevBuffer, thumbnail: prevThumbnail, selected} = initial;
    const [canvas, setCanvas] = useDrawable(prevCanvas);
    const [buffer, setBuffer] = useDrawable(prevBuffer);
    const [thumbnail, setThubnail] = useDrawable(prevThumbnail);
    const {
      position:[x, y],
      size: [ width, height ]
    } = rect;
  
    // resizeCanvas
    useEffect(()=>{
      const size:Point = [width, height];
      setCanvas({...canvas, size});
      setBuffer({...buffer, size});
      setThubnail({...thumbnail,
        size:[
          thumbnail.size[0],
          thumbnail.size[0] * (height / width)
        ]
      })
    },[width, height, setCanvas, canvas, setBuffer, buffer, setThubnail, thumbnail]);
    
    const onRenderThumbnail = useCallback(() => {
      if (!thumbnail.canvas) return;
      if (!canvas.canvas) return;
      thumbnail.ctx?.clearRect(0,0,canvas.canvas.width,canvas.canvas.height);
      thumbnail.ctx?.drawImage(canvas.canvas, 0, 0, thumbnail.canvas.width, thumbnail.canvas.height);
    },[canvas.canvas, thumbnail.canvas, thumbnail.ctx]);

    return [state, setState];
  }