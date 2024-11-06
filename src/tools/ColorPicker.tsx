import { useEffect, useMemo, useState } from 'react';
import { ToolFunctions, ToolContext, Tool } from '../contexts/ToolContext';
import { useDrawing } from '../hooks/useDrawing';
import { createDrawable } from '../generators/createDrawable';
import { Drawable } from '../components/Drawable';

const LOOKING_GLASS_DIAMETER = 9;
const LOOKING_GLASS_SCALE = 10;
const LOOKING_GLASS_RADIUS = (LOOKING_GLASS_DIAMETER-1)/2;

export const ColorPicker = ({ children }: ToolFunctions) => {
    const [drawing] = useDrawing();
    const lookingGlassUpscale = useMemo(()=>createDrawable({ size: [LOOKING_GLASS_DIAMETER*LOOKING_GLASS_SCALE, LOOKING_GLASS_DIAMETER*LOOKING_GLASS_SCALE] }), []);
    const lookingGlassSelection = useMemo(()=>createDrawable({ size: [LOOKING_GLASS_DIAMETER, LOOKING_GLASS_DIAMETER], options: { willReadFrequently: true } }), []);
    const [point, setPoint] = useState<DOMPoint>(new DOMPoint());
    const [selecting, setSelecting] = useState(false);
    const { transform } = drawing.editorState;
    const { a, b, c, d } = transform;
    const normalizationMatrix = useMemo(()=>{
        const nonTranslatedMatrix = new DOMMatrix([
            a, b,
            c, d,
            0, 0
        ]);
        return DOMMatrix.fromFloat32Array(nonTranslatedMatrix.inverse().toFloat32Array());;
    }, [a, b, c, d]);
    const rotated = useMemo(()=>{
        const hx = Math.sqrt(b*b+a*a);
        const hy = Math.sqrt(d*d+c*c);
        const handleMatrix = new DOMMatrix([
            a, b,
            c, d,
            0, 0
        ]).scale(1/hx, 1/hy);
        return handleMatrix;
    }, [a, b, c, d]);
    const { x, y } = point;
    const r = useMemo<Tool>(()=>{
        function upscale() {
            const { ctx } = lookingGlassUpscale;
            const data = lookingGlassSelection.ctx.getImageData(0, 0, LOOKING_GLASS_DIAMETER, LOOKING_GLASS_DIAMETER).data;
            ctx.clearRect(0, 0, LOOKING_GLASS_DIAMETER*LOOKING_GLASS_SCALE, LOOKING_GLASS_DIAMETER*LOOKING_GLASS_SCALE);
            for (let i = 0; i < data.length; i+=4) {
                const
                    r = data[i],
                    g = data[i+1],
                    b = data[i+2],
                    a = data[i+3];
                const color = `rgb(${r},${g},${b})`;
                const x = ((i/4)%LOOKING_GLASS_DIAMETER)*LOOKING_GLASS_SCALE;
                const y = Math.floor(i/LOOKING_GLASS_DIAMETER/4)*LOOKING_GLASS_SCALE;
                ctx.globalAlpha = a/255;
                ctx.fillStyle = color;
                ctx.fillRect(x, y, LOOKING_GLASS_SCALE, LOOKING_GLASS_SCALE);
            }
        }
        function render(point:DOMPoint) {
            const { ctx } = lookingGlassSelection;
            ctx.clearRect(0, 0, LOOKING_GLASS_DIAMETER, LOOKING_GLASS_DIAMETER);
            const { x, y } = point;
            const { layers } = drawing.data;
            const { layers: editorLayers } = drawing.editorState;
            for (let i = 0; i < layers.length; i++) {
                const { opacity, visible, mixBlendMode } = layers[i];
                const { canvas } = editorLayers[i];
                if(visible){
                    ctx.globalAlpha = opacity;
                    ctx.globalCompositeOperation = (mixBlendMode=='normal')?'source-over':mixBlendMode;
                    ctx.drawImage(canvas.canvas, Math.round(x)-LOOKING_GLASS_RADIUS, Math.round(y)-LOOKING_GLASS_RADIUS, LOOKING_GLASS_DIAMETER, LOOKING_GLASS_DIAMETER, 0, 0, LOOKING_GLASS_DIAMETER, LOOKING_GLASS_DIAMETER);
                }
            }
        }

        return {
            setup(){
                const { buffer } = drawing.editorState;
                buffer.ctx.resetTransform();
            },
            dispose(){
            },
            click: () => {
                const [r, g, b] = lookingGlassSelection.ctx.getImageData(LOOKING_GLASS_RADIUS, LOOKING_GLASS_RADIUS, 1, 1).data;
                const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
                console.log(color);
            },
            mouseDown({ point }){
                setSelecting(true);
                setPoint(point);
                render(point);
                upscale();
            },
            mouseMove({ point }){
                setPoint(point);
                render(point);
                upscale();
            },
            mouseUp({ point }){
                setSelecting(false);
                setPoint(point);
                render(point);
                upscale();
            },
        };
    }, [drawing.data, drawing.editorState, lookingGlassSelection, lookingGlassUpscale]);
    useEffect(()=>{
        r.setup();
        return ()=>{
            r.dispose();
        };
    }, [r]);
    return <ToolContext.Provider value={r}>
        {selecting&&<div className='Canvas' style={{
            position: 'absolute',
            zIndex: 100,
            background: 'transparent',
            pointerEvents: 'none',
            overflow: 'visible',
        }}>
            <div style={{ position: 'absolute', transform: transform.toString() }}>
                <div style={{ position: 'absolute', left: `${x}px`, top: `${y}px`, transform: normalizationMatrix.toString() }}>
                    <div style={{
                        position: 'absolute',
                        left: `${LOOKING_GLASS_RADIUS}px`,
                        bottom: `${LOOKING_GLASS_RADIUS}px`,
                        overflow: 'hidden',
                        display: 'flex',
                        transform: rotated.toString(),
                        borderRadius: `${(LOOKING_GLASS_RADIUS+.5)*LOOKING_GLASS_SCALE}px`
                    }}>
                        <div style={{
                            position: 'absolute',
                            boxSizing: 'border-box',
                            border: 'solid 1px var(--main-color)',
                            top: `${LOOKING_GLASS_RADIUS*LOOKING_GLASS_SCALE}px`,
                            left: `${LOOKING_GLASS_RADIUS*LOOKING_GLASS_SCALE}px`,
                            width: `${LOOKING_GLASS_SCALE}px`,
                            height: `${LOOKING_GLASS_SCALE}px`
                        }}></div>
                        <Drawable canvas={lookingGlassUpscale.canvas} style={{ display: 'flex' }}></Drawable>
                    </div>
                </div>
            </div>
        </div>}
        {children}
    </ToolContext.Provider>;
};
