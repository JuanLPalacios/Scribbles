import { createContext, useEffect, useCallback, useState, useRef } from 'react';
import Tool from '../abstracts/Tool';
import '../css/Canvas.css';
import { MenuOptions } from '../types/MenuOptions';
import Layer from './Layer';

export const CanvasContext = createContext({});

interface CanvasProps {
    options:MenuOptions,
    onChange:(options:MenuOptions)=>void
}

function Canvas(props:CanvasProps) {
    const [prevTool, setTool] = useState<Tool>();
    const {
        options, onChange
    } = props;
    const {
        drawing, tools, selectedTool, selectedLayer
    } = options;
    const tool = tools[selectedTool].tool;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        let temp = options;
        prevTool?.dispose(temp, (o)=>{
            temp = o;
        });
        tool.setup(temp, (o)=>{
            temp = o;
        });
        setTool(tool);
        onChange(temp);
    }, [tool]);

    const preventAll = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        e.preventDefault();
        e.stopPropagation();
        if(!ref.current) return new DOMPoint(0, 0);
        const { clientX, clientY } = e;
        const { top, left } = ref.current.getBoundingClientRect();
        return new DOMPoint(clientX - left, clientY - top);
    }, []);

    const causeBlur = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        (document.activeElement as HTMLElement).blur();
        return e;
    }, []);

    let viewPort = undefined;
    if(drawing){
        const { width, height, layers } = drawing;
        viewPort = <div>
            <div
                ref={ref}
                onMouseMove={(e) => tool.mouseMove(preventAll(e), options, onChange)}
                onClick={(e) => tool.click(preventAll(causeBlur(e)), options, onChange)}
                onMouseDown={(e) => tool.mouseDown(preventAll(e), options, onChange)}
                onMouseUp={(e) => tool.mouseUp(preventAll(e), options, onChange)}
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
                    onMouseDown={e => onMouseDown(preventAll(e), options, onChange)}
                />)}
            </div>
        </div>;
    }
    return (
        <CanvasContext.Provider value={{ brush: tool }}>
            <div className="Canvas"
                onMouseMove={(e) => tool.mouseMove(preventAll(e), options, onChange)}
                onMouseDown={(e) => tool.mouseDown(preventAll(e), options, onChange)}
                onMouseUp={(e) => tool.mouseUp(preventAll(causeBlur(e)), options, onChange)}
            >
                {viewPort}
            </div>
        </CanvasContext.Provider>
    );
}

export default Canvas;
