import { createContext, useEffect, useCallback, useState, useRef, useContext } from 'react';
import Tool from '../abstracts/Tool';
import '../css/Canvas.css';
import { MenuContext } from '../contexts/MenuOptions';
import Layer from './Layer';
import { DrawingContext } from '../contexts/DrawingState';
import { CanvasEvent } from '../types/CanvasEvent';

export const CanvasContext = createContext({});

function Canvas() {
    const drawingContext = useContext(DrawingContext);
    const menuContext = useContext(MenuContext);
    const [drawing, setDrawing] = drawingContext;
    const [options, onChange] = menuContext;
    const [prevTool, setTool] = useState<Tool>();
    const {
        tools, selectedTool
    } = options;
    const tool = tools[selectedTool].Tool;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        let temp = options;
        let temp2 = drawing;
        prevTool?.dispose({
            menuContext: [temp, (o)=>{
                if(typeof o == 'function') temp = o(temp);
                else temp = o;
                return temp;
            }],
            drawingContext: [temp2, (o) => {
                if(typeof o == 'function') temp2 = o(temp2);
                else temp2 = o;
                return temp2;
            }]
        });
        tool.setup({
            menuContext: [temp, (o)=>{
                if(typeof o == 'function') temp = o(temp);
                else temp = o;
                return temp;
            }],
            drawingContext: [temp2, (o) => {
                if(typeof o == 'function') temp2 = o(temp2);
                else temp2 = o;
                return temp2;
            }]
        });
        setTool(tool);
        onChange(temp);
        setDrawing(temp2);
    }, [tool]);

    useEffect(()=>{
        if(drawing){
            document.documentElement.style.setProperty('--doc-width', `${drawing.width}px`);
            document.documentElement.style.setProperty('--doc-height', `${drawing.height}px`);
        }
    }, [drawing]);

    const preventAll = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>):CanvasEvent<any>=>{
        e.preventDefault();
        e.stopPropagation();
        if(!ref.current) return { point: new DOMPoint(0, 0), drawingContext, menuContext };
        const { clientX, clientY } = e;
        const { top, left } = ref.current.getBoundingClientRect();
        return { point: new DOMPoint(clientX - left, clientY - top), drawingContext, menuContext };
    }, [drawingContext, menuContext]);

    const causeBlur = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        (document.activeElement as HTMLElement).blur();
        return e;
    }, []);

    let viewPort = undefined;
    if(drawing){
        const { width, height, layers, selectedLayer } = drawing;
        viewPort = <div>
            <div
                ref={ref}
                onMouseMove={(e) => tool.mouseMove(preventAll(e))}
                onClick={(e) => tool.click(preventAll(causeBlur(e)))}
                onMouseDown={(e) => tool.mouseDown(preventAll(e))}
                onMouseUp={(e) => tool.mouseUp(preventAll(e))}
                style={{ width: `${width}px`, height: `${height}px` }}
            >
                {layers.map((layer) => <Layer values={layer} key={layer.key} />)}
                {layers[selectedLayer].handles.map(({ key, icon, position, rotation, onMouseDown }) => <img
                    key={key}
                    src={icon}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: '24px',
                        height: '24px',
                        transform: `translate(${-12}px, ${-12}px) ${rotation}`
                    }}
                    alt=""
                    onMouseDown={e => onMouseDown(preventAll(e))}
                />)}
            </div>
        </div>;
    }
    return (
        <CanvasContext.Provider value={{ brush: tool }}>
            <div className="Canvas"
                onMouseMove={(e) => tool.mouseMove(preventAll(e))}
                onMouseDown={(e) => tool.mouseDown(preventAll(e))}
                onMouseUp={(e) => tool.mouseUp(preventAll(causeBlur(e)))}
            >
                {viewPort}
            </div>
        </CanvasContext.Provider>
    );
}

export default Canvas;
