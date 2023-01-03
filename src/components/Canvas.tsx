import { createContext, useEffect, useCallback, useState, useRef, useContext } from 'react';
import Tool from '../abstracts/Tool';
import '../css/Canvas.css';
import { MenuContext } from '../contexts/MenuOptions';
import Layer from './Layer';
import { EditorContext } from '../contexts/DrawingState';
import { CanvasEvent } from '../types/CanvasEvent';

export const CanvasContext = createContext({});

function Canvas() {
    const editorContext = useContext(EditorContext);
    const menuContext = useContext(MenuContext);
    const [editor, editorDispatch] = editorContext;
    const [options, onChange] = menuContext;
    const [prevTool, setTool] = useState<Tool>();
    const {
        tools, selectedTool
    } = options;
    const tool = tools[selectedTool].Tool;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        let temp = options;
        let temp2 = editor;
        prevTool?.dispose({
            menuContext: [temp, (o)=>{
                if(typeof o == 'function') temp = o(temp);
                else temp = o;
                return temp;
            }],
            editorContext: [temp2, (o) => {
                if(o.type == 'editor/forceUpdate')
                    temp2 = { ...temp2, ...o.payload };
            }]
        });
        tool.setup({
            menuContext: [temp, (o)=>{
                if(typeof o == 'function') temp = o(temp);
                else temp = o;
                return temp;
            }],
            editorContext: [temp2, (o) => {
                if(o.type == 'editor/forceUpdate')
                    temp2 = { ...temp2, ...o.payload };
            }]
        });
        setTool(tool);
        onChange(temp);
        editorDispatch({ type: 'editor/forceUpdate', payload: temp2 });
    }, [tool]);

    useEffect(()=>{
        if(editor.drawing){
            document.documentElement.style.setProperty('--doc-width', `${editor.drawing.width}px`);
            document.documentElement.style.setProperty('--doc-height', `${editor.drawing.height}px`);
        }
    }, [editor]);

    const preventAll = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>):CanvasEvent<any>=>{
        e.preventDefault();
        e.stopPropagation();
        if(!ref.current) return { point: new DOMPoint(0, 0), editorContext: editorContext, menuContext };
        const { clientX, clientY } = e;
        const { top, left } = ref.current.getBoundingClientRect();
        return { point: new DOMPoint(clientX - left, clientY - top), editorContext: editorContext, menuContext };
    }, [editorContext, menuContext]);

    const causeBlur = useCallback((e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
        (document.activeElement as HTMLElement).blur();
        return e;
    }, []);

    let viewPort = undefined;
    if(editor.drawing){
        const { width, height, layers, selectedLayer } = editor.drawing;
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
