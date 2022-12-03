import { createContext, useEffect, useState } from 'react';
import { transform } from 'typescript';
import Tool from '../abstracts/Tool';
import '../css/Canvas.css';
import { MenuOptions } from '../types/MenuOptions';
import Layer from './Layer';

export const CanvasContext = createContext({});

interface CanvasProps {
    width: number,
    height: number,
    options:MenuOptions,
    onChange:(options:MenuOptions)=>void
}

function Canvas(props:CanvasProps) {
    const [prevTool, setTool] = useState<Tool>();
    const {
        width, height, options, onChange
    } = props;
    const {
        layers, tools, selectedTool, selectedLayer
    } = options;
    const tool = tools[selectedTool].tool;
    useEffect(()=>{
        let temp = options;
        prevTool?.dispose(temp, (o)=>{temp = o;});
        tool.setup(temp, (o)=>{temp = o;});
        setTool(tool);
        onChange(temp);
    },[tool]);
    return (
        <CanvasContext.Provider value={{ brush: tool }}>
            <div className="Canvas" 
                onMouseMove={(e) => tool.mouseMove(e, options, onChange)}
                onMouseDown={(e) => tool.mouseDown(e, options, onChange)}
                onMouseUp={(e) => tool.mouseUp(e, options, onChange)}
            >
                <div>
                    <div
                        onMouseMove={(e) => tool.mouseMove(e, options, onChange)}
                        onClick={(e) => tool.click(e, options, onChange)}
                        onMouseDown={(e) => tool.mouseDown(e, options, onChange)}
                        onMouseUp={(e) => tool.mouseUp(e, options, onChange)}
                        style={{ width: `${width}px`, height: `${height}px` }}
                    >
                        {layers.map((layer) => <Layer values={layer} key={layer.key} />)}
                        {layers[selectedLayer].handles.map(({ key, icon, position, rotation, onMouseDown }) => <img
                            key={key}
                            src={icon}
                            style={{
                                left:`${position.x}px`,
                                top:`${position.y}px`,
                                width:'24px',
                                height:'24px',
                                transform:`translate(${-12}px, ${-12}px) ${rotation}`
                            }}
                            alt=""
                            onMouseDown={e => onMouseDown(e,options,onChange)}
                        />)}
                    </div>
                </div>
            </div>
        </CanvasContext.Provider>
    );
}

export default Canvas;
