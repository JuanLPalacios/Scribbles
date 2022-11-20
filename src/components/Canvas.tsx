import { createContext } from 'react';
import '../css/Canvas.css';

export const CanvasContext = createContext({});

interface CanvasProps { 
  width: any;
  height: any;
  brush: any;
  children: any;
  selectedLayer: any;
  color: any;
}

function Canvas(props:CanvasProps) {
  const {
    width, height, brush, children, selectedLayer, color,
  } = props;
  return (
    <CanvasContext.Provider value={{ brush }}>
      <div className="Canvas">
        <div>
          <div
            onClick={(e) => brush.click(e, selectedLayer[0], color)}
            onMouseDown={(e) => brush.mouseDown(e, selectedLayer[0], color)}
            onMouseUp={(e) => brush.mouseUp(e, selectedLayer[0], color)}
            onMouseMove={(e) => brush.mouseMove(e, selectedLayer[0], color)}
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {children}
          </div>
        </div>
      </div>
    </CanvasContext.Provider>
  );
}

export default Canvas;
