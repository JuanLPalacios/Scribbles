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
            <div className="Canvas">
                <div>
                    <div
                        onClick={(e) => tool.click(e, options, onChange)}
                        onMouseDown={(e) => tool.mouseDown(e, options, onChange)}
                        onMouseUp={(e) => tool.mouseUp(e, options, onChange)}
                        onMouseMove={(e) => tool.mouseMove(e, options, onChange)}
                        style={{ width: `${width}px`, height: `${height}px` }}
                    >
                        {layers.map((layer) => <Layer values={layer} key={layer.key} />)}
                        {layers[selectedLayer].handles.map((handle) => <div
                            key={handle.key}
                            style={{
                                left:`${handle.position.x}px`,
                                top:`${handle.position.y}px`,
                                background:'#ff0000',
                                width:'50px',
                                height:'50px',
                                transform:`${handle.rotation} translate(${-25}px, ${-25}px)`
                            }}
                        >{handle.icon}</div>)}
                    </div>
                </div>
            </div>
        </CanvasContext.Provider>
    );
}

export default Canvas;
