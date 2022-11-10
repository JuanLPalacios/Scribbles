import { createContext, useEffect, useState } from 'react';
import '../css/Canvas.css';

const UserContext = createContext();

function Canvas(props) {
  const {width, height, brush, children, selectedLayer, color} = props
  return (
    <div className="scroller">
      <div
        onClick={ e => brush.click(e, selectedLayer, color)}
        onMouseDown={ e => brush.mouseDown(e, selectedLayer, color)}
        onMouseUp={ e => brush.mouseUp(e, selectedLayer, color)}
        onMouseMove={ e => brush.mouseMove(e, selectedLayer, color)}
        style={{width:width+'px',height:height+'px'}}
      >
        {children}
      </div>
    </div>
  );
}

export default Canvas;
