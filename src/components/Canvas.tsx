import { createContext, useEffect, useCallback, useState, useRef, useContext } from 'react';
import '../css/Canvas.css';
import { MenuOptions } from '../contexts/MenuOptions';
import Layer from './Layer';
import { EditorContext } from '../contexts/DrawingState';
import { CanvasEvent } from '../types/CanvasEvent';
import { QuickStart } from './QuickStart';
import { useMenu } from '../hooks/useMenu';
import { useTool } from '../hooks/useTool';
import { Tool } from '../contexts/ToolContext';

export const CanvasContext = createContext({});

function Canvas() {
    const editorContext = useContext(EditorContext);
    const menuContext = useMenu();
    const [editor, editorDispatch] = editorContext;
    const [options, onChange] = menuContext;
    const [prevTool, setTool] = useState<Tool<any>>();
    const [keys, setKeys] = useState<{[key:string]:boolean}>({});
    const [touches, setTouches] = useState<{[key:number]:React.PointerEvent<HTMLDivElement>}>({});
    const [oldTouches, setOldTouches] = useState<{[key:number]:React.PointerEvent<HTMLDivElement>}>({});
    const [oldTransform, setOldTransform] = useState<DOMMatrix>(new DOMMatrix());
    const [transform, setTransform] = useState<DOMMatrix>(new DOMMatrix());
    const tool = useTool();

    const ref = useRef<HTMLDivElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const { top, left } = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tool]);

    useEffect(()=>{
        if(editor.drawing){
            document.documentElement.style.setProperty('--doc-width', `${editor.drawing.width}px`);
            document.documentElement.style.setProperty('--doc-height', `${editor.drawing.height}px`);
        }
    }, [editor]);

    useEffect(()=>{
        if(containerRef.current){
            containerRef.current.addEventListener('touchstart', function(e) {
                if (e.targetTouches.length < 2){
                    e.preventDefault();
                }
            }, { passive: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef.current]);

    const getPointer = useCallback((e:React.PointerEvent<HTMLDivElement>):CanvasEvent<MenuOptions>=>{
        if(!containerRef.current) return { point: new DOMPoint(0, 0), editorContext: editorContext, menuContext };
        const { clientX, clientY } = e;
        const { top, left } = containerRef.current.getBoundingClientRect();
        return { point: (new DOMPoint(clientX - left, clientY - top)).matrixTransform(transform.inverse()), editorContext: editorContext, menuContext };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorContext, menuContext, transform, containerRef.current]);

    function pointerdownHandler(ev:React.PointerEvent<HTMLDivElement>) {
        if(ev.buttons!==1)return;
        (document.activeElement as HTMLElement).blur();
        const keys = Object.keys(touches);
        if (keys.length === 0) {
            const pointer = getPointer(ev);
            tool.mouseDown(pointer);
        }
        setTouches({ ...touches, [ev.pointerId]: ev });
        setOldTouches({ ...oldTouches, [ev.pointerId]: ev });
        setOldTransform(new DOMMatrix(transform.toString()));
    }

    const pointermoveHandler = function(ev:React.PointerEvent<HTMLDivElement>) {
        if(ev.buttons!==1)return;
        setTouches({ ...touches, [ev.pointerId]: ev });
        touches[ev.pointerId]= ev;
        const keys = Object.keys(touches);
        if (keys.length === 2) {
            ev.preventDefault();
            ev.stopPropagation();
            const prev = oldTouches[keys[0] as unknown as number];
            const newp = touches[keys[0] as unknown as number];
            const x = newp.clientX - left;
            const y = newp.clientY - top;
            const px = newp.clientX - prev.clientX;
            const py = newp.clientY - prev.clientY;
            const vx = touches[keys[1] as unknown as number].screenX -touches[keys[0] as unknown as number].screenX,
                vy = touches[keys[1] as unknown as number].clientY -touches[keys[0] as unknown as number].clientY,
                vox = oldTouches[keys[1] as unknown as number].screenX -oldTouches[keys[0] as unknown as number].screenX,
                voy = oldTouches[keys[1] as unknown as number].clientY -oldTouches[keys[0] as unknown as number].clientY;
            const scale = Math.sqrt((vx**2+vy**2))/Math.sqrt((vox**2+voy**2));
            const angle = Math.atan2(vy, vx) - Math.atan2(voy, vox);

            setTransform(new DOMMatrix()
                .translate(x, y)
                .rotate(
                    angle * 180 / Math.PI
                )
                .scale(scale)
                .translate(-x, -y)
                .translate(px, py)
                .multiply(oldTransform)
            );
        }
        else{
            const pointer = getPointer(ev);
            tool.mouseMove(pointer);
        }
    };

    const pointerupHandler = function(ev:React.PointerEvent<HTMLDivElement>) {
        if(!touches[ev.pointerId])return;
        delete touches[ev.pointerId];
        delete oldTouches[ev.pointerId];
        const keys = Object.keys(touches);
        if(keys.length == 0){
            const pointer = getPointer(ev);
            tool.mouseUp(pointer);
            tool.click(pointer);
        }
        setTouches({ ...touches });
        setOldTouches({ ...oldTouches });
    };

    const wheelHandler = function(ev:React.WheelEvent<HTMLDivElement>) {
        const x = ev.clientX - left;
        const y = ev.clientY - top;
        const pinchScale = 1 -.01*ev.deltaY;
        if((ev.ctrlKey||keys.CTRL) && (0.01 <= transform.a*pinchScale && transform.a*pinchScale < 10)){
            setTransform(new DOMMatrix()
                .translate(x, y)
                .scale(pinchScale)
                .translate(-x, -y)
                .multiply(transform)
            );
        }
        else if (keys.ALT)
            setTransform(new DOMMatrix()
                .translate(x, y)
                .rotate(-ev.deltaY*Math.PI)
                .translate(-x, -y)
                .multiply(transform)
            );
        else if (keys.SHIFT)
            setTransform(new DOMMatrix()
                .translate(-ev.deltaY, -ev.deltaX)
                .multiply(transform)
            );
        else
            setTransform(new DOMMatrix()
                .translate(-ev.deltaX, -ev.deltaY)
                .multiply(transform)
            );
    };

    useEffect(() => {
        const keyDownHandler = (event:KeyboardEvent) => {
            setKeys({ ...keys, CTRL: event.ctrlKey, SHIFT: event.shiftKey, ALT: event.altKey, [event.key]: true });
        };
        const keyUpHandler = (event:KeyboardEvent) => {
            setKeys({ ...keys, CTRL: event.ctrlKey, SHIFT: event.shiftKey, ALT: event.altKey, [event.key]: true });
        };

        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        };
    }, [keys]);

    let viewPort = undefined;
    if(editor.drawing){
        const { width, height, layers, selectedLayer } = editor.drawing;
        viewPort = <>
            <div
                style={{
                    transform: `${transform}`,
                    transformOrigin: 'top left'
                }}
            >
                <div
                    ref={ref}
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
                        draggable="false"
                        onPointerDown={e => onMouseDown(getPointer(e))}
                    />)}
                </div>
            </div>
        </>;
    }
    return (
        <CanvasContext.Provider value={{ brush: tool }}>
            <div className="Canvas"
                ref={containerRef}
                onPointerDown={pointerdownHandler}
                onPointerMove={pointermoveHandler}
                onPointerUp={pointerupHandler}
                onPointerCancel={pointerupHandler}
                onPointerLeave={pointermoveHandler}
                onWheel={wheelHandler}
            >
                {editor.drawing?
                    viewPort
                    :<QuickStart/>}
            </div>
        </CanvasContext.Provider>
    );
}

export default Canvas;

