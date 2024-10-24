
import '../css/Canvas.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';
import Layer from './Layer';
import { useDrawing } from '../hooks/useDrawing';
import { useTool } from '../hooks/useTool';
import { TopMenuPortal } from './portals/TopMenu';
import { InputName } from './inputs/InputName';
import { validateFileName } from '../lib/Validations';
import { uid } from '../lib/uid';

export function Canvas() {
    const [drawing, { setTransform, rename }] = useDrawing();
    const { width, height, layers } = drawing.data;
    const { selectedLayer, layers: editorLayers, handles, buffer, transform } = drawing.editorState;
    const ref = useRef<HTMLDivElement>(null);
    const [keys, setKeys] = useState<{[key:string]:boolean}>({});
    // FIXME: touches oldTouches and oldTransform cause unnecessary rerenders on tool actions
    const touchesRef = useRef<{[key:string]:React.PointerEvent<HTMLDivElement>}>({});
    const oldTouchesRef = useRef<{[key:string]:React.PointerEvent<HTMLDivElement>}>({});
    const toolStatedRef = useRef(false);
    const [oldTransform, setOldTransform] = useState<DOMMatrix>(new DOMMatrix());
    const tool = useTool();
    const containerRef = useRef<HTMLDivElement>(null);

    const { top: viewTop=0, left: viewLeft=0, width: viewWidth=0, height: viewHeight=0 } = containerRef.current?.getBoundingClientRect()||{};
    const { top: drawingTop=0, left: drawingLeft=0, width: drawingWidth=0, height: drawingHeight=0 } = ref.current?.getBoundingClientRect()||{};
    const
        barWidth = Math.min(viewWidth/2, viewWidth**2/drawingWidth/2),
        barHeight = Math.min(viewHeight/2, viewHeight**2/drawingHeight/2);
    const
        posX = (viewLeft+viewWidth/2)-(drawingLeft+drawingWidth/2),
        posY = (viewTop+viewHeight/2)-(drawingTop+drawingHeight/2);
    const
        xScroll = Math.min(viewWidth-barWidth, Math.max(0, posX*barWidth/viewWidth+(viewWidth-barWidth)/2)),
        yScroll = Math.min(viewHeight-barHeight, Math.max(0, posY*barHeight/viewHeight+(viewHeight-barHeight)/2));
    useEffect(()=>{
        //editorDispatch({ type: 'editor/forceUpdate', payload: temp2 });

    }, [tool]);

    useEffect(()=>{
        const
            viewportWidth = parseInt(document.documentElement.style.getPropertyValue('--doc-width').split('px')[0]),
            viewportHeight = parseInt(document.documentElement.style.getPropertyValue('--doc-height').split('px')[0]);
        if(
            (viewportWidth !== width)
            &&(viewportHeight !== height)
        ){
            const { width: viewWidth=0, height: viewHeight=0 } = containerRef.current?.getBoundingClientRect()||{};

            setTransform(
                transform
                    .translate(viewWidth/2, viewHeight/2)
                    .translate(-drawing.data.width/2, -drawing.data.height/2));
            document.documentElement.style.setProperty('--doc-width', `${width}px`);
            document.documentElement.style.setProperty('--doc-height', `${height}px`);
        }
    }, [drawing.data.height, drawing.data.width, height, setTransform, transform, width]);

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

    const getPointer = useCallback((e:React.PointerEvent<HTMLDivElement>):CanvasEvent=>{
        if(!containerRef.current) return { point: new DOMPoint(0, 0) };
        const { clientX, clientY } = e;
        const { top, left } = containerRef.current.getBoundingClientRect();
        return { point: (new DOMPoint(clientX - left, clientY - top)).matrixTransform(transform.inverse()) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transform, containerRef.current]);

    function pointerdownHandler(ev:React.PointerEvent<HTMLDivElement>) {
        if(ev.buttons!==1)return;
        (document.activeElement as HTMLElement).blur();
        touchesRef.current[ev.pointerId] = ev;
        oldTouchesRef.current[ev.pointerId] = ev;
        setTimeout(()=>{
            const keys = Object.keys(touchesRef.current);
            if (keys.length === 1) {
                const pointer = getPointer(ev);
                tool.mouseDown(pointer);
                toolStatedRef.current = true;
            }
        });
        setOldTransform(new DOMMatrix(transform.toString()));
    }

    const pointermoveHandler = function(ev:React.PointerEvent<HTMLDivElement>) {
        if(ev.buttons!==1)return;
        touchesRef.current[ev.pointerId] = ev;
        const keys = Object.keys(touchesRef.current);
        if (keys.length === 2) {
            ev.preventDefault();
            ev.stopPropagation();
            if(toolStatedRef.current){
                const pointer = getPointer(ev);
                tool.mouseUp(pointer);
                toolStatedRef.current = false;
            }
            const prev = oldTouchesRef.current[keys[0]];
            const newPoint = touchesRef.current[keys[0]];
            const x = newPoint.clientX - viewLeft;
            const y = newPoint.clientY - viewTop;
            const px = newPoint.clientX - prev.clientX;
            const py = newPoint.clientY - prev.clientY;
            const vx = touchesRef.current[keys[1]].screenX -touchesRef.current[keys[0]].screenX,
                vy = touchesRef.current[keys[1]].clientY -touchesRef.current[keys[0]].clientY,
                vox = oldTouchesRef.current[keys[1]].screenX -oldTouchesRef.current[keys[0]].screenX,
                voy = oldTouchesRef.current[keys[1]].clientY -oldTouchesRef.current[keys[0]].clientY;
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
        if(!touchesRef.current[ev.pointerId])return;
        delete touchesRef.current[ev.pointerId];
        delete oldTouchesRef.current[ev.pointerId];
        const keys = Object.keys(touchesRef.current);
        if(keys.length == 0){
            const pointer = getPointer(ev);
            tool.mouseUp(pointer);
            tool.click(pointer);
        }
    };

    const wheelHandler = function(ev:React.WheelEvent<HTMLDivElement>) {
        const x = ev.clientX - viewLeft;
        const y = ev.clientY - viewTop;
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
        else if (keys.SHIFT){
            if((0 <= xScroll+ev.deltaY)&&
                (xScroll+barWidth+ev.deltaY <= viewWidth)&&
                (0 <= yScroll+ev.deltaX)&&
                (yScroll+barHeight+ev.deltaX <= viewHeight)){
                setTransform(new DOMMatrix()
                    .translate(-ev.deltaY, -ev.deltaX)
                    .multiply(transform)
                );
            }
        }
        else if((0 <= xScroll+ev.deltaX)&&
            (xScroll+barWidth+ev.deltaX <= viewWidth)&&
            (0 <= yScroll+ev.deltaY)&&
            (yScroll+barHeight+ev.deltaY <= viewHeight)){
            setTransform(new DOMMatrix()
                .translate(-ev.deltaX, -ev.deltaY)
                .multiply(transform)
            );
        }
    };

    const updateName = useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
        rename(e.target.value.trim()||`Nameless Scribble ${uid()}`);
    }, [rename]);

    const horizontalScroll = useCallback((e:React.MouseEvent<HTMLDivElement>)=>{
        const
            scaleX = viewWidth/barWidth;
        const mouseMoveHandler = (ev:MouseEvent) => {
            const deltaX = (ev.pageX - e.pageX);
            if(
                (0 <= xScroll+deltaX)
                &&(xScroll+barWidth+deltaX <= viewWidth)
            ){
                setTransform(new DOMMatrix()
                    .translate(-deltaX*scaleX, 0)
                    .multiply(transform)
                );
            }
        };
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }, [barWidth, setTransform, transform, viewWidth, xScroll]);

    const verticalScroll = useCallback((e:React.MouseEvent<HTMLDivElement>)=>{
        const
            scaleY = viewHeight/barHeight;
        const mouseMoveHandler = (ev:MouseEvent) => {
            const deltaY = (ev.pageY - e.pageY);
            if(
                (0 <= yScroll+deltaY)
                &&(yScroll+barHeight+deltaY <= viewHeight)
            ){
                setTransform(new DOMMatrix()
                    .translate(0, -deltaY*scaleY)
                    .multiply(transform)
                );
            }
        };
        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }, [barHeight, setTransform, transform, viewHeight, yScroll]);

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

    return (
        <div className='Canvas' >
            <TopMenuPortal>
                <h1 className='filename'> <InputName value={drawing.data.name} onChange={updateName} validate={validateFileName}/></h1>
            </TopMenuPortal>
            <div className='h-bar'>
                <div className='handle' style={{ left: `${xScroll}px`, width: `${barWidth}px` }} onMouseDown={horizontalScroll}></div>
            </div>
            <div className='v-bar'>
                <div className='handle' style={{ top: `${yScroll}px`, height: `${barHeight}px` }} onMouseDown={verticalScroll}></div>
            </div>
            <div className="viewport"
                ref={containerRef}
                onPointerDown={pointerdownHandler}
                onPointerMove={pointermoveHandler}
                onPointerUp={pointerupHandler}
                onPointerCancel={pointerupHandler}
                onPointerLeave={pointermoveHandler}
                onWheel={wheelHandler}
            >
                <div style={{ transform: `${transform}`, transformOrigin: 'top left' }}>
                    <div ref={ref} style={{ width: `${width}px`, height: `${height}px` }}>
                        {layers.map((layer, i)=>({ layer, editorLayer: editorLayers[i] })).map(({ layer, editorLayer }, i) => <Layer key={editorLayer.key} values={layer} buffer={(selectedLayer==i)?buffer:undefined} editor={editorLayer} />)}
                        {handles.map(({ key, icon, position, rotation, onMouseDown }) => <img
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
                            onPointerDown={e => onMouseDown(getPointer(e))} />)}
                    </div>
                </div>
            </div>
        </div>);
}

