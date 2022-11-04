import { useContext, useEffect, useState } from 'react';
import '../css/Layer.css';

function Layer(props) {
  const [[canvasElement,layerContext],setContext] = useState([null,null]);
  const {x, y, width, height} = props
  const {brush} = useContext()
  useEffect(()=>{
      if(canvasElement == null){
          let canvas = document.createElement('canvas');
          setContext([canvas, canvas.getContext("2d")]);
      }
  }, [])
  useEffect(()=>{
    canvasElement.left = x
}, [x])
useEffect(()=>{
    canvasElement.top = y
}, [y])
useEffect(()=>{
  canvasElement.width = width
}, [width])
useEffect(()=>{
  canvasElement.height = height
}, [height])
useEffect(()=>{
  brush.setContext(layerContext)
  }, [brush])
return (
    {canvasElement}
);
}

export default Layer;
