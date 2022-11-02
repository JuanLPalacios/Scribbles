import { createContext, useEffect, useState } from 'react';
import '../css/Canvas.css';

const UserContext = createContext();

function Canvas(props) {
    const [[canvasElement,context],setContext] = useState([null,null]);
    const {width, height, brush, children} = props
    useEffect(()=>{
        if(canvasElement == null){
            let canvas = document.createElement('canvas');
            setContext([canvas, canvas.getContext("2d")]);
        }
    }, [])
    useEffect(()=>{
        canvasElement.width = width
    }, [width])
    useEffect(()=>{
        canvasElement.height = height
    }, [height])
    useEffect(()=>{

    }, [brush])
  return (
    <UserContext.Provider value={{context, brush}}>
      {canvasElement}
      {children}
    </UserContext.Provider>
  );
}

export default Canvas;
