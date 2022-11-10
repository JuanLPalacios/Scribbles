import { useContext, useEffect, useRef, useState } from 'react';
import '../css/Layer.css';

function Layer(props) {
  const canvasRef = useRef(null)
  const [layerContext,setContext] = useState(null);
  const {x, y, width, height} = props
  const {brush} = useContext()
  const canvasElement = canvasRef.current
  
  useEffect(() => {
    setContext(canvasElement.getContext('2d'))
  }, [])
  useEffect(()=>{
    brush.setContext(layerContext)
    }, [brush])
  return (
    <canvas ref={canvasRef} {...{width,height}} style={{left:x+'px', top:y+'px'}} />
  );
}

export default Layer;
