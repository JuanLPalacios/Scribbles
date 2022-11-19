import { useState, useEffect } from "react";
import { LayerState } from "../types/LayerState";
import { Point } from "../types/Point";
import { useDrawable } from "./useDrawable";

export const useLayer:(initial:LayerState)=> [LayerState, React.Dispatch<React.SetStateAction<LayerState>>]
= (initial) => {
    
  const [state, setState] = useState({...initial})
    
    const {rect, canvas: prevCanvas, buffer: prevBuffer, thumbnail: prevThumbnail} = initial;
    const [canvas, setCanvas] = useDrawable(prevCanvas);
    const [buffer, setBuffer] = useDrawable(prevBuffer);
    const [thumbnail, setThubnail] = useDrawable(prevThumbnail);
    const {
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
    

    return [state, setState];
  }