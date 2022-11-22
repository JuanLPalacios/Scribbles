import { createContext } from 'react';
import Brush from '../abstracts/Brush';
import Tool from '../abstracts/Tool';
import '../css/Canvas.css';
import { LayerState } from '../types/LayerState';

export const CanvasContext = createContext({});

interface CanvasProps { 
  width: number;
  height: number;
  tool: Tool;
  children: React.ReactNode;
  selectedLayer: LayerState;
  color: string;
  brush: Brush;
}

function Canvas(props:CanvasProps) {
    const {
        width, height, tool, children, selectedLayer, color,brush
    } = props;
    const brushWidth = 5;
    return (
        <CanvasContext.Provider value={{ brush: tool }}>
            <div className="Canvas">
                <div>
                    <div
                        onClick={(e) => tool.click(brush, e, selectedLayer, color, brushWidth)}
                        onMouseDown={(e) => tool.mouseDown(brush, e, selectedLayer, color, brushWidth)}
                        onMouseUp={(e) => tool.mouseUp(brush, e, selectedLayer, color, brushWidth)}
                        onMouseMove={(e) => tool.mouseMove(brush, e, selectedLayer, color, brushWidth)}
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
