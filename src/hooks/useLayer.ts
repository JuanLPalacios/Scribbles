import { useState, useEffect } from "react";
import { LayerState } from "../types/LayerState";
import { Point } from "../types/Point";
import { useDrawable } from "./useDrawable";

export const useLayer:(initial:LayerState)=> [LayerState, React.Dispatch<React.SetStateAction<LayerState>>]
= (initial) => {
    
  const {rect, canvas: prevCanvas, buffer: prevBuffer, thumbnail: prevThumbnail} = initial;
  const { size} = rect;
  const [ width, height ] = size;
  const [canvas, setCanvas] = useDrawable(prevCanvas || {size});
  const [buffer, setBuffer] = useDrawable(prevBuffer || {size});
  const [thumbnail, setThubnail] = useDrawable(prevThumbnail || {size:[100, 100 * (height / width)]});

  const [state, setState] = useState<LayerState>(initial)
    
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
  },[width, height]);

  useEffect(()=>{
    setCanvas(canvas.ref.current)
  },[canvas.ref.current.canvas]);

  useEffect(()=>{
    setBuffer(buffer.ref.current)
  },[buffer.ref.current.canvas]);

  useEffect(()=>{
    setThubnail(thumbnail.ref.current)
  },[thumbnail.ref.current.canvas]);
  
    
    return [{...state, canvas, buffer, thumbnail}, setState];
  }